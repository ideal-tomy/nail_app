import { useState } from 'react'
import { checkReservationOverlap } from '../../lib/reservationOps'
import {
  toLocalDatetimeValue,
  useReservationMutations,
  useUpcomingReservations,
} from '../../hooks/useReservations'
import type { ReservationWithCustomer } from '../../types/database'
import { Button } from '../ui/Button'

interface ReservationRescheduleModalProps {
  reservation: ReservationWithCustomer
  onClose: () => void
  onSuccess: () => void
}

export function ReservationRescheduleModal({
  reservation,
  onClose,
  onSuccess,
}: ReservationRescheduleModalProps) {
  const { reschedule } = useReservationMutations()
  const { data: upcoming = [] } = useUpcomingReservations()
  const [newStartAt, setNewStartAt] = useState(
    toLocalDatetimeValue(reservation.start_at),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const customerName = reservation.customers?.name ?? 'お客様'
  const overlap = checkReservationOverlap(
    new Date(newStartAt).toISOString(),
    reservation.duration_min,
    upcoming,
    reservation.id,
  )

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (newStartAt === toLocalDatetimeValue(reservation.start_at)) {
      setError('日時が変更されていません')
      return
    }

    if (overlap) {
      const confirmOverlap = window.confirm(
        `${overlap.customers?.name ?? '別の'}予約と時間が重なっています。このまま変更しますか？`,
      )
      if (!confirmOverlap) return
    }

    setSaving(true)
    setError(null)
    try {
      await reschedule.mutateAsync({
        id: reservation.id,
        reservation,
        newStartAt: new Date(newStartAt).toISOString(),
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : '変更に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm leading-relaxed text-mauve">
        {customerName} さんの予約日時を変更します。変更履歴はメモに自動記録されます。
      </p>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">新しい予約日時</span>
        <input
          type="datetime-local"
          value={newStartAt}
          onChange={(e) => setNewStartAt(e.target.value)}
          className="field-input"
          required
        />
      </label>

      {overlap && (
        <p className="rounded-xl border border-petal bg-petal/30 px-3 py-2 text-sm text-plum">
          ⚠ {overlap.customers?.name} さんの予約（
          {new Date(overlap.start_at).toLocaleString('ja-JP')}）と重なります
        </p>
      )}

      {error && <p className="text-sm text-plum">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          閉じる
        </Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? '変更中...' : '日時を変更'}
        </Button>
      </div>
    </form>
  )
}
