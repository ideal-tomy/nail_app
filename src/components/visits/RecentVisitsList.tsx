import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/messageTemplates'
import type { VisitWithCustomer } from '../../lib/visitAnalytics'

interface RecentVisitsListProps {
  visits: VisitWithCustomer[]
  search: string
  onSearchChange: (value: string) => void
}

export function RecentVisitsList({
  visits,
  search,
  onSearchChange,
}: RecentVisitsListProps) {
  const normalizedSearch = search.trim().toLowerCase()
  const filtered = visits.filter((visit) => {
    const name = visit.customers?.name ?? ''
    const design = visit.design_notes ?? ''
    return (
      name.toLowerCase().includes(normalizedSearch) ||
      design.toLowerCase().includes(normalizedSearch)
    )
  })

  return (
    <div className="space-y-3">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="field-input"
        placeholder="顧客名・デザインで検索"
      />

      {filtered.length === 0 && (
        <p className="text-sm text-mauve">来店記録がありません</p>
      )}

      <div className="space-y-2">
        {filtered.map((visit) => (
          <Link
            key={visit.id}
            to={`/customers/${visit.customer_id}`}
            className="block rounded-2xl border border-petal/60 bg-blush/40 px-4 py-3 transition hover:bg-blush"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink">
                  {visit.customers?.name ?? '不明'}
                </p>
                <p className="mt-0.5 text-sm text-mauve">
                  {formatDate(visit.visit_date)}
                </p>
              </div>
              {visit.price != null && (
                <span className="shrink-0 rounded-full bg-petal px-2 py-0.5 text-xs text-plum">
                  ¥{visit.price.toLocaleString()}
                </span>
              )}
            </div>
            {visit.design_notes && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink">
                {visit.design_notes}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
