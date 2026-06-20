import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { VisitWithImages } from '../types/database'

export function useVisits(customerId: string | undefined) {
  return useQuery({
    queryKey: ['visits', customerId],
    enabled: Boolean(customerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('*, visit_images(*)')
        .eq('customer_id', customerId!)
        .order('visit_date', { ascending: false })

      if (error) throw error
      return data as VisitWithImages[]
    },
  })
}
