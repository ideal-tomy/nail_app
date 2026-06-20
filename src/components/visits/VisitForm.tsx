import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { compressImage, generateImagePath } from '../../lib/imageCompress'
import { todayISO } from '../../lib/messageTemplates'
import { supabase } from '../../lib/supabase'
import type { VisitFormData } from '../../types/database'
import { Button } from '../ui/Button'

interface VisitFormProps {
  customerId: string
  initialValues?: Partial<VisitFormData>
  reservationId?: string
  onDone?: (visitId: string) => void | Promise<void>
  submitLabel?: string
  showCancel?: boolean
  onCancel?: () => void
}

const defaultForm = (): VisitFormData => ({
  visit_date: todayISO(),
  design_notes: '',
  work_notes: '',
  price: '',
})

export function VisitForm({
  customerId,
  initialValues,
  reservationId,
  onDone,
  submitLabel = '来店を保存',
  showCancel = false,
  onCancel,
}: VisitFormProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<VisitFormData>({
    ...defaultForm(),
    ...initialValues,
  })
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof VisitFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    setFiles(selected)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const priceValue = form.price.trim()
        ? Number.parseInt(form.price, 10)
        : null

      if (priceValue != null && Number.isNaN(priceValue)) {
        throw new Error('価格は数値で入力してください')
      }

      const { data: visit, error: visitError } = await supabase
        .from('visits')
        .insert({
          customer_id: customerId,
          visit_date: form.visit_date,
          design_notes: form.design_notes || null,
          work_notes: form.work_notes || null,
          price: priceValue,
        })
        .select()
        .single()

      if (visitError) throw visitError

      for (const file of files) {
        const compressed = await compressImage(file)
        const storagePath = generateImagePath(customerId, visit.id)

        const { error: uploadError } = await supabase.storage
          .from('nail-images')
          .upload(storagePath, compressed, {
            contentType: 'image/jpeg',
            upsert: false,
          })

        if (uploadError) throw uploadError

        const { error: imageError } = await supabase.from('visit_images').insert({
          visit_id: visit.id,
          storage_path: storagePath,
        })

        if (imageError) throw imageError
      }

      if (reservationId) {
        const { error: reservationError } = await supabase
          .from('reservations')
          .update({ status: 'done', visit_id: visit.id })
          .eq('id', reservationId)

        if (reservationError) throw reservationError
      }

      await queryClient.invalidateQueries({ queryKey: ['visits', customerId] })
      await queryClient.invalidateQueries({ queryKey: ['visits', 'all'] })
      await queryClient.invalidateQueries({ queryKey: ['customer-status'] })
      await queryClient.invalidateQueries({ queryKey: ['contact-recommendations'] })
      await queryClient.invalidateQueries({ queryKey: ['reservations'] })

      if (onDone) {
        await onDone(visit.id)
      } else {
        navigate(`/customers/${customerId}`)
      }
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
      <Field label="来店日" required>
        <input
          type="date"
          value={form.visit_date}
          onChange={(e) => handleChange('visit_date', e.target.value)}
          className="field-input"
          required
        />
      </Field>

      <Field label="デザイン内容">
        <textarea
          value={form.design_notes}
          onChange={(e) => handleChange('design_notes', e.target.value)}
          className="field-input min-h-24"
          placeholder="例: くすみピンクのワンカラー"
        />
      </Field>

      <Field label="施術メモ">
        <textarea
          value={form.work_notes}
          onChange={(e) => handleChange('work_notes', e.target.value)}
          className="field-input min-h-24"
          placeholder="使用カラー・長さ・パーツなど"
        />
      </Field>

      <Field label="価格（任意）">
        <input
          type="number"
          inputMode="numeric"
          value={form.price}
          onChange={(e) => handleChange('price', e.target.value)}
          className="field-input"
          placeholder="例: 8000"
        />
      </Field>

      <Field label="完成画像（複数可）">
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handleFileChange}
          className="block w-full text-sm text-mauve file:mr-3 file:rounded-xl file:border-0 file:bg-petal file:px-4 file:py-2 file:text-sm file:text-plum"
        />
        {files.length > 0 && (
          <p className="text-sm text-mauve">{files.length}枚選択中</p>
        )}
      </Field>

      {error && <p className="text-sm text-plum">{error}</p>}

      <div className="flex gap-3">
        {showCancel && onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={saving}>
          {saving ? '保存中...' : submitLabel}
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
