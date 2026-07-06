import { useMemo } from 'react'
import { isContactRecommended } from '../lib/messageTemplates'
import { useCustomerStatuses } from './useCustomers'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { CustomerStatus, Reservation, VisitWithImages } from '../types/database'

export interface ContactRecommendation extends CustomerStatus {
  latestVisit: VisitWithImages | null
  upcomingReservation: Reservation | null
}

export function useContactRecommendations() {
  const statusesQuery = useCustomerStatuses()

  const recommendedIds = useMemo(() => {
    if (!statusesQuery.data) return []
    return statusesQuery.data
      .filter((status) =>
        isContactRecommended(
          status.days_since,
          status.last_visit,
          status.last_contact,
        ),
      )
      .sort((a, b) => (b.days_since ?? 0) - (a.days_since ?? 0))
      .map((status) => status.id)
  }, [statusesQuery.data])

  const detailsQuery = useQuery({
    queryKey: ['contact-recommendations', recommendedIds],
    enabled: recommendedIds.length > 0,
    queryFn: async () => {
      const { data: statuses, error: statusError } = await supabase
        .from('customer_status')
        .select('*')
        .in('id', recommendedIds)

      if (statusError) throw statusError

      const ordered = recommendedIds
        .map((id) => (statuses as CustomerStatus[]).find((s) => s.id === id))
        .filter(Boolean) as CustomerStatus[]

      const now = new Date().toISOString()

      const { data: reservations, error: reservationError } = await supabase
        .from('reservations')
        .select('*')
        .in('customer_id', recommendedIds)
        .eq('status', 'booked')
        .gte('start_at', now)
        .order('start_at', { ascending: true })

      if (reservationError) throw reservationError

      const nextReservationByCustomer = new Map<string, Reservation>()
      for (const reservation of (reservations ?? []) as Reservation[]) {
        if (!nextReservationByCustomer.has(reservation.customer_id)) {
          nextReservationByCustomer.set(reservation.customer_id, reservation)
        }
      }

      const results: ContactRecommendation[] = []

      for (const status of ordered) {
        const { data: visit, error: visitError } = await supabase
          .from('visits')
          .select('*, visit_images(*)')
          .eq('customer_id', status.id)
          .order('visit_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (visitError) throw visitError

        results.push({
          ...status,
          latestVisit: visit as VisitWithImages | null,
          upcomingReservation: nextReservationByCustomer.get(status.id) ?? null,
        })
      }

      return results
    },
  })

  return {
    recommendations: detailsQuery.data ?? [],
    isLoading: statusesQuery.isLoading || detailsQuery.isLoading,
    error: statusesQuery.error ?? detailsQuery.error,
  }
}
