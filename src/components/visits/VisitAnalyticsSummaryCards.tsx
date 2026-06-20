import { formatIntervalDays } from '../../lib/visitAnalytics'
import type { VisitAnalyticsSummary } from '../../lib/visitAnalytics'

interface VisitAnalyticsSummaryCardsProps {
  summary: VisitAnalyticsSummary
}

export function VisitAnalyticsSummaryCards({
  summary,
}: VisitAnalyticsSummaryCardsProps) {
  const items = [
    { label: '総来店数', value: `${summary.totalVisits}回` },
    { label: '今月の来店', value: `${summary.visitsThisMonth}回` },
    {
      label: '平均来店間隔',
      value: formatIntervalDays(summary.avgIntervalDays),
      hint: '2回以上来店の顧客',
    },
    { label: '来店顧客数', value: `${summary.customersWithVisits}名` },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-petal/70 bg-blush/50 px-3 py-3"
        >
          <p className="text-xs text-mauve">{item.label}</p>
          <p className="mt-1 text-lg font-medium text-ink">{item.value}</p>
          {item.hint && (
            <p className="mt-0.5 text-[10px] text-mauve">{item.hint}</p>
          )}
        </div>
      ))}
    </div>
  )
}
