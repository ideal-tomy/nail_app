import type { Customer } from '../../types/database'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface CustomerSalonMemosProps {
  customer: Customer
  onEdit: () => void
}

function MemoSection({
  label,
  content,
  variant = 'default',
}: {
  label: string
  content: string
  variant?: 'default' | 'warning'
}) {
  return (
    <div
      className={
        variant === 'warning'
          ? 'rounded-xl border border-plum/30 bg-plum/10 px-3 py-2.5'
          : ''
      }
    >
      <p
        className={`text-xs font-medium ${variant === 'warning' ? 'text-plum' : 'text-mauve'}`}
      >
        {variant === 'warning' ? `⚠ ${label}` : label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {content}
      </p>
    </div>
  )
}

export function CustomerSalonMemos({ customer, onEdit }: CustomerSalonMemosProps) {
  const hasBookingNotes = Boolean(customer.booking_notes?.trim())
  const hasPreferences = Boolean(customer.preferences?.trim())
  const hasNotes = Boolean(customer.notes?.trim())
  const isEmpty = !hasBookingNotes && !hasPreferences && !hasNotes

  return (
    <Card padding="sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-mauve uppercase">
          サロンメモ
        </p>
        <Button variant="secondary" className="shrink-0 text-xs" onClick={onEdit}>
          編集
        </Button>
      </div>

      {isEmpty ? (
        <p className="mt-2 text-sm text-mauve">
          メモを追加すると、予約対応や好みをここで確認できます。
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {hasBookingNotes && (
            <MemoSection
              label="予約対応"
              content={customer.booking_notes!}
              variant="warning"
            />
          )}

          {hasPreferences && (
            <>
              {hasBookingNotes && <div className="border-t border-petal/50" />}
              <MemoSection label="好み・季節" content={customer.preferences!} />
            </>
          )}

          {hasNotes && (
            <>
              {(hasBookingNotes || hasPreferences) && (
                <div className="border-t border-petal/50" />
              )}
              <MemoSection label="自由メモ" content={customer.notes!} />
            </>
          )}
        </div>
      )}
    </Card>
  )
}
