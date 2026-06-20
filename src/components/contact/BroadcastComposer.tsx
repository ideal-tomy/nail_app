import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { copyMessage, sendViaLine } from '../../lib/line'
import {
  broadcastTemplates,
  buildBroadcastMessage,
  isContactRecommended,
} from '../../lib/messageTemplates'
import { supabase } from '../../lib/supabase'
import { useContactRecommendations } from '../../hooks/useContactRecommendations'
import { useCustomers, useCustomerStatuses } from '../../hooks/useCustomers'
import type { Customer } from '../../types/database'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useToast } from '../ui/Toast'

type TargetMode = 'all' | 'recommended' | 'manual'

export function BroadcastComposer() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { data: customers = [] } = useCustomers()
  const { data: statuses = [] } = useCustomerStatuses()
  const { recommendations } = useContactRecommendations()

  const [targetMode, setTargetMode] = useState<TargetMode>('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [templateId, setTemplateId] = useState(broadcastTemplates[0].id)
  const [message, setMessage] = useState(buildBroadcastMessage(broadcastTemplates[0]))
  const [saving, setSaving] = useState(false)

  const recommendedIds = useMemo(
    () => new Set(recommendations.map((r) => r.id)),
    [recommendations],
  )

  const statusMap = useMemo(
    () => new Map(statuses.map((s) => [s.id, s])),
    [statuses],
  )

  const targetCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    let list: Customer[] = customers

    if (targetMode === 'recommended') {
      list = customers.filter((c) => recommendedIds.has(c.id))
    } else if (targetMode === 'manual') {
      list = customers.filter((c) => selectedIds.has(c.id))
    }

    if (normalizedSearch) {
      list = list.filter((c) => c.name.toLowerCase().includes(normalizedSearch))
    }

    return list.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  }, [customers, targetMode, recommendedIds, selectedIds, search])

  const effectiveTargets = useMemo(() => {
    if (targetMode === 'manual') {
      return customers.filter((c) => selectedIds.has(c.id))
    }
    if (targetMode === 'recommended') {
      return customers.filter((c) => recommendedIds.has(c.id))
    }
    return customers
  }, [customers, targetMode, selectedIds, recommendedIds])

  const handleTemplateChange = (nextId: string) => {
    setTemplateId(nextId)
    const template =
      broadcastTemplates.find((t) => t.id === nextId) ?? broadcastTemplates[0]
    setMessage(buildBroadcastMessage(template))
  }

  const toggleCustomer = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCopy = async () => {
    await copyMessage(message)
    showToast('文面をコピーしました')
  }

  const handleSendLine = () => {
    sendViaLine(message)
  }

  const handleMarkAllContacted = async () => {
    if (effectiveTargets.length === 0) {
      showToast('対象の顧客がいません')
      return
    }

    if (
      !window.confirm(
        `${effectiveTargets.length}名を連絡済みに記録しますか？`,
      )
    ) {
      return
    }

    setSaving(true)
    try {
      const rows = effectiveTargets.map((customer) => ({
        customer_id: customer.id,
        channel: 'line',
        message,
      }))

      const { error } = await supabase.from('contact_logs').insert(rows)
      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['customer-status'] })
      await queryClient.invalidateQueries({ queryKey: ['contact-recommendations'] })
      showToast(`${effectiveTargets.length}名を連絡済みにしました`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : '記録に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <h3 className="text-base font-medium text-ink">送信対象</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ['all', '全員'],
              ['recommended', '連絡推奨のみ'],
              ['manual', '手動選択'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setTargetMode(mode)}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                targetMode === mode
                  ? 'bg-petal text-plum'
                  : 'bg-blush text-mauve hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-mauve">
          対象: {effectiveTargets.length}名
        </p>
      </Card>

      {targetMode === 'manual' && (
        <Card>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input"
            placeholder="名前で検索"
          />
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {customers.map((customer) => {
              const status = statusMap.get(customer.id)
              const recommended = isContactRecommended(
                status?.days_since ?? null,
                status?.last_visit ?? null,
                status?.last_contact ?? null,
              )
              return (
                <label
                  key={customer.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-petal/30"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(customer.id)}
                    onChange={() => toggleCustomer(customer.id)}
                    className="h-4 w-4 accent-plum"
                  />
                  <span className="flex-1 text-sm text-ink">{customer.name}</span>
                  {recommended && (
                    <span className="text-xs text-plum">推奨</span>
                  )}
                </label>
              )
            })}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="text-base font-medium text-ink">送信先リスト</h3>
        <p className="mt-1 text-xs text-mauve">
          LINEで送る際、以下の方を選択してください
        </p>
        <ul className="mt-3 max-h-32 space-y-1 overflow-y-auto text-sm text-ink">
          {targetCustomers.length === 0 ? (
            <li className="text-mauve">対象の顧客がいません</li>
          ) : (
            targetCustomers.map((c) => (
              <li key={c.id}>
                {c.name}
                {c.contact && (
                  <span className="ml-2 text-mauve">({c.contact})</span>
                )}
              </li>
            ))
          )}
        </ul>
      </Card>

      <Card>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">テンプレート</span>
          <select
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="field-input"
          >
            {broadcastTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium text-ink">文面</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="field-input min-h-32"
          />
        </label>

        <p className="mt-2 text-xs leading-relaxed text-mauve">
          「LINEで送る」はスマホ向けです。共有画面で上記の送信先を手動で複数選択してください。
        </p>

        <div className="mt-4 space-y-3">
          <Button variant="line" className="w-full" onClick={handleSendLine}>
            LINEで送る
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleCopy}>
            文面をコピー
          </Button>
          <Button
            className="w-full"
            onClick={handleMarkAllContacted}
            disabled={saving || effectiveTargets.length === 0}
          >
            {saving
              ? '記録中...'
              : `選んだ全員を連絡済みにする（${effectiveTargets.length}名）`}
          </Button>
        </div>
      </Card>
    </div>
  )
}
