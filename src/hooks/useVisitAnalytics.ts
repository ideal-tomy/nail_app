import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import {
  computeCustomerVisitStats,
  computeVisitAnalyticsSummary,
  type CustomerVisitStats,
  type VisitAnalyticsSummary,
  type VisitWithCustomer,
} from '../lib/visitAnalytics'
import { useCustomerStatuses } from './useCustomers'

export function useAllVisits() {
  return useQuery({
    queryKey: ['visits', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*, customers(id, name)')
        .order('visit_date', { ascending: false })

      if (error) throw error
      return data as VisitWithCustomer[]
    },
  })
}

export function useVisitAnalytics() {
  const visitsQuery = useAllVisits()
  const statusesQuery = useCustomerStatuses()

  const customerStats = useMemo((): CustomerVisitStats[] => {
    if (!visitsQuery.data || !statusesQuery.data) return []

    const visitsByCustomer = new Map<string, typeof visitsQuery.data>()
    for (const visit of visitsQuery.data) {
      const list = visitsByCustomer.get(visit.customer_id) ?? []
      list.push(visit)
      visitsByCustomer.set(visit.customer_id, list)
    }

    return statusesQuery.data.map((status) => {
      const visits = visitsByCustomer.get(status.id) ?? []
      return computeCustomerVisitStats(
        status.id,
        status.name,
        visits,
        status.days_since,
      )
    })
  }, [visitsQuery.data, statusesQuery.data])

  const summary = useMemo((): VisitAnalyticsSummary | null => {
    if (!visitsQuery.data) return null
    return computeVisitAnalyticsSummary(visitsQuery.data, customerStats)
  }, [visitsQuery.data, customerStats])

  return {
    visits: visitsQuery.data ?? [],
    customerStats,
    summary,
    isLoading: visitsQuery.isLoading || statusesQuery.isLoading,
    error: visitsQuery.error ?? statusesQuery.error,
  }
}
