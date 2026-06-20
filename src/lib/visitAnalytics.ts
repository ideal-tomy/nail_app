import type { Visit } from '../types/database'

export interface CustomerVisitStats {
  customerId: string
  customerName: string
  visitCount: number
  firstVisit: string | null
  lastVisit: string | null
  daysSinceLastVisit: number | null
  avgIntervalDays: number | null
  totalRevenue: number
}

export interface VisitAnalyticsSummary {
  totalVisits: number
  visitsThisMonth: number
  customersWithVisits: number
  avgIntervalDays: number | null
  totalRevenue: number
}

export interface VisitWithCustomer extends Visit {
  customers: { id: string; name: string } | null
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a)
  const dateB = new Date(b)
  const diff = Math.abs(dateB.getTime() - dateA.getTime())
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function computeAvgIntervalDays(visitDates: string[]): number | null {
  if (visitDates.length < 2) return null

  const sorted = [...visitDates].sort()
  let totalGap = 0

  for (let i = 1; i < sorted.length; i++) {
    totalGap += daysBetween(sorted[i - 1], sorted[i])
  }

  return Math.round(totalGap / (sorted.length - 1))
}

export function computeCustomerVisitStats(
  customerId: string,
  customerName: string,
  visits: Visit[],
  daysSinceLastVisit: number | null,
): CustomerVisitStats {
  const sorted = [...visits].sort((a, b) => a.visit_date.localeCompare(b.visit_date))
  const dates = sorted.map((v) => v.visit_date)
  const totalRevenue = sorted.reduce((sum, v) => sum + (v.price ?? 0), 0)

  return {
    customerId,
    customerName,
    visitCount: sorted.length,
    firstVisit: dates[0] ?? null,
    lastVisit: dates[dates.length - 1] ?? null,
    daysSinceLastVisit,
    avgIntervalDays: computeAvgIntervalDays(dates),
    totalRevenue,
  }
}

export function computeVisitAnalyticsSummary(
  allVisits: Visit[],
  customerStats: CustomerVisitStats[],
): VisitAnalyticsSummary {
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const visitsThisMonth = allVisits.filter((v) => v.visit_date >= monthStart).length

  const intervals = customerStats
    .map((s) => s.avgIntervalDays)
    .filter((d): d is number => d !== null)

  const avgIntervalDays =
    intervals.length > 0
      ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
      : null

  return {
    totalVisits: allVisits.length,
    visitsThisMonth,
    customersWithVisits: customerStats.filter((s) => s.visitCount > 0).length,
    avgIntervalDays,
    totalRevenue: allVisits.reduce((sum, v) => sum + (v.price ?? 0), 0),
  }
}

export function formatIntervalDays(days: number | null): string {
  if (days === null) return '—'
  if (days < 7) return `${days}日`
  if (days < 30) return `${Math.round(days / 7)}週間`
  return `${Math.round(days / 30)}ヶ月`
}

export type CustomerStatsSortKey =
  | 'name'
  | 'visitCount'
  | 'avgInterval'
  | 'daysSince'
  | 'lastVisit'

export function sortCustomerStats(
  stats: CustomerVisitStats[],
  sortKey: CustomerStatsSortKey,
): CustomerVisitStats[] {
  return [...stats].sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return a.customerName.localeCompare(b.customerName, 'ja')
      case 'visitCount':
        return b.visitCount - a.visitCount
      case 'avgInterval':
        return (a.avgIntervalDays ?? 9999) - (b.avgIntervalDays ?? 9999)
      case 'daysSince':
        return (b.daysSinceLastVisit ?? -1) - (a.daysSinceLastVisit ?? -1)
      case 'lastVisit':
        return (b.lastVisit ?? '').localeCompare(a.lastVisit ?? '')
      default:
        return 0
    }
  })
}
