import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  formatReservationTime,
  useTomorrowReservations,
} from '../../hooks/useReservations'
import { backState } from '../../lib/navigationState'
import type { ReservationWithCustomer } from '../../types/database'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { PreDayReminderModal } from '../reservations/PreDayReminderModal'

export function TomorrowReminderSection() {
  const { data: tomorrowReservations = [], isLoading } = useTomorrowReservations()
  const [selected, setSelected] = useState<ReservationWithCustomer | null>(null)

  if (isLoading || tomorrowReservations.length === 0) {
    return null
  }

  return (
    <section className="space-y-3">
      <h3 className="text-base font-medium text-ink">明日の予約</h3>

      <div className="space-y-2">
        {tomorrowReservations.map((reservation) => {
          const customerName = reservation.customers?.name ?? '不明'

          return (
            <Card key={reservation.id} padding="sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/customers/${reservation.customer_id}`}
                    state={backState('/', 'ホームへ')}
                    className="font-medium text-ink hover:text-plum"
                  >
                    {customerName}
                  </Link>
                  <p className="mt-0.5 text-sm text-mauve">
                    {formatReservationTime(reservation.start_at)}
                    {reservation.duration_min != null &&
                      ` · ${reservation.duration_min}分`}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="shrink-0 text-xs"
                  onClick={() => setSelected(reservation)}
                >
                  前日リマインド
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <PreDayReminderModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        reservation={selected}
      />
    </section>
  )
}
