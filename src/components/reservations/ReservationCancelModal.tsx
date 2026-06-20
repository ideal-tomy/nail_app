import { useState } from 'react'
import { CANCEL_REASON_PRESETS } from '../../lib/reservationOps'
import { useReservationMutations } from '../../hooks/useReservations'
import type { CancelSource, ReservationWithCustomer } from '../../types/database'
import { Button } from '../ui/Button'

interface ReservationCancelModalProps {
  reservation: ReservationWithCustomer
  onClose: () => void
  onSuccess: () => void
}

export function ReservationCancelModal({
  reservation,
  onClose,
  onSuccess,
}: ReservationCancelModalProps) {
  const { cancelWithReason, remove } = useReservationMutations()
  const [cancelSource, setCancelSource] = useState<CancelSource>('customer')
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const customerName = reservation.customers?.name ?? 'お客様'
  const presets = CANCEL_REASON_PRESETS[cancelSource]

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const finalReason = customReason.trim() || reason
    if (!finalReason) {
      setError('理由を選択または入力してください')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await cancelWithReason.mutateAsync({
        id: reservation.id,
        cancelSource,
        cancelReason: finalReason,
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'キャンセルに失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (
      !window.confirm(
        '誤登録の予約を完全に削除しますか？\n（キャンセル記録は残りません）',
      )
    ) {
      return
    }

    setSaving(true)
    try {
      await remove.mutateAsync(reservation.id)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '削除に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm leading-relaxed text-mauve">
        {customerName} さんの予約をキャンセルします。理由を記録しておくと、後から傾向を把握できます。
      </p>

      <div className="space-y-2">
        <span className="text-sm font-medium text-ink">キャンセル区分</span>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CANCEL_REASON_PRESETS) as CancelSource[]).map((source) => (
            <button
              key={source}
              type="button"
              onClick={() => {
                setCancelSource(source)
                setReason('')
              }}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                cancelSource === source
                  ? 'bg-petal text-plum'
                  : 'bg-blush text-mauve hover:text-ink'
              }`}
            >
              {CANCEL_REASON_PRESETS[source].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-ink">理由</span>
        <div className="flex flex-wrap gap-2">
          {presets.reasons.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setReason(preset)
                setCustomReason('')
              }}
              className={`rounded-xl px-3 py-1.5 text-xs transition ${
                reason === preset
                  ? 'bg-plum text-porcelain'
                  : 'border border-petal bg-blush/50 text-ink hover:bg-petal/50'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <input
          value={customReason}
          onChange={(e) => {
            setCustomReason(e.target.value)
            setReason('')
          }}
          className="field-input"
          placeholder="その他の理由を入力"
        />
      </div>

      {error && <p className="text-sm text-plum">{error}</p>}

      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? '処理中...' : 'キャンセルを確定'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={onClose}
          disabled={saving}
        >
          戻る
        </Button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={saving}
          className="w-full py-2 text-xs text-mauve underline hover:text-plum"
        >
          誤登録のため完全に削除
        </button>
      </div>
    </form>
  )
}
