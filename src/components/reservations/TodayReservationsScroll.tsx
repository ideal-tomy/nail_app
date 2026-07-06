import { useState } from 'react'
import { formatReservationTimeRange } from '../../hooks/useReservations'
import type { BackNavigationState } from '../../lib/navigationState'
import type { ReservationWithCustomer } from '../../types/database'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { HorizontalScroll, ScrollCard } from '../ui/HorizontalScroll'
import { Modal } from '../ui/Modal'
import { ReservationListItem } from './ReservationListItem'

interface ReservationActionHandlers {
  onEdit?: () => void
  onReschedule?: () => void
  onCancel?: () => void
  onConvert?: () => void
  onConfirm?: () => void
}

interface TodayReservationsScrollProps {
  reservations: ReservationWithCustomer[]
  customerBackState: BackNavigationState
  reservationActions: (reservation: ReservationWithCustomer) => ReservationActionHandlers
}

function TodayReservationCompactCard({
  reservation,
  onOpen,
}: {
  reservation: ReservationWithCustomer
  onOpen: () => void
}) {
  const customerName = reservation.customers?.name ?? '不明'

  return (
    <Card padding="sm" className="flex h-full flex-col overflow-hidden p-0">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-2.5">
        <div className="rounded-xl bg-petal/70 px-2.5 py-1.5 text-center">
          <p className="text-[11px] font-medium leading-tight text-plum">
            {formatReservationTimeRange(
              reservation.start_at,
              reservation.duration_min,
            )}
          </p>
        </div>
        <p className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-ink">
          {customerName}
        </p>
      </div>

      <div className="border-t border-petal/50 px-2.5 py-2">
        <Button
          variant="secondary"
          className="w-full px-2 text-[10px]"
          onClick={onOpen}
        >
          詳細
        </Button>
      </div>
    </Card>
  )
}

export function TodayReservationsScroll({
  reservations,
  customerBackState,
  reservationActions,
}: TodayReservationsScrollProps) {
  const [selected, setSelected] = useState<ReservationWithCustomer | null>(null)

  const wrapAction = (action?: () => void) => {
    if (!action) return undefined
    return () => {
      setSelected(null)
      action()
    }
  }

  const selectedActions = selected ? reservationActions(selected) : null

  return (
    <>
      <HorizontalScroll>
        {reservations.map((reservation) => (
          <ScrollCard key={reservation.id}>
            <TodayReservationCompactCard
              reservation={reservation}
              onOpen={() => setSelected(reservation)}
            />
          </ScrollCard>
        ))}
      </HorizontalScroll>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.customers?.name ?? '予約'} さん` : '本日の予約'}
      >
        {selected && selectedActions && (
          <ReservationListItem
            reservation={selected}
            customerBackState={customerBackState}
            onEdit={wrapAction(selectedActions.onEdit)}
            onReschedule={wrapAction(selectedActions.onReschedule)}
            onCancel={wrapAction(selectedActions.onCancel)}
            onConvert={wrapAction(selectedActions.onConvert)}
            onConfirm={wrapAction(selectedActions.onConfirm)}
          />
        )}
      </Modal>
    </>
  )
}
