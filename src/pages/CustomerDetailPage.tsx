import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCustomer } from '../hooks/useCustomers'
import { useCustomerReservations } from '../hooks/useReservations'
import { useVisits } from '../hooks/useVisits'
import { CustomerForm } from '../components/customers/CustomerForm'
import { LatestVisitSection } from '../components/visits/LatestVisitSection'
import { VisitHistoryItem } from '../components/visits/VisitHistoryItem'
import { VisitForm } from '../components/visits/VisitForm'
import { ReservationCancelModal } from '../components/reservations/ReservationCancelModal'
import { ReservationForm } from '../components/reservations/ReservationForm'
import { ReservationListItem } from '../components/reservations/ReservationListItem'
import { ReservationRescheduleModal } from '../components/reservations/ReservationRescheduleModal'
import { MessageEditorModal } from '../components/contact/MessageEditorModal'
import { Accordion, AccordionItem } from '../components/ui/Accordion'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Tabs } from '../components/ui/Tabs'
import { useToast } from '../components/ui/Toast'
import { sendReservationConfirmedViaLine } from '../lib/line'
import { formatDate } from '../lib/messageTemplates'
import { supabase } from '../lib/supabase'
import type { CustomerFormData, ReservationWithCustomer } from '../types/database'

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { data: customer, isLoading, error } = useCustomer(id)
  const { data: visits = [], isLoading: visitsLoading } = useVisits(id)
  const { data: reservations = [], isLoading: reservationsLoading } =
    useCustomerReservations(id)

  const [activeTab, setActiveTab] = useState('info')
  const [showEdit, setShowEdit] = useState(false)
  const [showMessage, setShowMessage] = useState(false)
  const [showVisit, setShowVisit] = useState(false)
  const [showReservation, setShowReservation] = useState(false)
  const [editingReservation, setEditingReservation] =
    useState<ReservationWithCustomer | null>(null)
  const [rescheduling, setRescheduling] = useState<ReservationWithCustomer | null>(null)
  const [canceling, setCanceling] = useState<ReservationWithCustomer | null>(null)

  const latestVisit = useMemo(() => visits[0] ?? null, [visits])
  const upcomingReservations = useMemo(
    () => reservations.filter((r) => r.status === 'booked'),
    [reservations],
  )
  const pastReservations = useMemo(
    () => reservations.filter((r) => r.status !== 'booked'),
    [reservations],
  )

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
    showToast('顧客情報を更新しました')
  }

  if (isLoading) {
    return <p className="text-sm text-mauve">読み込み中...</p>
  }

  if (error || !customer) {
    return <p className="text-sm text-plum">顧客が見つかりません</p>
  }

  const infoContent = (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium text-ink">{customer.name}</h3>
            {customer.contact && (
              <p className="mt-1 text-sm text-mauve">{customer.contact}</p>
            )}
          </div>
          <Button variant="secondary" onClick={() => setShowEdit(true)}>
            編集
          </Button>
        </div>

        {customer.booking_notes && (
          <div className="mt-4 rounded-2xl border border-petal/60 bg-petal/20 px-3 py-3">
            <p className="text-sm text-plum">予約対応メモ</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {customer.booking_notes}
            </p>
          </div>
        )}

        {customer.preferences && (
          <div className="mt-4">
            <p className="text-sm text-mauve">好み・季節メモ</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {customer.preferences}
            </p>
          </div>
        )}

        {customer.notes && (
          <div className="mt-4">
            <p className="text-sm text-mauve">自由メモ</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
              {customer.notes}
            </p>
          </div>
        )}

        {!customer.preferences && !customer.notes && !customer.booking_notes && (
          <p className="mt-4 text-sm text-mauve">メモはまだありません</p>
        )}
      </Card>

      {latestVisit && (
        <LatestVisitSection visit={latestVisit} customerName={customer.name} />
      )}
    </div>
  )

  const visitsContent = (
    <div className="space-y-3">
      {visitsLoading && <p className="text-sm text-mauve">読み込み中...</p>}

      {!visitsLoading && visits.length === 0 && (
        <EmptyState
          title="来店履歴はまだありません"
          description="来店を登録して、デザインと完成画像を残しましょう。"
        />
      )}

      {visits.length > 0 && (
        <Accordion>
          {visits.map((visit, index) => (
            <AccordionItem
              key={visit.id}
              defaultOpen={index === 0}
              title={
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink">
                    {formatDate(visit.visit_date)}
                  </span>
                  {visit.design_notes && (
                    <span className="truncate text-sm text-mauve">
                      {visit.design_notes}
                    </span>
                  )}
                </div>
              }
            >
              <VisitHistoryItem
                visit={visit}
                customerName={customer.name}
                embedded
              />
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )

  const reservationsContent = (
    <div className="space-y-4">
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
      <Link to="/customers" className="inline-block text-sm text-mauve hover:text-plum">
        ← 顧客一覧へ
      </Link>

      <Card padding="sm">
        <p className="mb-3 text-sm font-medium text-ink">{customer.name} さん</p>
        <div className="grid grid-cols-3 gap-2">
          <Button
            className="px-2 text-xs sm:text-sm"
            onClick={() => setShowMessage(true)}
          >
            連絡
          </Button>
          <Button
            variant="secondary"
            className="px-2 text-xs sm:text-sm"
            onClick={() => setShowVisit(true)}
          >
            来店
          </Button>
          <Button
            variant="secondary"
            className="px-2 text-xs sm:text-sm"
            onClick={() => {
              setActiveTab('reservations')
              setShowReservation(true)
            }}
          >
            予約
          </Button>
        </div>
      </Card>

      <Tabs
        tabs={[
          { id: 'info', label: '基本情報', content: infoContent },
          { id: 'visits', label: '来店履歴', content: visitsContent },
          { id: 'reservations', label: '予約', content: reservationsContent },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
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
            showToast('来店を登録しました')
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
          onSuccess={() => {
            setShowReservation(false)
            showToast('予約を追加しました')
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
            onSuccess={() => {
              setEditingReservation(null)
              showToast('予約を更新しました')
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
              showToast('予約日時を変更しました')
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
              showToast('予約をキャンセルしました')
            }}
          />
        )}
      </Modal>

      <MessageEditorModal
        open={showMessage}
        onClose={() => setShowMessage(false)}
        customerId={customer.id}
        customerName={customer.name}
        latestVisit={latestVisit}
      />
    </div>
  )
}
