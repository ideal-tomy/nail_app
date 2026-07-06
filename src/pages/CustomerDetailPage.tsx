import { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCustomer, useCustomerStatuses } from '../hooks/useCustomers'
import {
  formatReservationDate,
  formatReservationTime,
  useCustomerReservations,
} from '../hooks/useReservations'
import { useVisits } from '../hooks/useVisits'
import { MessageEditorModal } from '../components/contact/MessageEditorModal'
import { CustomerDetailHero } from '../components/customers/CustomerDetailHero'
import { CustomerForm } from '../components/customers/CustomerForm'
import { CustomerSalonMemos } from '../components/customers/CustomerSalonMemos'
import { VisitHistoryCompactList } from '../components/visits/VisitHistoryCompactList'
import { VisitForm } from '../components/visits/VisitForm'
import { ReservationCancelModal } from '../components/reservations/ReservationCancelModal'
import { ReservationForm } from '../components/reservations/ReservationForm'
import { ReservationListItem } from '../components/reservations/ReservationListItem'
import { ReservationRescheduleModal } from '../components/reservations/ReservationRescheduleModal'
import { BackLink } from '../components/ui/BackLink'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { SaveSuccessCard } from '../components/ui/SaveSuccessCard'
import { Tabs } from '../components/ui/Tabs'
import { useToast } from '../components/ui/Toast'
import { sendReservationConfirmedViaLine } from '../lib/line'
import type { CustomerDetailNavigationState } from '../lib/navigationState'
import { supabase } from '../lib/supabase'
import type { CustomerFormData, ReservationWithCustomer } from '../types/database'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { data: customer, isLoading, error } = useCustomer(id)
  const { data: statuses = [] } = useCustomerStatuses()
  const { data: visits = [], isLoading: visitsLoading } = useVisits(id)
  const { data: reservations = [], isLoading: reservationsLoading } =
    useCustomerReservations(id)

  const navState = location.state as CustomerDetailNavigationState | null

  const [activeTab, setActiveTab] = useState('visits')
  const [showEdit, setShowEdit] = useState(false)
  const [showVisit, setShowVisit] = useState(false)
  const [showReservation, setShowReservation] = useState(false)
  const [showCompose, setShowCompose] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingReservation, setEditingReservation] =
    useState<ReservationWithCustomer | null>(null)
  const [rescheduling, setRescheduling] = useState<ReservationWithCustomer | null>(null)
  const [canceling, setCanceling] = useState<ReservationWithCustomer | null>(null)

  const status = useMemo(
    () => statuses.find((item) => item.id === id),
    [statuses, id],
  )

  const latestVisit = useMemo(() => visits[0] ?? null, [visits])
  const upcomingReservations = useMemo(
    () => reservations.filter((r) => r.status === 'booked'),
    [reservations],
  )
  const pastReservations = useMemo(
    () => reservations.filter((r) => r.status !== 'booked'),
    [reservations],
  )

  const upcomingReservation = useMemo(
    () => upcomingReservations[0] ?? null,
    [upcomingReservations],
  )

  useEffect(() => {
    if (navState?.openReservation) {
      setShowReservation(true)
      setActiveTab('reservations')
    }
  }, [navState?.openReservation])

  const initialForm: CustomerFormData | undefined = customer
    ? {
        name: customer.name,
        contact: customer.contact ?? '',
        preferences: customer.preferences ?? '',
        notes: customer.notes ?? '',
        booking_notes: customer.booking_notes ?? '',
      }
    : undefined

  const handleConfirmReservation = (reservation: ReservationWithCustomer) => {
    sendReservationConfirmedViaLine(
      customer?.name ?? reservation.customers?.name ?? 'お客様',
      reservation.start_at,
      reservation.duration_min,
    )
    showToast('LINEで予約確定の通知を送ります')
  }

  const reservationActions = (reservation: ReservationWithCustomer) => ({
    onEdit: () => setEditingReservation(reservation),
    onReschedule: () => setRescheduling(reservation),
    onCancel: () => setCanceling(reservation),
    onConfirm: () => handleConfirmReservation(reservation),
  })

  const handleUpdate = async (form: CustomerFormData) => {
    if (!id) return

    const { error: updateError } = await supabase
      .from('customers')
      .update({
        name: form.name.trim(),
        contact: form.contact.trim() || null,
        preferences: form.preferences.trim() || null,
        notes: form.notes.trim() || null,
        booking_notes: form.booking_notes.trim() || null,
      })
      .eq('id', id)

    if (updateError) throw updateError

    await queryClient.invalidateQueries({ queryKey: ['customer', id] })
    await queryClient.invalidateQueries({ queryKey: ['customers'] })
    await queryClient.invalidateQueries({ queryKey: ['reservations'] })
    setShowEdit(false)
    setSuccessMessage('顧客情報を更新しました')
  }

  if (isLoading) {
    return <p className="text-sm text-mauve">読み込み中...</p>
  }

  if (error || !customer) {
    return <p className="text-sm text-plum">顧客が見つかりません</p>
  }

  const visitsContent = (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setShowVisit(true)}>来店を登録</Button>
      </div>

      {visitsLoading && <p className="text-sm text-mauve">読み込み中...</p>}

      {!visitsLoading && visits.length === 0 && (
        <EmptyState
          title="来店履歴はまだありません"
          description="来店を登録して、デザインと完成画像を残しましょう。"
        />
      )}

      {visits.length > 0 && (
        <VisitHistoryCompactList visits={visits} customerName={customer.name} />
      )}
    </div>
  )

  const reservationsContent = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowReservation(true)}>予約を追加</Button>
      </div>

      {reservationsLoading && <p className="text-sm text-mauve">読み込み中...</p>}

      {!reservationsLoading && reservations.length === 0 && (
        <EmptyState
          title="予約はありません"
          description="予約を追加して来店予定を管理しましょう。"
        />
      )}

      {upcomingReservations.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-sm font-medium text-ink">今後の予約</h4>
          {upcomingReservations.map((reservation) => (
            <ReservationListItem
              key={reservation.id}
              reservation={reservation}
              {...reservationActions(reservation)}
            />
          ))}
        </section>
      )}

      {pastReservations.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-sm font-medium text-ink">過去の予約</h4>
          {pastReservations.map((reservation) => (
            <ReservationListItem
              key={reservation.id}
              reservation={reservation}
              compact
            />
          ))}
        </section>
      )}
    </div>
  )

  return (
    <div className="space-y-5">
      <BackLink />

      {successMessage && (
        <SaveSuccessCard
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      <CustomerDetailHero
        customer={customer}
        status={status}
        latestVisit={latestVisit}
        upcomingReservation={upcomingReservation}
        onEdit={() => setShowEdit(true)}
        onCompose={() => setShowCompose(true)}
      />

      <CustomerSalonMemos customer={customer} onEdit={() => setShowEdit(true)} />

      <Tabs
        tabs={[
          { id: 'visits', label: '来店履歴', content: visitsContent },
          { id: 'reservations', label: '予約', content: reservationsContent },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      <MessageEditorModal
        open={showCompose}
        onClose={() => setShowCompose(false)}
        customerId={customer.id}
        customerName={customer.name}
        latestVisit={latestVisit}
      />

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="顧客情報を編集">
        {initialForm && (
          <CustomerForm
            initial={initialForm}
            submitLabel="更新する"
            onSubmit={handleUpdate}
            onCancel={() => setShowEdit(false)}
          />
        )}
      </Modal>

      <Modal open={showVisit} onClose={() => setShowVisit(false)} title="来店を登録">
        <VisitForm
          customerId={customer.id}
          showCancel
          onCancel={() => setShowVisit(false)}
          onDone={() => {
            setShowVisit(false)
            setActiveTab('visits')
            setSuccessMessage('来店を登録しました')
          }}
        />
      </Modal>

      <Modal
        open={showReservation}
        onClose={() => setShowReservation(false)}
        title="予約を追加"
      >
        <ReservationForm
          fixedCustomerId={customer.id}
          onSuccess={(saved) => {
            setShowReservation(false)
            setActiveTab('reservations')
            const when = `${formatReservationDate(saved.start_at)} ${formatReservationTime(saved.start_at)}`
            setSuccessMessage(`予約を追加しました — ${when}`)
          }}
          onCancel={() => setShowReservation(false)}
        />
      </Modal>

      <Modal
        open={Boolean(editingReservation)}
        onClose={() => setEditingReservation(null)}
        title="予約を編集"
      >
        {editingReservation && (
          <ReservationForm
            reservation={editingReservation}
            fixedCustomerId={customer.id}
            onSuccess={(saved) => {
              setEditingReservation(null)
              const when = `${formatReservationDate(saved.start_at)} ${formatReservationTime(saved.start_at)}`
              setSuccessMessage(`予約を更新しました — ${when}`)
            }}
            onCancel={() => setEditingReservation(null)}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(rescheduling)}
        onClose={() => setRescheduling(null)}
        title="日時変更"
      >
        {rescheduling && (
          <ReservationRescheduleModal
            reservation={rescheduling}
            onClose={() => setRescheduling(null)}
            onSuccess={() => {
              setRescheduling(null)
              setSuccessMessage('予約日時を変更しました')
            }}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(canceling)}
        onClose={() => setCanceling(null)}
        title="予約キャンセル"
      >
        {canceling && (
          <ReservationCancelModal
            reservation={canceling}
            onClose={() => setCanceling(null)}
            onSuccess={() => {
              setCanceling(null)
              setSuccessMessage('予約をキャンセルしました')
            }}
          />
        )}
      </Modal>
    </div>
  )
}
