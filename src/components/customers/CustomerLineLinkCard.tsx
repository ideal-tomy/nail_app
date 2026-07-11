import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { pushOfficialLineMessage } from '../../lib/lineOfficial'
import { supabase } from '../../lib/supabase'
import type { Customer } from '../../types/database'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { useToast } from '../ui/Toast'

interface CustomerLineLinkCardProps {
  customer: Customer
}

export function CustomerLineLinkCard({ customer }: CustomerLineLinkCardProps) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [userId, setUserId] = useState(customer.line_user_id ?? '')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setUserId(customer.line_user_id ?? '')
  }, [customer.line_user_id])

  const isLinked = Boolean(customer.line_user_id)

  const handleSave = async () => {
    const trimmed = userId.trim()
    if (trimmed && !trimmed.startsWith('U')) {
      showToast('LINE userId は U で始まる文字列です')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          line_user_id: trimmed || null,
          line_display_name: trimmed
            ? customer.line_display_name
            : null,
        })
        .eq('id', customer.id)

      if (error) throw error

      if (trimmed) {
        const now = new Date().toISOString()
        await supabase.from('line_followers').upsert(
          {
            line_user_id: trimmed,
            display_name: customer.line_display_name,
            customer_id: customer.id,
            linked_at: now,
            unfollowed_at: null,
            updated_at: now,
          },
          { onConflict: 'line_user_id' },
        )
      }

      await queryClient.invalidateQueries({ queryKey: ['customer', customer.id] })
      await queryClient.invalidateQueries({ queryKey: ['customers'] })
      await queryClient.invalidateQueries({ queryKey: ['line-followers'] })
      showToast(trimmed ? 'LINE連携を保存しました' : 'LINE連携を解除しました')
    } catch (error) {
      showToast(error instanceof Error ? error.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleTestPush = async () => {
    setSending(true)
    try {
      await pushOfficialLineMessage(
        customer.id,
        `【テスト】${customer.name} さん宛の公式LINE送信テストです`,
      )
      showToast('公式LINEへテスト送信しました')
    } catch (error) {
      showToast(error instanceof Error ? error.message : '送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium text-ink">公式LINE連携</h3>
          <p className="mt-1 text-xs leading-relaxed text-mauve">
            友だち追加だけではアプリに出ません。userId を顧客に紐づける必要があります。
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs ${
            isLinked ? 'bg-petal text-plum' : 'bg-blush text-mauve'
          }`}
        >
          {isLinked ? '連携済み' : '未連携'}
        </span>
      </div>

      {customer.line_display_name && (
        <p className="mt-3 text-sm text-ink">
          LINE表示名: {customer.line_display_name}
        </p>
      )}

      <label className="mt-4 block space-y-2">
        <span className="text-sm font-medium text-ink">LINE userId</span>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="field-input font-mono text-xs"
          placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        />
      </label>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '連携を保存'}
        </Button>
        <Button
          variant="line"
          className="flex-1"
          onClick={handleTestPush}
          disabled={!isLinked || sending}
        >
          {sending ? '送信中...' : 'テスト送信'}
        </Button>
      </div>
    </Card>
  )
}
