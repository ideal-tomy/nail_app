import {
  formatReservationDate,
  formatReservationTime,
} from '../../hooks/useReservations'
import { formatDate, formatDaysSince } from '../../lib/messageTemplates'
import type { CustomerStatus, Reservation, VisitWithImages } from '../../types/database'
import { SignedImage } from '../images/SignedImage'
import { Card } from '../ui/Card'

function formatShortDate(date: string): string {
  const [, month, day] = date.split('-')
  return `${Number(month)}/${Number(day)}`
}

interface CustomerSummaryCardProps {
  customerName: string
  status?: CustomerStatus
  latestVisit?: VisitWithImages | null
  upcomingReservation?: Reservation | null
  variant?: 'tile' | 'hero'
  bare?: boolean
  onImageClick?: () => void
  className?: string
}

function DaysSinceBadge({ daysSince }: { daysSince: number }) {
  return (
    <span className="absolute -left-1 -top-2 z-10 whitespace-nowrap rounded-full bg-petal px-1.5 py-0.5 text-[9px] font-medium leading-none text-plum shadow-sm ring-1 ring-porcelain">
      {formatDaysSince(daysSince)}
    </span>
  )
}

function TileLayout({
  customerName,
  status,
  latestVisit,
  onImageClick,
}: {
  customerName: string
  status?: CustomerStatus
  latestVisit: VisitWithImages | null
  onImageClick?: () => void
}) {
  const latestImage = latestVisit?.visit_images?.[0]

  const image = onImageClick ? (
    <button type="button" onClick={onImageClick} className="block w-full">
      <SignedImage
        storagePath={latestImage?.storage_path}
        alt={`${customerName} の前回デザイン`}
        className="aspect-square w-full rounded-xl"
      />
    </button>
  ) : (
    <SignedImage
      storagePath={latestImage?.storage_path}
      alt={`${customerName} の前回デザイン`}
      className="aspect-square w-full rounded-xl"
    />
  )

  return (
    <div className="relative px-2 pb-2 pt-3">
      {status?.days_since != null && (
        <DaysSinceBadge daysSince={status.days_since} />
      )}

      {image}

      <p className="mt-1.5 line-clamp-2 text-center text-[11px] font-medium leading-tight text-ink">
        {customerName}
      </p>

      {status?.last_visit && (
        <p className="mt-1 text-center text-[10px] text-mauve">
          前回 {formatShortDate(status.last_visit)}
        </p>
      )}
    </div>
  )
}

function HeroLayout({
  customerName,
  status,
  latestVisit,
  upcomingReservation,
  onImageClick,
}: {
  customerName: string
  status?: CustomerStatus
  latestVisit: VisitWithImages | null
  upcomingReservation: Reservation | null
  onImageClick?: () => void
}) {
  const latestImage = latestVisit?.visit_images?.[0]
  const designPreview = latestVisit?.design_notes

  return (
    <div className="flex gap-2.5 p-2.5">
      <div className="w-[4.5rem] shrink-0">
        {onImageClick ? (
          <button type="button" onClick={onImageClick} className="block w-full text-left">
            <SignedImage
              storagePath={latestImage?.storage_path}
              alt={`${customerName} の前回デザイン`}
              className="aspect-square w-full rounded-xl"
            />
          </button>
        ) : (
          <SignedImage
            storagePath={latestImage?.storage_path}
            alt={`${customerName} の前回デザイン`}
            className="aspect-square w-full rounded-xl"
          />
        )}
        <p className="mt-1 line-clamp-2 text-center text-sm font-medium leading-tight text-ink">
          {customerName}
        </p>
      </div>

      <div className="min-w-0 flex-1">
        {status?.days_since != null && (
          <div className="flex justify-end">
            <span className="rounded-full bg-petal px-2 py-0.5 text-[10px] text-plum">
              {formatDaysSince(status.days_since)}
            </span>
          </div>
        )}

        {status?.last_visit && (
          <span className="mt-1 inline-block rounded-full bg-blush px-2 py-0.5 text-xs text-plum">
            前回来店 {formatDate(status.last_visit)}
          </span>
        )}

        {designPreview && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-ink">
            {designPreview}
          </p>
        )}

        <p className="mt-1.5 text-xs leading-snug text-mauve">
          来店予定{' '}
          <span className="text-ink">
            {upcomingReservation
              ? `${formatReservationDate(upcomingReservation.start_at)} ${formatReservationTime(upcomingReservation.start_at)}`
              : '予定無し'}
          </span>
        </p>
      </div>
    </div>
  )
}

export function CustomerSummaryCard({
  customerName,
  status,
  latestVisit = null,
  upcomingReservation = null,
  variant = 'tile',
  bare = false,
  onImageClick,
  className = '',
}: CustomerSummaryCardProps) {
  const body =
    variant === 'hero' ? (
      <HeroLayout
        customerName={customerName}
        status={status}
        latestVisit={latestVisit}
        upcomingReservation={upcomingReservation}
        onImageClick={onImageClick}
      />
    ) : (
      <TileLayout
        customerName={customerName}
        status={status}
        latestVisit={latestVisit}
        onImageClick={onImageClick}
      />
    )

  if (bare) {
    return <div className={`relative overflow-visible ${className}`}>{body}</div>
  }

  return (
    <div className={`relative overflow-visible ${className}`}>
      <Card padding="sm" className="overflow-hidden p-0">
        {body}
      </Card>
    </div>
  )
}

export type CustomerSummaryVariant = 'tile' | 'hero'
