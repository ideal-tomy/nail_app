import {
  formatReservationDate,
  formatReservationTime,
} from '../../hooks/useReservations'
import { formatDate, formatDaysSince } from '../../lib/messageTemplates'
import type { CustomerStatus, Reservation, VisitWithImages } from '../../types/database'
import { SignedImage } from '../images/SignedImage'
import { Card } from '../ui/Card'

const variantStyles = {
  grid: {
    gap: 'gap-1.5',
    padding: 'p-1.5',
    imageWidth: 'w-[3.25rem]',
    imageRadius: 'rounded-lg',
    nameSize: 'text-[10px]',
    daysBadge: 'text-[8px] px-1 py-0.5',
    lastVisitBadge: 'text-[9px] px-1 py-0.5',
    scheduleText: 'text-[9px] line-clamp-3',
    lastVisitPrefix: '前回',
  },
  scroll: {
    gap: 'gap-2.5',
    padding: 'p-2.5',
    imageWidth: 'w-[4.5rem]',
    imageRadius: 'rounded-xl',
    nameSize: 'text-[11px]',
    daysBadge: 'text-[9px] px-1.5 py-0.5',
    lastVisitBadge: 'text-[10px] px-1.5 py-0.5',
    scheduleText: 'text-[10px] line-clamp-2',
    lastVisitPrefix: '前回来店',
  },
  hero: {
    gap: 'gap-2.5',
    padding: 'p-2.5',
    imageWidth: 'w-[4.5rem]',
    imageRadius: 'rounded-xl',
    nameSize: 'text-sm',
    daysBadge: 'text-[10px] px-2 py-0.5',
    lastVisitBadge: 'text-xs px-2 py-0.5',
    scheduleText: 'text-xs',
    lastVisitPrefix: '前回来店',
  },
} as const

export type CustomerSummaryVariant = keyof typeof variantStyles

interface CustomerSummaryCardProps {
  customerName: string
  status?: CustomerStatus
  latestVisit?: VisitWithImages | null
  upcomingReservation?: Reservation | null
  variant?: CustomerSummaryVariant
  bare?: boolean
  onImageClick?: () => void
  className?: string
}

export function CustomerSummaryCard({
  customerName,
  status,
  latestVisit = null,
  upcomingReservation = null,
  variant = 'grid',
  bare = false,
  onImageClick,
  className = '',
}: CustomerSummaryCardProps) {
  const styles = variantStyles[variant]
  const latestImage = latestVisit?.visit_images?.[0]
  const designPreview = latestVisit?.design_notes

  const imageBlock = (
    <div className={`${styles.imageWidth} shrink-0`}>
      {onImageClick ? (
        <button
          type="button"
          onClick={onImageClick}
          className="block w-full text-left"
        >
          <SignedImage
            storagePath={latestImage?.storage_path}
            alt={`${customerName} の前回デザイン`}
            className={`aspect-square w-full ${styles.imageRadius}`}
          />
        </button>
      ) : (
        <SignedImage
          storagePath={latestImage?.storage_path}
          alt={`${customerName} の前回デザイン`}
          className={`aspect-square w-full ${styles.imageRadius}`}
        />
      )}
      <p
        className={`mt-1 line-clamp-2 text-center font-medium leading-tight text-ink ${styles.nameSize}`}
      >
        {customerName}
      </p>
    </div>
  )

  const body = (
    <div className={`flex ${styles.gap} ${styles.padding}`}>
      {imageBlock}

      <div className="min-w-0 flex-1">
        {status?.days_since != null && (
          <div className="flex justify-end">
            <span
              className={`rounded-full bg-petal text-plum ${styles.daysBadge}`}
            >
              {formatDaysSince(status.days_since)}
            </span>
          </div>
        )}

        {status?.last_visit && (
          <span
            className={`mt-1 inline-block rounded-full bg-blush text-plum ${styles.lastVisitBadge}`}
          >
            {styles.lastVisitPrefix} {formatDate(status.last_visit)}
          </span>
        )}

        {designPreview && variant === 'hero' && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-ink">
            {designPreview}
          </p>
        )}

        <p className={`mt-1.5 leading-snug text-mauve ${styles.scheduleText}`}>
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

  if (bare) {
    return <div className={className}>{body}</div>
  }

  return (
    <Card padding="sm" className={`overflow-hidden p-0 ${className}`}>
      {body}
    </Card>
  )
}
