import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  formatCancelSource,
  isTodayReservation,
  isTomorrowReservation,
} from '../../lib/reservationOps'
import {
  formatReservationDate,
  formatReservationTime,
} from '../../hooks/useReservations'
import type { BackNavigationState } from '../../lib/navigationState'
import type { ReservationWithCustomer } from '../../types/database'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { PreDayReminderModal } from './PreDayReminderModal'

interface ReservationListItemProps {
  reservation: ReservationWithCustomer
  onEdit?: () => void
  onReschedule?: () => void
  onCancel?: () => void
  onConvert?: () => void
  onConfirm?: () => void
  compact?: boolean
  customerBackState?: BackNavigationState
}

const statusLabels = {
  booked: '予約済',
  done: '来店済',
  canceled: 'キャンセル',
  no_show: '無断キャンセル',
} as const

const statusColors = {
  booked: 'bg-petal text-plum',
  done: 'bg-blush text-mauve',
  canceled: 'bg-mauve/20 text-mauve',
  no_show: 'bg-plum/20 text-plum',
} as const

export function ReservationListItem({
  reservation,
  onEdit,
  onReschedule,
  onCancel,
  onConvert,
  onConfirm,
  compact = false,
  customerBackState,
}: ReservationListItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [showReminder, setShowReminder] = useState(false)

  const customerName = reservation.customers?.name ?? '不明'
  const isBooked = reservation.status === 'booked'
  const isPastCanceled =
    reservation.status === 'canceled' || reservation.status === 'no_show'
  const urgency =
    isBooked && isTodayReservation(reservation.start_at)
      ? 'today'
      : isBooked && isTomorrowReservation(reservation.start_at)
        ? 'tomorrow'
        : null

  const hasActions = Boolean(
    isBooked && (onEdit || onReschedule || onCancel || onConvert || onConfirm),
  )
  const showFullActions =
    hasActions && (urgency === 'today' || urgency === 'tomorrow' || expanded)

  return (
    <Card
      padding={compact ? 'sm' : 'md'}
      className={
        urgency === 'today'
          ? 'ring-2 ring-plum/40'
          : urgency === 'tomorrow'
            ? 'ring-1 ring-mauve/50'
            : ''
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/customers/${reservation.customer_id}`}
              state={customerBackState}
              className="font-medium text-ink hover:text-plum"
            >
              {customerName}
            </Link>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${statusColors[reservation.status]}`}
            >
              {statusLabels[reservation.status]}
            </span>
            {urgency === 'today' && (
              <span className="rounded-full bg-plum px-2 py-0.5 text-xs text-porcelain">
                本日
              </span>
            )}
            {urgency === 'tomorrow' && (
              <span className="rounded-full bg-mauve/30 px-2 py-0.5 text-xs text-plum">
                明日
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-mauve">
            {formatReservationDate(reservation.start_at)}{' '}
            {formatReservationTime(reservation.start_at)}
            {reservation.duration_min != null && ` · ${reservation.duration_min}分`}
          </p>
          {reservation.menu && (
            <p className="mt-1 text-sm text-ink">{reservation.menu}</p>
          )}
          {reservation.notes && !compact && (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-mauve">
              {reservation.notes}
            </p>
          )}
          {isPastCanceled && reservation.cancel_reason && (
            <p className="mt-2 text-xs text-mauve">
              {formatCancelSource(reservation.cancel_source)}: {reservation.cancel_reason}
            </p>
          )}
          {reservation.customers?.booking_notes && isBooked && (
            <p className="mt-2 rounded-xl bg-petal/40 px-2 py-1 text-xs text-plum">
              予約メモ: {reservation.customers.booking_notes}
            </p>
          )}
        </div>
      </div>

      {hasActions && !showFullActions && (
        <div className="mt-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setExpanded(true)}
          >
            詳細
          </Button>
        </div>
      )}

      {showFullActions && (
        <div className="mt-3 space-y-3">
          {urgency === 'tomorrow' && (
            <Button
              variant="line"
              className="w-full"
              onClick={() => setShowReminder(true)}
            >
              前日リマインド
            </Button>
          )}

          {onConfirm && (
            <Button variant="line" className="w-full" onClick={onConfirm}>
              予約確定（LINE通知）
            </Button>
          )}

          {(onReschedule || onCancel) && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-mauve">予約の変更</p>
              {onReschedule && (
                <Button variant="secondary" className="w-full" onClick={onReschedule}>
                  日時変更
                </Button>
              )}
              {onCancel && (
                <Button
                  variant="ghost"
                  className="w-full border border-mauve/50 text-plum"
                  onClick={onCancel}
                >
                  予約をキャンセル
                </Button>
              )}
            </div>
          )}

          {(onConvert || onEdit) && (
            <div className="space-y-2 border-t border-petal/60 pt-3">
              <p className="text-xs font-medium text-mauve">来店・詳細</p>
              <div className="grid grid-cols-2 gap-2">
                {onConvert && (
                  <Button className="w-full" onClick={onConvert}>
                    来店記録
                  </Button>
                )}
                {onEdit && (
                  <Button variant="secondary" className="w-full" onClick={onEdit}>
                    詳細編集
                  </Button>
                )}
              </div>
            </div>
          )}

          {expanded && urgency !== 'today' && urgency !== 'tomorrow' && (
            <Button
              variant="ghost"
              className="w-full text-xs text-mauve"
              onClick={() => setExpanded(false)}
            >
              閉じる
            </Button>
          )}
        </div>
      )}

      <PreDayReminderModal
        open={showReminder}
        onClose={() => setShowReminder(false)}
        reservation={reservation}
      />
    </Card>
  )
}
