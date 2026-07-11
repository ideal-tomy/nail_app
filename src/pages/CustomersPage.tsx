import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  useCustomerListCardData,
  useCustomers,
  useCustomerStatuses,
} from '../hooks/useCustomers'
import { CustomerListItem } from '../components/customers/CustomerListItem'
import { CustomerForm } from '../components/customers/CustomerForm'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { SaveSuccessCard } from '../components/ui/SaveSuccessCard'
import { backState } from '../lib/navigationState'
import { supabase } from '../lib/supabase'
import type { CustomerFormData } from '../types/database'

type SortKey = 'name' | 'lastVisit'

export function CustomersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: customers = [], isLoading, error } = useCustomers()
  const { data: statuses = [] } = useCustomerStatuses()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [showCreate, setShowCreate] = useState(false)
  const [createdCustomer, setCreatedCustomer] = useState<{
    id: string
    name: string
  } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const statusMap = useMemo(
    () => new Map(statuses.map((status) => [status.id, status])),
    [statuses],
  )

  const customerIds = useMemo(
    () => customers.map((customer) => customer.id),
    [customers],
  )
  const { data: cardDataMap } = useCustomerListCardData(customerIds)

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const list = customers.filter((customer) =>
      customer.name.toLowerCase().includes(normalizedSearch),
    )

    return list.sort((a, b) => {
      if (sortKey === 'name') {
        return a.name.localeCompare(b.name, 'ja')
      }

      const aDate = statusMap.get(a.id)?.last_visit ?? ''
      const bDate = statusMap.get(b.id)?.last_visit ?? ''
      return bDate.localeCompare(aDate)
    })
  }, [customers, search, sortKey, statusMap])

  const handleCreate = async (form: CustomerFormData) => {
    const { data, error: insertError } = await supabase
      .from('customers')
      .insert({
        name: form.name.trim(),
        contact: form.contact.trim() || null,
        preferences: form.preferences.trim() || null,
        notes: form.notes.trim() || null,
        booking_notes: form.booking_notes.trim() || null,
        line_user_id: form.line_user_id.trim() || null,
      })
      .select('id, name')
      .single()

    if (insertError) throw insertError

    await queryClient.invalidateQueries({ queryKey: ['customers'] })
    await queryClient.invalidateQueries({ queryKey: ['customer-status'] })
    setShowCreate(false)
    setCreatedCustomer({ id: data.id, name: data.name })
  }

  const handleGoToReservation = () => {
    if (!createdCustomer) return
    navigate(`/customers/${createdCustomer.id}`, {
      state: {
        ...backState('/customers', '顧客一覧へ'),
        openReservation: true,
      },
    })
    setCreatedCustomer(null)
  }

  const handleStayOnList = () => {
    if (createdCustomer) {
      setSuccessMessage(`${createdCustomer.name} さんを登録しました`)
    }
    setCreatedCustomer(null)
  }

  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium text-ink">顧客一覧</h2>
        </div>
        <Button onClick={() => setShowCreate(true)}>＋新規</Button>
      </section>

      {successMessage && (
        <SaveSuccessCard
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input min-w-0"
          placeholder="名前で検索"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="field-input min-w-0"
        >
          <option value="name">名前順</option>
          <option value="lastVisit">最終来店日順</option>
        </select>
      </div>

      {isLoading && <p className="text-sm text-mauve">読み込み中...</p>}

      {error && (
        <p className="text-sm text-plum">
          {error instanceof Error ? error.message : '取得に失敗しました'}
        </p>
      )}

      <div className="grid grid-cols-3 gap-x-2 gap-y-4 pt-1">
        {filteredCustomers.map((customer) => {
          const cardData = cardDataMap?.get(customer.id)

          return (
            <CustomerListItem
              key={customer.id}
              customer={customer}
              status={statusMap.get(customer.id)}
              latestVisit={cardData?.latestVisit ?? null}
              upcomingReservation={cardData?.upcomingReservation ?? null}
            />
          )
        })}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="新規顧客">
        <CustomerForm
          submitLabel="登録する"
          onSubmit={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal
        open={Boolean(createdCustomer)}
        onClose={handleStayOnList}
        title="顧客を登録しました"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-ink">
            {createdCustomer?.name} さんを登録しました。続けて予約を追加しますか？
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={handleStayOnList}>
              一覧に戻る
            </Button>
            <Button className="flex-1" onClick={handleGoToReservation}>
              予約を追加
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
