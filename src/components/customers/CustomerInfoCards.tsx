import {
  formatReservationDate,
  formatReservationTime,
} from '../../hooks/useReservations'
import { formatDate } from '../../lib/messageTemplates'
import type { Customer, Reservation, VisitWithImages } from '../../types/database'
import { SignedImage } from '../images/SignedImage'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface CustomerInfoCardsProps {
  customer: Customer
  latestVisit: VisitWithImages | null
  upcomingReservation: Reservation | null
  onEdit: () => void
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-medium tracking-wide text-mauve uppercase">
      {children}
    </p>
  )
}

function MemoBlock({ label, content }: { label: string; content: string }) {
  return (
    <Card padding="sm">
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {content}
      </p>
    </Card>
  )
}

export function CustomerInfoCards({
  customer,
  latestVisit,
  upcomingReservation,
  onEdit,
}: CustomerInfoCardsProps) {
  const latestImage = latestVisit?.visit_images?.[0]

  return (
    <div className="space-y-3">
      <Card padding="sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <SectionLabel>基本情報</SectionLabel>
            <p className="mt-1 text-lg font-medium text-ink">{customer.name}</p>
            {customer.contact && (
              <p className="mt-1 text-sm text-mauve">{customer.contact}</p>
            )}
          </div>
          <Button variant="secondary" className="shrink-0 text-xs" onClick={onEdit}>
            編集
          </Button>
        </div>
      </Card>

      <Card padding="sm">
        <SectionLabel>来店予定</SectionLabel>
        {upcomingReservation ? (
          <p className="mt-2 text-sm text-ink">
            {formatReservationDate(upcomingReservation.start_at)}{' '}
            {formatReservationTime(upcomingReservation.start_at)}
            {upcomingReservation.menu && (
              <span className="mt-1 block text-xs text-mauve">
                {upcomingReservation.menu}
              </span>
            )}
          </p>
        ) : (
          <p className="mt-2 text-sm text-mauve">予定無し</p>
        )}
      </Card>

      <Card padding="sm">
        <SectionLabel>前回来店</SectionLabel>
        {latestVisit ? (
          <div className="mt-2 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-petal px-2.5 py-0.5 text-xs text-plum">
                {formatDate(latestVisit.visit_date)}
              </span>
              {latestVisit.price != null && (
                <span className="text-xs text-mauve">
                  ¥{latestVisit.price.toLocaleString()}
                </span>
              )}
            </div>

            {latestVisit.design_notes && (
              <p className="text-sm leading-relaxed text-ink">
                {latestVisit.design_notes}
              </p>
            )}

            <SignedImage
              storagePath={latestImage?.storage_path}
              alt={`${customer.name} の前回デザイン`}
              className="aspect-[4/3] w-full rounded-2xl"
            />
          </div>
        ) : (
          <p className="mt-2 text-sm text-mauve">来店履歴はまだありません</p>
        )}
      </Card>

      {customer.booking_notes && (
        <MemoBlock label="予約対応メモ" content={customer.booking_notes} />
      )}

      {customer.preferences && (
        <MemoBlock label="好み・季節メモ" content={customer.preferences} />
      )}

      {customer.notes && (
        <MemoBlock label="自由メモ" content={customer.notes} />
      )}
    </div>
  )
}
