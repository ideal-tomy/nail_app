import { Link } from 'react-router-dom'
import { backState } from '../../lib/navigationState'
import type { Customer, CustomerStatus, Reservation, VisitWithImages } from '../../types/database'
import { CustomerSummaryCard } from './CustomerSummaryCard'

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
  return (
    <Link
      to={`/customers/${customer.id}`}
      state={backState('/customers', '顧客一覧へ')}
      className="block min-w-0"
    >
      <CustomerSummaryCard
        customerName={customer.name}
        status={status}
        latestVisit={latestVisit}
        upcomingReservation={upcomingReservation}
        variant="tile"
        className="h-full transition hover:bg-blush active:bg-petal/30"
      />
    </Link>
  )
}
