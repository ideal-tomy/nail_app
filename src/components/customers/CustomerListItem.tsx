import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/messageTemplates'
import type { Customer, CustomerStatus } from '../../types/database'

interface CustomerListItemProps {
  customer: Customer
  status?: CustomerStatus
}

export function CustomerListItem({ customer, status }: CustomerListItemProps) {
  return (
    <Link
      to={`/customers/${customer.id}`}
      className="block rounded-2xl border border-petal/60 bg-blush/50 px-3 py-3 transition hover:bg-blush sm:rounded-3xl sm:px-4 sm:py-4"
    >
      <p className="truncate font-medium text-ink">{customer.name}</p>
      {customer.contact && (
        <p className="mt-1 truncate text-xs text-mauve sm:text-sm">{customer.contact}</p>
      )}
      <p className="mt-2 text-xs text-mauve">
        {status?.last_visit ? formatDate(status.last_visit) : '来店なし'}
      </p>
    </Link>
  )
}
