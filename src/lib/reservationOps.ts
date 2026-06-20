import type { CancelSource, ReservationWithCustomer } from '../types/database'

export const CANCEL_REASON_PRESETS: Record<
  CancelSource,
  { label: string; reasons: string[] }
> = {
  customer: {
    label: 'お客様都合',
    reasons: [
      '日程都合が合わなくなった',
      '体調不良',
      '予定変更のため',
      '他店利用',
    ],
  },
  salon: {
    label: 'サロン都合',
    reasons: [
      'ネイリスト体調不良',
      '設備トラブル',
      '定休日変更',
      '枠調整のため',
    ],
  },
  no_show: {
    label: '無断キャンセル',
    reasons: [
      '連絡なし未来店',
      '当日連絡なし',
      '大幅遅刻のため施術不可',
    ],
  },
}

export function isUpcomingReservation(reservation: ReservationWithCustomer): boolean {
  if (reservation.status !== 'booked') return false
  return new Date(reservation.start_at) >= new Date()
}

export function isTodayReservation(startAt: string): boolean {
  const date = new Date(startAt)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export function isTomorrowReservation(startAt: string): boolean {
  const date = new Date(startAt)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate()
  )
}

export function checkReservationOverlap(
  startAt: string,
  durationMin: number | null,
  existing: ReservationWithCustomer[],
  excludeId?: string,
): ReservationWithCustomer | null {
  const start = new Date(startAt).getTime()
  const end = start + (durationMin ?? 60) * 60 * 1000

  for (const reservation of existing) {
    if (excludeId && reservation.id === excludeId) continue
    if (reservation.status !== 'booked') continue

    const otherStart = new Date(reservation.start_at).getTime()
    const otherEnd = otherStart + (reservation.duration_min ?? 60) * 60 * 1000

    if (start < otherEnd && end > otherStart) {
      return reservation
    }
  }

  return null
}

export function appendRescheduleNote(
  oldStartAt: string,
  newStartAt: string,
  existingNotes: string | null,
): string {
  const oldDate = new Date(oldStartAt).toLocaleString('ja-JP')
  const newDate = new Date(newStartAt).toLocaleString('ja-JP')
  const line = `[日時変更] ${oldDate} → ${newDate}`
  return existingNotes ? `${line}\n${existingNotes}` : line
}

export function formatCancelSource(source: CancelSource | null): string {
  if (!source) return ''
  return CANCEL_REASON_PRESETS[source].label
}
