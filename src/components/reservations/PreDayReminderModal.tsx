import { useEffect, useState } from 'react'
import { buildDayBeforeReminderMessage } from '../../lib/messageTemplates'
import { copyMessage, sendViaLine } from '../../lib/line'
import type { ReservationWithCustomer } from '../../types/database'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { useToast } from '../ui/Toast'

interface PreDayReminderModalProps {
  open: boolean
  onClose: () => void
  reservation: ReservationWithCustomer | null
}

export function PreDayReminderModal({
  open,
  onClose,
  reservation,
}: PreDayReminderModalProps) {
  const { showToast } = useToast()
  const [message, setMessage] = useState('')

  const customerName = reservation?.customers?.name ?? 'お客様'

  useEffect(() => {
    if (!open || !reservation) return
    setMessage(
      buildDayBeforeReminderMessage(
        customerName,
        reservation.start_at,
        reservation.duration_min,
      ),
    )
  }, [open, reservation, customerName])

  if (!reservation) return null

  const handleCopy = async () => {
    await copyMessage(message)
    showToast('文面をコピーしました')
  }

  const handleSendLine = () => {
    sendViaLine(message)
  }

  return (
    <Modal open={open} onClose={onClose} title="前日リマインド">
      <div className="space-y-4">
        <p className="text-sm text-mauve">
          {customerName} さんへの前日リマインド文面です。必要に応じて編集してください。
        </p>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">文面</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="field-input min-h-32"
          />
        </label>

        <p className="text-xs leading-relaxed text-mauve">
          「LINEで送る」はスマホ向けです。PCでは「文面をコピー」をご利用ください。
        </p>

        <div className="space-y-3">
          <Button variant="line" className="w-full" onClick={handleSendLine}>
            LINEで送る
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleCopy}>
            文面をコピー
          </Button>
        </div>
      </div>
    </Modal>
  )
}
