import { useMemo, useState } from 'react'
import { useVisitAnalytics } from '../hooks/useVisitAnalytics'
import { sortCustomerStats, type CustomerStatsSortKey } from '../lib/visitAnalytics'
import { CustomerVisitStatsList } from '../components/visits/CustomerVisitStatsList'
import { RecentVisitsList } from '../components/visits/RecentVisitsList'
import { VisitAnalyticsSummaryCards } from '../components/visits/VisitAnalyticsSummaryCards'
import { EmptyState } from '../components/ui/EmptyState'
import { Tabs } from '../components/ui/Tabs'

export function VisitsPage() {
  const { visits, customerStats, summary, isLoading, error } = useVisitAnalytics()
  const [activeTab, setActiveTab] = useState('stats')
  const [statsSort, setStatsSort] = useState<CustomerStatsSortKey>('avgInterval')
  const [statsSearch, setStatsSearch] = useState('')
  const [visitsSearch, setVisitsSearch] = useState('')

  const sortedStats = useMemo(
    () => sortCustomerStats(customerStats, statsSort),
    [customerStats, statsSort],
  )

  const statsWithVisits = useMemo(
    () => sortedStats.filter((s) => s.visitCount > 0),
    [sortedStats],
  )

  const statsContent = (
    <CustomerVisitStatsList
      stats={sortedStats}
      sortKey={statsSort}
      onSortChange={setStatsSort}
      search={statsSearch}
      onSearchChange={setStatsSearch}
    />
  )

  const listContent = (
    <RecentVisitsList
      visits={visits}
      search={visitsSearch}
      onSearchChange={setVisitsSearch}
    />
  )

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section>
        <h2 className="text-xl font-medium text-ink">来店分析</h2>
        <p className="mt-1 text-sm leading-relaxed text-mauve">
          顧客ごとの来店間隔や来店履歴を一覧で確認できます。リマインドやマーケティングの設計に活用してください。
        </p>
      </section>

      {isLoading && <p className="text-sm text-mauve">読み込み中...</p>}

      {error && (
        <p className="text-sm text-plum">
          {error instanceof Error ? error.message : 'データの取得に失敗しました'}
        </p>
      )}

      {summary && <VisitAnalyticsSummaryCards summary={summary} />}

      {!isLoading && !error && visits.length === 0 && (
        <EmptyState
          title="来店記録がまだありません"
          description="来店を登録すると、ここに分析が表示されます。"
        />
      )}

      {!isLoading && visits.length > 0 && (
        <>
          {statsWithVisits.length > 0 && summary?.avgIntervalDays != null && (
            <p className="rounded-2xl border border-petal/50 bg-petal/20 px-4 py-3 text-sm leading-relaxed text-ink">
              リピート顧客の平均来店間隔は
              <span className="font-medium text-plum">
                {' '}
                約{summary.avgIntervalDays}日
              </span>
              です。連絡推奨（14日）と比較して、リマインドのタイミングを調整できます。
            </p>
          )}

          <Tabs
            tabs={[
              { id: 'stats', label: '顧客別', content: statsContent },
              { id: 'list', label: '来店一覧', content: listContent },
            ]}
            activeId={activeTab}
            onChange={setActiveTab}
          />
        </>
      )}
    </div>
  )
}
