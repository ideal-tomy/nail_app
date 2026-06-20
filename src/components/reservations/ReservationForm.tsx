import { useEffect, useState } from 'react'
import { checkReservationOverlap } from '../../lib/reservationOps'
import { nowLocalDatetimeValue } from '../../lib/messageTemplates'
import { useCustomers } from '../../hooks/useCustomers'
import {
  toLocalDatetimeValue,
  useReservationMutations,
  useUpcomingReservations,
} from '../../hooks/useReservations'
import type { ReservationFormData, ReservationWithCustomer } from '../../types/database'
import { Button } from '../ui/Button'

interface ReservationFormProps {
  initial?: Partial<ReservationFormData>
  reservation?: ReservationWithCustomer
  fixedCustomerId?: string
  onSuccess: () => void
  onCancel: () => void
}

const emptyForm = (fixedCustomerId?: string): ReservationFormData => ({
  customer_id: fixedCustomerId ?? '',
  start_at: nowLocalDatetimeValue(),
  duration_min: '60',
  menu: '',
  notes: '',
})

export function ReservationForm({
  initial,
  reservation,
  fixedCustomerId,
  onSuccess,
  onCancel,
}: ReservationFormProps) {
  const { data: customers = [] } = useCustomers()
  const { data: upcoming = [] } = useUpcomingReservations()
  const { create, update } = useReservationMutations()
  const [form, setForm] = useState<ReservationFormData>(() => ({
    ...emptyForm(fixedCustomerId),
    ...initial,
  }))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (reservation) {
      setForm({
        customer_id: reservation.customer_id,
        start_at: toLocalDatetimeValue(reservation.start_at),
        duration_min: reservation.duration_min?.toString() ?? '',
        menu: reservation.menu ?? '',
        notes: reservation.notes ?? '',
      })
    }
  }, [reservation])

  const handleChange = (field: keyof ReservationFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!form.customer_id) {
        throw new Error('顧客を選択してください')
      }

      const durationMin = form.duration_min.trim()
        ? Number.parseInt(form.duration_min, 10)
        : null

      const overlap = checkReservationOverlap(
        new Date(form.start_at).toISOString(),
        durationMin,
        upcoming,
        reservation?.id,
      )

      if (overlap) {
        const confirmOverlap = window.confirm(
          `${overlap.customers?.name ?? '別の'}予約と時間が重なっています。このまま登録しますか？`,
        )
        if (!confirmOverlap) {
          setSaving(false)
          return
        }
      }

      if (reservation) {
        await update.mutateAsync({ id: reservation.id, form })
      } else {
        await create.mutateAsync(form)
      }
      onSuccess()
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '保存に失敗しました',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!fixedCustomerId && (
        <Field label="顧客" required>
          <select
            value={form.customer_id}
            onChange={(e) => handleChange('customer_id', e.target.value)}
            className="field-input"
            required
          >
            <option value="">選択してください</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="予約日時" required>
        <input
          type="datetime-local"
          value={form.start_at}
          onChange={(e) => handleChange('start_at', e.target.value)}
          className="field-input"
          required
        />
      </Field>

      <Field label="所要時間（分・任意）">
        <input
          type="number"
          inputMode="numeric"
          value={form.duration_min}
          onChange={(e) => handleChange('duration_min', e.target.value)}
          className="field-input"
          placeholder="例: 60"
        />
      </Field>

      <Field label="メニュー（任意）">
        <input
          type="text"
          value={form.menu}
          onChange={(e) => handleChange('menu', e.target.value)}
          className="field-input"
          placeholder="例: ジェルネイル・フレンチ"
        />
      </Field>

      <Field label="メモ（任意）">
        <textarea
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="field-input min-h-20"
          placeholder="ご要望・注意事項など"
        />
      </Field>

      {error && <p className="text-sm text-plum">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? '保存中...' : reservation ? '更新する' : '予約を追加'}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-plum"> *</span>}
      </span>
      {children}
    </label>
  )
}
