import { Link } from 'react-router-dom'
import {
  formatReservationDate,
  formatReservationTime,
} from '../../hooks/useReservations'
import { formatDate, formatDaysSince } from '../../lib/messageTemplates'
import type { ContactRecommendation } from '../../hooks/useContactRecommendations'
import { SignedImage } from '../images/SignedImage'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ScrollCard } from '../ui/HorizontalScroll'

interface ContactRecommendCardProps {
  recommendation: ContactRecommendation
  onCompose: () => void
}

export function ContactRecommendCard({
  recommendation,
  onCompose,
}: ContactRecommendCardProps) {
  const latestImage = recommendation.latestVisit?.visit_images?.[0]
  const reservation = recommendation.upcomingReservation

  return (
    <ScrollCard>
      <Card padding="sm" className="h-full overflow-hidden p-0">
        <Link
          to={`/customers/${recommendation.id}`}
          className="block active:bg-petal/30"
        >
          <div className="flex gap-2.5 p-2.5">
            <div className="w-[4.5rem] shrink-0">
              <SignedImage
                storagePath={latestImage?.storage_path}
                alt={`${recommendation.name} の前回デザイン`}
                className="aspect-square w-full rounded-xl"
              />
              <p className="mt-1.5 line-clamp-2 text-center text-[11px] font-medium leading-tight text-ink">
                {recommendation.name}
              </p>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex justify-end">
                <span className="rounded-full bg-petal px-1.5 py-0.5 text-[9px] text-plum">
                  {formatDaysSince(recommendation.days_since)}
                </span>
              </div>

              {recommendation.last_visit && (
                <span className="mt-1 inline-block rounded-full bg-blush px-1.5 py-0.5 text-[10px] text-plum">
                  前回来店 {formatDate(recommendation.last_visit)}
                </span>
              )}

              <p className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-mauve">
                来店予定{' '}
                <span className="text-ink">
                  {reservation
                    ? `${formatReservationDate(reservation.start_at)} ${formatReservationTime(reservation.start_at)}`
                    : '予定無し'}
                </span>
              </p>
            </div>
          </div>
        </Link>

        <div className="border-t border-petal/50 px-2.5 py-2">
          <Button
            variant="secondary"
            className="w-full px-2 text-[10px]"
            onClick={(e) => {
              e.preventDefault()
              onCompose()
            }}
          >
            文面を作る
          </Button>
        </div>
      </Card>
    </ScrollCard>
  )
}
