import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  buildMessage,
  messageTemplates,
} from '../../lib/messageTemplates'
import { copyMessage, sendViaLine } from '../../lib/line'
import { pushOfficialLineMessage } from '../../lib/lineOfficial'
import { supabase } from '../../lib/supabase'
import type { VisitWithImages } from '../../types/database'
import { SignedImage } from '../images/SignedImage'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'

interface MessageEditorModalProps {
  open: boolean
  onClose: () => void
  customerId: string
  customerName: string
  latestVisit: VisitWithImages | null
  canPushOfficial?: boolean
}

export function MessageEditorModal({
  open,
  onClose,
  customerId,
  customerName,
  latestVisit,
  canPushOfficial = false,
}: MessageEditorModalProps) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [templateId, setTemplateId] = useState(messageTemplates[0].id)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [pushing, setPushing] = useState(false)

  const latestImage = latestVisit?.visit_images?.[0]
  const lastDesign = latestVisit?.design_notes ?? 'デザイン'

  useEffect(() => {
    if (!open) return
    const template =
      messageTemplates.find((item) => item.id === templateId) ??
      messageTemplates[0]
    setMessage(buildMessage(template, customerName, lastDesign))
  }, [open, templateId, customerName, lastDesign])

  const handleTemplateChange = (nextTemplateId: string) => {
    setTemplateId(nextTemplateId)
    const template =
      messageTemplates.find((item) => item.id === nextTemplateId) ??
      messageTemplates[0]
    setMessage(buildMessage(template, customerName, lastDesign))
  }

  const handleCopy = async () => {
    await copyMessage(message)
    showToast('文面をコピーしました')
  }

  const handleSendLine = () => {
    sendViaLine(message)
  }

  const handlePushOfficial = async () => {
    setPushing(true)
    try {
      await pushOfficialLineMessage(customerId, message)
      await queryClient.invalidateQueries({ queryKey: ['customer-status'] })
      await queryClient.invalidateQueries({ queryKey: ['contact-recommendations'] })
      showToast('公式LINEへ送信しました')
      onClose()
    } catch (pushError) {
      showToast(
        pushError instanceof Error ? pushError.message : '公式LINE送信に失敗しました',
      )
    } finally {
      setPushing(false)
    }
  }

  const handleMarkContacted = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('contact_logs').insert({
        customer_id: customerId,
        channel: 'line',
        message,
      })
      if (error) throw error

      await queryClient.invalidateQueries({ queryKey: ['customer-status'] })
      await queryClient.invalidateQueries({ queryKey: ['contact-recommendations'] })
      showToast('連絡済みにしました')
      onClose()
    } catch (markError) {
      showToast(
        markError instanceof Error ? markError.message : '記録に失敗しました',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="文面を編集">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-petal/70 bg-blush/40">
          <SignedImage
            storagePath={latestImage?.storage_path}
            alt={`${customerName} の前回デザイン`}
            className="aspect-video w-full"
          />
          <div className="p-3">
            <p className="text-sm text-mauve">前回デザイン</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">
              {lastDesign}
            </p>
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">テンプレート</span>
          <select
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="field-input"
          >
            {messageTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">文面</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="field-input min-h-32"
          />
        </label>

        <p className="text-xs leading-relaxed text-mauve">
          「LINEで送る」は共有画面での手動送信です。公式LINE連携済みなら「公式LINEで送る」が使えます。
        </p>

        <div className="space-y-3">
          {canPushOfficial && (
            <Button
              variant="line"
              className="w-full"
              onClick={handlePushOfficial}
              disabled={pushing}
            >
              {pushing ? '送信中...' : '公式LINEで送る'}
            </Button>
          )}
          <Button
            variant={canPushOfficial ? 'secondary' : 'line'}
            className="w-full"
            onClick={handleSendLine}
          >
            LINEで共有（手動）
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleCopy}>
            文面をコピー
          </Button>
          <Button
            className="w-full"
            onClick={handleMarkContacted}
            disabled={saving}
          >
            {saving ? '記録中...' : '連絡済みにする'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
