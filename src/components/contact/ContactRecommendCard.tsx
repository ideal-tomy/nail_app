import { Link } from 'react-router-dom'
import { formatDaysSince } from '../../lib/messageTemplates'
import type { ContactRecommendation } from '../../hooks/useContactRecommendations'
import { SignedImage } from '../images/SignedImage'
import { Button } from '../ui/Button'
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

  return (
    <ScrollCard>
      <article className="flex aspect-square flex-col overflow-hidden rounded-3xl border border-petal/70 bg-blush/50 shadow-sm">
        <SignedImage
          storagePath={latestImage?.storage_path}
          alt={`${recommendation.name} の前回デザイン`}
          className="aspect-square w-full shrink-0"
        />

        <div className="flex flex-1 flex-col p-3">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/customers/${recommendation.id}`}
              className="line-clamp-1 text-sm font-medium text-ink hover:text-plum"
            >
              {recommendation.name}
            </Link>
            <span className="shrink-0 rounded-full bg-petal px-2 py-0.5 text-[10px] text-plum">
              {formatDaysSince(recommendation.days_since)}
            </span>
          </div>

          {recommendation.latestVisit?.design_notes && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mauve">
              {recommendation.latestVisit.design_notes}
            </p>
          )}

          <div className="mt-auto flex gap-1.5 pt-2">
            <Button className="flex-1 px-2 text-[10px]" onClick={onCompose}>
              文面を作る
            </Button>
            <Link to={`/customers/${recommendation.id}`} className="flex-1">
              <Button variant="secondary" className="w-full px-2 text-[10px]">
                詳細
              </Button>
            </Link>
          </div>
        </div>
      </article>
    </ScrollCard>
  )
}
