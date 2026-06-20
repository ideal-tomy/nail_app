import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Customer, CustomerStatus } from '../types/database'

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
