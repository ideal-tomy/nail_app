import { Link } from 'react-router-dom'
import { formatDate, formatDaysSince } from '../../lib/messageTemplates'
import {
  formatIntervalDays,
  type CustomerVisitStats,
  type CustomerStatsSortKey,
} from '../../lib/visitAnalytics'

interface CustomerVisitStatsListProps {
  stats: CustomerVisitStats[]
  sortKey: CustomerStatsSortKey
  onSortChange: (key: CustomerStatsSortKey) => void
  search: string
  onSearchChange: (value: string) => void
}

export function CustomerVisitStatsList({
  stats,
  sortKey,
  onSortChange,
  search,
  onSearchChange,
}: CustomerVisitStatsListProps) {
  const normalizedSearch = search.trim().toLowerCase()
  const filtered = stats.filter((s) =>
    s.customerName.toLowerCase().includes(normalizedSearch),
  )

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="field-input"
          placeholder="名前で検索"
        />
        <select
          value={sortKey}
          onChange={(e) => onSortChange(e.target.value as CustomerStatsSortKey)}
          className="field-input"
        >
          <option value="avgInterval">来店間隔が短い順</option>
          <option value="daysSince">最終来店から長い順</option>
          <option value="visitCount">来店回数が多い順</option>
          <option value="lastVisit">最終来店日順</option>
          <option value="name">名前順</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-mauve">該当する顧客がいません</p>
      )}

      <div className="space-y-2">
        {filtered.map((stat) => (
          <Link
            key={stat.customerId}
            to={`/customers/${stat.customerId}`}
            className="block rounded-2xl border border-petal/60 bg-blush/40 px-4 py-3 transition hover:bg-blush"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-ink">{stat.customerName}</p>
                <p className="mt-1 text-xs text-mauve">
                  来店 {stat.visitCount}回
                  {stat.lastVisit && ` · 最終 ${formatDate(stat.lastVisit)}`}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {stat.avgIntervalDays != null ? (
                  <>
                    <p className="text-sm font-medium text-plum">
                      平均 {formatIntervalDays(stat.avgIntervalDays)}
                    </p>
                    <p className="text-[10px] text-mauve">来店間隔</p>
                  </>
                ) : (
                  <p className="text-xs text-mauve">間隔 —</p>
                )}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {stat.daysSinceLastVisit != null && (
                <span className="rounded-full bg-petal px-2 py-0.5 text-xs text-plum">
                  {formatDaysSince(stat.daysSinceLastVisit)}
                </span>
              )}
              {stat.visitCount === 0 && (
                <span className="rounded-full bg-blush px-2 py-0.5 text-xs text-mauve">
                  来店なし
                </span>
              )}
              {stat.visitCount === 1 && (
                <span className="rounded-full bg-blush px-2 py-0.5 text-xs text-mauve">
                  初回来店のみ
                </span>
              )}
              {stat.totalRevenue > 0 && (
                <span className="rounded-full bg-blush px-2 py-0.5 text-xs text-mauve">
                  累計 ¥{stat.totalRevenue.toLocaleString()}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
