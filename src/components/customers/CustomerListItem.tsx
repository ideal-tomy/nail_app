import { Link } from 'react-router-dom'
import {
  formatReservationDate,
  formatReservationTime,
} from '../../hooks/useReservations'
import { formatDate, formatDaysSince } from '../../lib/messageTemplates'
import type { Customer, CustomerStatus, Reservation, VisitWithImages } from '../../types/database'
import { SignedImage } from '../images/SignedImage'
import { Card } from '../ui/Card'

interface CustomerListItemProps {
  customer: Customer
  status?: CustomerStatus
  latestVisit?: VisitWithImages | null
  upcomingReservation?: Reservation | null
}

export function CustomerListItem({
  customer,
  status,
  latestVisit = null,
  upcomingReservation = null,
}: CustomerListItemProps) {
  const latestImage = latestVisit?.visit_images?.[0]

  return (
    <Link to={`/customers/${customer.id}`} className="block min-w-0">
      <Card
        padding="sm"
        className="h-full overflow-hidden p-0 transition hover:bg-blush active:bg-petal/30"
      >
        <div className="flex gap-1.5 p-1.5">
          <div className="w-[3.25rem] shrink-0">
            <SignedImage
              storagePath={latestImage?.storage_path}
              alt={`${customer.name} の前回デザイン`}
              className="aspect-square w-full rounded-lg"
            />
            <p className="mt-1 line-clamp-2 text-center text-[10px] font-medium leading-tight text-ink">
              {customer.name}
            </p>
          </div>

          <div className="min-w-0 flex-1">
            {status?.days_since != null && (
              <div className="flex justify-end">
                <span className="rounded-full bg-petal px-1 py-0.5 text-[8px] text-plum">
                  {formatDaysSince(status.days_since)}
                </span>
              </div>
            )}

            {status?.last_visit && (
              <span className="mt-0.5 inline-block rounded-full bg-blush px-1 py-0.5 text-[9px] text-plum">
                前回 {formatDate(status.last_visit)}
              </span>
            )}

            <p className="mt-1 line-clamp-3 text-[9px] leading-snug text-mauve">
              来店予定{' '}
              <span className="text-ink">
                {upcomingReservation
                  ? `${formatReservationDate(upcomingReservation.start_at)} ${formatReservationTime(upcomingReservation.start_at)}`
                  : '予定無し'}
              </span>
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
