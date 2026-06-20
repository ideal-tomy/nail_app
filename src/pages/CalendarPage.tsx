import { useMemo, useState } from 'react'
import { todayISO } from '../lib/messageTemplates'
import {
  getMonthRange,
  toDateKey,
  useReservations,
  useTodayReservations,
  useUpcomingReservations,
} from '../hooks/useReservations'
import type { ReservationWithCustomer } from '../types/database'
import { MonthCalendar } from '../components/calendar/MonthCalendar'
import { ReservationCancelModal } from '../components/reservations/ReservationCancelModal'
import { ReservationForm } from '../components/reservations/ReservationForm'
import { ReservationListItem } from '../components/reservations/ReservationListItem'
import { ReservationRescheduleModal } from '../components/reservations/ReservationRescheduleModal'
import { VisitForm } from '../components/visits/VisitForm'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { Tabs } from '../components/ui/Tabs'
import { useToast } from '../components/ui/Toast'

export function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(todayISO())
  const [activeTab, setActiveTab] = useState('calendar')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<ReservationWithCustomer | null>(null)
  const [rescheduling, setRescheduling] = useState<ReservationWithCustomer | null>(null)
  const [canceling, setCanceling] = useState<ReservationWithCustomer | null>(null)
  const [converting, setConverting] = useState<ReservationWithCustomer | null>(null)
  const { showToast } = useToast()

  const range = useMemo(() => getMonthRange(year, month), [year, month])
  const { data: monthReservations = [], isLoading } = useReservations(range)
  const { data: upcoming = [], isLoading: upcomingLoading } = useUpcomingReservations()
  const { data: todayReservations = [] } = useTodayReservations()

  const selectedDayReservations = useMemo(() => {
    if (!selectedDate) return []
    return monthReservations.filter(
      (r) =>
        toDateKey(r.start_at) === selectedDate &&
        r.status !== 'canceled' &&
        r.status !== 'no_show',
    )
  }, [monthReservations, selectedDate])

  const handlePrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const reservationActions = (reservation: ReservationWithCustomer) => ({
    onEdit: () => setEditing(reservation),
    onReschedule: () => setRescheduling(reservation),
    onCancel: () => setCanceling(reservation),
    onConvert: () => setConverting(reservation),
  })

  const calendarContent = (
    <div className="space-y-4">
      <MonthCalendar
        year={year}
        month={month}
        reservations={monthReservations}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {isLoading && <p className="text-sm text-mauve">読み込み中...</p>}

      <section>
        <h3 className="mb-3 text-base font-medium text-ink">
          {selectedDate
            ? `${selectedDate.replace(/-/g, '/')} の予約`
            : '日付を選択してください'}
        </h3>
        {selectedDayReservations.length === 0 ? (
          <EmptyState
            title="予約はありません"
            description="＋予約を追加から登録できます"
          />
        ) : (
          <div className="space-y-3">
            {selectedDayReservations.map((reservation) => (
              <ReservationListItem
                key={reservation.id}
                reservation={reservation}
                {...reservationActions(reservation)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )

  const listContent = (
    <div className="space-y-3">
      {upcomingLoading && <p className="text-sm text-mauve">読み込み中...</p>}
      {!upcomingLoading && upcoming.length === 0 && (
        <EmptyState
          title="今後の予約はありません"
          description="＋予約を追加から登録できます"
        />
      )}
      {upcoming.map((reservation) => (
        <ReservationListItem
          key={reservation.id}
          reservation={reservation}
          {...reservationActions(reservation)}
        />
      ))}
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium text-ink">予約カレンダー</h2>
          <p className="mt-1 text-sm text-mauve">変更・キャンセル・来店記録の管理</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>＋予約</Button>
      </section>

      {todayReservations.length > 0 && (
        <Card padding="sm">
          <h3 className="text-sm font-medium text-plum">本日の予約 ({todayReservations.length}件)</h3>
          <div className="mt-3 space-y-2">
            {todayReservations.map((reservation) => (
              <ReservationListItem
                key={reservation.id}
                reservation={reservation}
                compact
                {...reservationActions(reservation)}
              />
            ))}
          </div>
        </Card>
      )}

      <Tabs
        tabs={[
          { id: 'calendar', label: 'カレンダー', content: calendarContent },
          { id: 'list', label: 'リスト', content: listContent },
        ]}
        activeId={activeTab}
        onChange={setActiveTab}
      />

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="予約を追加">
        <ReservationForm
          initial={
            selectedDate ? { start_at: `${selectedDate}T10:00` } : undefined
          }
          onSuccess={() => {
            setShowCreate(false)
            showToast('予約を追加しました')
          }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="予約を編集">
        {editing && (
          <ReservationForm
            reservation={editing}
            onSuccess={() => {
              setEditing(null)
              showToast('予約を更新しました')
            }}
            onCancel={() => setEditing(null)}
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

      <Modal
        open={Boolean(converting)}
        onClose={() => setConverting(null)}
        title="来店記録にする"
      >
        {converting && (
          <VisitForm
            customerId={converting.customer_id}
            reservationId={converting.id}
            initialValues={{
              visit_date: toDateKey(converting.start_at),
              design_notes: converting.menu ?? '',
              work_notes: converting.notes ?? '',
            }}
            submitLabel="来店記録を保存"
            showCancel
            onCancel={() => setConverting(null)}
            onDone={() => {
              setConverting(null)
              showToast('来店記録を登録しました')
            }}
          />
        )}
      </Modal>
    </div>
  )
}
