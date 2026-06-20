import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { appendRescheduleNote } from '../lib/reservationOps'
import { supabase } from '../lib/supabase'
import type {
  CancelSource,
  ReservationFormData,
  ReservationStatus,
  ReservationWithCustomer,
} from '../types/database'

export interface MonthRange {
  start: string
  end: string
}

export function getMonthRange(year: number, month: number): MonthRange {
  const start = new Date(year, month, 1)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export function useReservations(range?: MonthRange) {
  return useQuery({
    queryKey: ['reservations', range?.start, range?.end],
    queryFn: async () => {
      let query = supabase
        .from('reservations')
        .select('*, customers(id, name, contact, booking_notes)')
        .order('start_at', { ascending: true })

      if (range) {
        query = query.gte('start_at', range.start).lte('start_at', range.end)
      }

      const { data, error } = await query
      if (error) throw error
      return data as ReservationWithCustomer[]
    },
  })
}

export function useUpcomingReservations() {
  return useQuery({
    queryKey: ['reservations', 'upcoming'],
    queryFn: async () => {
      const now = new Date().toISOString()
      const { data, error } = await supabase
        .from('reservations')
        .select('*, customers(id, name, contact, booking_notes)')
        .eq('status', 'booked')
        .gte('start_at', now)
        .order('start_at', { ascending: true })

      if (error) throw error
      return data as ReservationWithCustomer[]
    },
  })
}

export function useTodayReservations() {
  return useQuery({
    queryKey: ['reservations', 'today'],
    queryFn: async () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

      const { data, error } = await supabase
        .from('reservations')
        .select('*, customers(id, name, contact, booking_notes)')
        .eq('status', 'booked')
        .gte('start_at', start.toISOString())
        .lte('start_at', end.toISOString())
        .order('start_at', { ascending: true })

      if (error) throw error
      return data as ReservationWithCustomer[]
    },
  })
}

export function useCustomerReservations(customerId: string | undefined) {
  return useQuery({
    queryKey: ['reservations', 'customer', customerId],
    enabled: Boolean(customerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*, customers(id, name, contact, booking_notes)')
        .eq('customer_id', customerId!)
        .order('start_at', { ascending: false })

      if (error) throw error
      return data as ReservationWithCustomer[]
    },
  })
}

function parseReservationForm(form: ReservationFormData) {
  const durationValue = form.duration_min.trim()
    ? Number.parseInt(form.duration_min, 10)
    : null

  if (durationValue != null && Number.isNaN(durationValue)) {
    throw new Error('所要時間は数値で入力してください')
  }

  return {
    customer_id: form.customer_id,
    start_at: new Date(form.start_at).toISOString(),
    duration_min: durationValue,
    menu: form.menu.trim() || null,
    notes: form.notes.trim() || null,
    updated_at: new Date().toISOString(),
  }
}

export interface CancelReservationInput {
  id: string
  cancelSource: CancelSource
  cancelReason: string
}

export interface RescheduleReservationInput {
  id: string
  reservation: ReservationWithCustomer
  newStartAt: string
}

export function useReservationMutations() {
  const queryClient = useQueryClient()

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ['reservations'] })
  }

  const create = useMutation({
    mutationFn: async (form: ReservationFormData) => {
      const payload = parseReservationForm(form)
      const { data, error } = await supabase
        .from('reservations')
        .insert(payload)
        .select('*, customers(id, name, contact, booking_notes)')
        .single()

      if (error) throw error
      return data as ReservationWithCustomer
    },
    onSuccess: invalidateAll,
  })

  const update = useMutation({
    mutationFn: async ({
      id,
      form,
    }: {
      id: string
      form: ReservationFormData
    }) => {
      const payload = parseReservationForm(form)
      const { data, error } = await supabase
        .from('reservations')
        .update(payload)
        .eq('id', id)
        .eq('status', 'booked')
        .select('*, customers(id, name, contact, booking_notes)')
        .single()

      if (error) throw error
      return data as ReservationWithCustomer
    },
    onSuccess: invalidateAll,
  })

  const cancelWithReason = useMutation({
    mutationFn: async ({ id, cancelSource, cancelReason }: CancelReservationInput) => {
      const status: ReservationStatus =
        cancelSource === 'no_show' ? 'no_show' : 'canceled'

      const { data, error } = await supabase
        .from('reservations')
        .update({
          status,
          cancel_source: cancelSource,
          cancel_reason: cancelReason.trim() || null,
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'booked')
        .select('id')
        .maybeSingle()

      if (error) {
        if (
          error.message.includes('cancel_reason') ||
          error.message.includes('cancel_source') ||
          error.message.includes('no_show')
        ) {
          throw new Error(
            'キャンセル用のDB列が未設定です。Supabaseで migrations/003 を実行してください。',
          )
        }
        throw error
      }
      if (!data) {
        throw new Error('予約が見つからないか、すでにキャンセル済みです')
      }
    },
    onSuccess: invalidateAll,
  })

  const reschedule = useMutation({
    mutationFn: async ({ id, reservation, newStartAt }: RescheduleReservationInput) => {
      const notes = appendRescheduleNote(
        reservation.start_at,
        newStartAt,
        reservation.notes,
      )

      const { error } = await supabase
        .from('reservations')
        .update({
          start_at: new Date(newStartAt).toISOString(),
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('status', 'booked')

      if (error) throw error
    },
    onSuccess: invalidateAll,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)
        .eq('status', 'booked')

      if (error) throw error
    },
    onSuccess: invalidateAll,
  })

  const markDone = useMutation({
    mutationFn: async ({
      reservationId,
      visitId,
    }: {
      reservationId: string
      visitId: string
    }) => {
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'done' satisfies ReservationStatus,
          visit_id: visitId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reservationId)

      if (error) throw error
    },
    onSuccess: invalidateAll,
  })

  return { create, update, cancelWithReason, reschedule, remove, markDone }
}

export function formatReservationTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatReservationDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
}

export function toLocalDatetimeValue(isoString: string): string {
  const date = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function toDateKey(isoString: string): string {
  const date = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
