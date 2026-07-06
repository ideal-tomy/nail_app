import { Link } from 'react-router-dom'
import {
  formatReservationTimeRange,
} from '../../hooks/useReservations'
import type { ReservationWithCustomer } from '../../types/database'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'

interface TodayReservationTimelineProps {
  reservations: ReservationWithCustomer[]
  isLoading: boolean
}

export function TodayReservationTimeline({
  reservations,
  isLoading,
}: TodayReservationTimelineProps) {
  if (isLoading) {
    return <p className="text-sm text-mauve">読み込み中...</p>
  }

  if (reservations.length === 0) {
    return (
      <div className="space-y-3">
        <EmptyState
          title="今日は予定がありません"
          description="カレンダーから予約を追加できます"
        />
        <Link to="/calendar">
          <Button variant="secondary" className="w-full">
            予約を追加
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {reservations.map((reservation) => {
        const customerName = reservation.customers?.name ?? '不明'

        return (
          <Link
            key={reservation.id}
            to={`/customers/${reservation.customer_id}`}
            className="block"
          >
            <Card padding="sm" className="transition active:bg-petal/40">
              <div className="flex items-center gap-3">
                <div className="shrink-0 rounded-xl bg-petal/60 px-2.5 py-1.5 text-center">
                  <p className="text-xs font-medium leading-tight text-plum">
                    {formatReservationTimeRange(
                      reservation.start_at,
                      reservation.duration_min,
                    )}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium text-ink">{customerName}</p>
                  {reservation.menu && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-mauve">
                      {reservation.menu}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
