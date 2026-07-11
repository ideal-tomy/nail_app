import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { LineFollower } from '../types/database'

export function useLineFollowers(options?: { unlinkedOnly?: boolean }) {
  const unlinkedOnly = options?.unlinkedOnly ?? false

  return useQuery({
    queryKey: ['line-followers', { unlinkedOnly }],
    queryFn: async () => {
      let query = supabase
        .from('line_followers')
        .select('*')
        .is('unfollowed_at', null)
        .order('followed_at', { ascending: false })

      if (unlinkedOnly) {
        query = query.is('customer_id', null)
      }

      const { data, error } = await query
      if (error) throw error
      return data as LineFollower[]
    },
  })
}

export async function linkFollowerToCustomer(
  followerId: string,
  lineUserId: string,
  customerId: string,
  displayName?: string | null,
) {
  const now = new Date().toISOString()

  const { error: customerError } = await supabase
    .from('customers')
    .update({
      line_user_id: lineUserId,
      line_display_name: displayName ?? null,
    })
    .eq('id', customerId)

  if (customerError) throw customerError

  const { error: followerError } = await supabase
    .from('line_followers')
    .update({
      customer_id: customerId,
      linked_at: now,
      updated_at: now,
    })
    .eq('id', followerId)

  if (followerError) throw followerError
}

export async function createCustomerFromFollower(follower: LineFollower) {
  const name = follower.display_name?.trim() || 'LINEユーザー'
  const { data, error } = await supabase
    .from('customers')
    .insert({
      name,
      contact: follower.display_name
        ? `LINE: ${follower.display_name}`
        : null,
      line_user_id: follower.line_user_id,
      line_display_name: follower.display_name,
    })
    .select('id, name')
    .single()

  if (error) throw error

  const now = new Date().toISOString()
  const { error: linkError } = await supabase
    .from('line_followers')
    .update({
      customer_id: data.id,
      linked_at: now,
      updated_at: now,
    })
    .eq('id', follower.id)

  if (linkError) throw linkError
  return data
}
