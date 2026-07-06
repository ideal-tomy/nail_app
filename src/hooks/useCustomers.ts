import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type {
  Customer,
  CustomerStatus,
  Reservation,
  VisitWithImages,
} from '../types/database'

export interface CustomerListCardData {
  latestVisit: VisitWithImages | null
  upcomingReservation: Reservation | null
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Customer[]
    },
  })
}

export function useCustomerStatuses() {
  return useQuery({
    queryKey: ['customer-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_status')
        .select('*')

      if (error) throw error
      return data as CustomerStatus[]
    },
  })
}

export function useCustomerListCardData(customerIds: string[]) {
  const sortedIds = [...customerIds].sort()

  return useQuery({
    queryKey: ['customer-list-cards', sortedIds],
    enabled: sortedIds.length > 0,
    queryFn: async () => {
      const now = new Date().toISOString()

      const [visitsResult, reservationsResult] = await Promise.all([
        supabase
          .from('visits')
          .select('*, visit_images(*)')
          .in('customer_id', sortedIds)
          .order('visit_date', { ascending: false }),
        supabase
          .from('reservations')
          .select('*')
          .in('customer_id', sortedIds)
          .eq('status', 'booked')
          .gte('start_at', now)
          .order('start_at', { ascending: true }),
      ])

      if (visitsResult.error) throw visitsResult.error
      if (reservationsResult.error) throw reservationsResult.error

      const cardData = new Map<string, CustomerListCardData>()

      for (const id of sortedIds) {
        cardData.set(id, { latestVisit: null, upcomingReservation: null })
      }

      for (const visit of (visitsResult.data ?? []) as VisitWithImages[]) {
        const entry = cardData.get(visit.customer_id)
        if (entry && !entry.latestVisit) {
          entry.latestVisit = visit
        }
      }

      for (const reservation of (reservationsResult.data ?? []) as Reservation[]) {
        const entry = cardData.get(reservation.customer_id)
        if (entry && !entry.upcomingReservation) {
          entry.upcomingReservation = reservation
        }
      }

      return cardData
    },
  })
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customer', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data as Customer
    },
  })
}
