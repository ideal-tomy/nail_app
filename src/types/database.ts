export interface Customer {
  id: string
  name: string
  contact: string | null
  preferences: string | null
  notes: string | null
  booking_notes: string | null
  line_user_id: string | null
  line_display_name: string | null
  created_at: string
}

export interface Visit {
  id: string
  customer_id: string
  visit_date: string
  design_notes: string | null
  work_notes: string | null
  price: number | null
  created_at: string
}

export interface VisitImage {
  id: string
  visit_id: string
  storage_path: string
  created_at: string
}

export interface ContactLog {
  id: string
  customer_id: string
  sent_at: string
  channel: string
  message: string | null
}

export interface LineFollower {
  id: string
  line_user_id: string
  display_name: string | null
  picture_url: string | null
  status_message: string | null
  followed_at: string | null
  unfollowed_at: string | null
  customer_id: string | null
  linked_at: string | null
  created_at: string
  updated_at: string | null
}

export interface CustomerStatus {
  id: string
  name: string
  last_visit: string | null
  days_since: number | null
  last_contact: string | null
}

export interface VisitWithImages extends Visit {
  visit_images: VisitImage[]
}

export interface CustomerFormData {
  name: string
  contact: string
  preferences: string
  notes: string
  booking_notes: string
  line_user_id: string
}

export interface VisitFormData {
  visit_date: string
  design_notes: string
  work_notes: string
  price: string
}

export type ReservationStatus = 'booked' | 'done' | 'canceled' | 'no_show'

export type CancelSource = 'customer' | 'salon' | 'no_show'

export interface Reservation {
  id: string
  customer_id: string
  start_at: string
  duration_min: number | null
  menu: string | null
  notes: string | null
  status: ReservationStatus
  visit_id: string | null
  cancel_reason: string | null
  canceled_at: string | null
  cancel_source: CancelSource | null
  updated_at: string | null
  created_at: string
}

export interface ReservationWithCustomer extends Reservation {
  customers: Pick<Customer, 'id' | 'name' | 'contact' | 'booking_notes'> | null
}

export interface ReservationFormData {
  customer_id: string
  start_at: string
  duration_min: string
  menu: string
  notes: string
}

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: Customer
        Insert: {
          id?: string
          name: string
          contact?: string | null
          preferences?: string | null
          notes?: string | null
          booking_notes?: string | null
          line_user_id?: string | null
          line_display_name?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          contact?: string | null
          preferences?: string | null
          notes?: string | null
          booking_notes?: string | null
          line_user_id?: string | null
          line_display_name?: string | null
        }
        Relationships: []
      }
      visits: {
        Row: Visit
        Insert: {
          id?: string
          customer_id: string
          visit_date: string
          design_notes?: string | null
          work_notes?: string | null
          price?: number | null
          created_at?: string
        }
        Update: {
          customer_id?: string
          visit_date?: string
          design_notes?: string | null
          work_notes?: string | null
          price?: number | null
        }
        Relationships: []
      }
      visit_images: {
        Row: VisitImage
        Insert: {
          id?: string
          visit_id: string
          storage_path: string
          created_at?: string
        }
        Update: {
          visit_id?: string
          storage_path?: string
        }
        Relationships: []
      }
      contact_logs: {
        Row: ContactLog
        Insert: {
          id?: string
          customer_id: string
          sent_at?: string
          channel?: string
          message?: string | null
        }
        Update: {
          customer_id?: string
          sent_at?: string
          channel?: string
          message?: string | null
        }
        Relationships: []
      }
      line_followers: {
        Row: LineFollower
        Insert: {
          id?: string
          line_user_id: string
          display_name?: string | null
          picture_url?: string | null
          status_message?: string | null
          followed_at?: string | null
          unfollowed_at?: string | null
          customer_id?: string | null
          linked_at?: string | null
          raw_event?: unknown
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          display_name?: string | null
          picture_url?: string | null
          status_message?: string | null
          followed_at?: string | null
          unfollowed_at?: string | null
          customer_id?: string | null
          linked_at?: string | null
          raw_event?: unknown
          updated_at?: string | null
        }
        Relationships: []
      }
      reservations: {
        Row: Reservation
        Insert: {
          id?: string
          customer_id: string
          start_at: string
          duration_min?: number | null
          menu?: string | null
          notes?: string | null
          status?: ReservationStatus
          visit_id?: string | null
          cancel_reason?: string | null
          canceled_at?: string | null
          cancel_source?: CancelSource | null
          updated_at?: string | null
          created_at?: string
        }
        Update: {
          customer_id?: string
          start_at?: string
          duration_min?: number | null
          menu?: string | null
          notes?: string | null
          status?: ReservationStatus
          visit_id?: string | null
          cancel_reason?: string | null
          canceled_at?: string | null
          cancel_source?: CancelSource | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      customer_status: {
        Row: CustomerStatus
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
