import { useState } from 'react'
import type { CustomerFormData } from '../../types/database'
import { Button } from '../ui/Button'

interface CustomerFormProps {
  initial?: CustomerFormData
  submitLabel: string
  onSubmit: (data: CustomerFormData) => Promise<void>
  onCancel?: () => void
}

const emptyForm: CustomerFormData = {
  name: '',
  contact: '',
  preferences: '',
  notes: '',
  booking_notes: '',
  line_user_id: '',
}

export function CustomerForm({
  initial = emptyForm,
  submitLabel,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormData>(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof CustomerFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('名前は必須です')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSubmit(form)
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
      <Field label="名前" required>
        <input
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className="field-input"
          placeholder="例: 山田 花子"
        />
      </Field>
      <Field label="連絡先メモ" hint="LINEの表示名・電話番号など">
        <input
          value={form.contact}
          onChange={(e) => handleChange('contact', e.target.value)}
          className="field-input"
          placeholder="例: LINE: はなこ / 090-xxxx"
        />
      </Field>
      <Field
        label="LINE userId（任意）"
        hint="公式LINE連携用。U で始まるID。未連携なら空欄でOK"
      >
        <input
          value={form.line_user_id}
          onChange={(e) => handleChange('line_user_id', e.target.value)}
          className="field-input font-mono text-xs"
          placeholder="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        />
      </Field>
      <Field label="好み・季節メモ">
        <textarea
          value={form.preferences}
          onChange={(e) => handleChange('preferences', e.target.value)}
          className="field-input min-h-24"
          placeholder="好きな色味、季節の傾向など"
        />
      </Field>
      <Field
        label="予約対応メモ"
        hint="キャンセル傾向・前日確認の要否など"
      >
        <textarea
          value={form.booking_notes}
          onChange={(e) => handleChange('booking_notes', e.target.value)}
          className="field-input min-h-20"
          placeholder="例: キャンセル多め・前日LINE確認必須"
        />
      </Field>
      <Field label="自由メモ">
        <textarea
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          className="field-input min-h-24"
          placeholder="その他メモ"
        />
      </Field>

      {error && <p className="text-sm text-plum">{error}</p>}

      <div className="flex gap-3">
        {onCancel && (
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
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-plum"> *</span>}
      </span>
      {hint && <span className="block text-xs text-mauve">{hint}</span>}
      {children}
    </label>
  )
}
