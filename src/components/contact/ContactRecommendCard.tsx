import { Link } from 'react-router-dom'
import { formatDaysSince } from '../../lib/messageTemplates'
import type { ContactRecommendation } from '../../hooks/useContactRecommendations'
import { SignedImage } from '../images/SignedImage'
import { Button } from '../ui/Button'

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
    <article className="overflow-hidden rounded-3xl border border-petal/70 bg-blush/50 shadow-sm">
      <div className="relative">
        <SignedImage
          storagePath={latestImage?.storage_path}
          alt={`${recommendation.name} の前回デザイン`}
          className="aspect-[4/3] w-full"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/60 to-transparent px-4 pb-3 pt-10">
          <div className="flex items-end justify-between gap-3">
            <Link
              to={`/customers/${recommendation.id}`}
              className="text-lg font-medium text-porcelain hover:text-petal"
            >
              {recommendation.name}
            </Link>
            <span className="shrink-0 rounded-full bg-petal/95 px-3 py-1 text-sm text-plum">
              {formatDaysSince(recommendation.days_since)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {recommendation.latestVisit?.design_notes && (
          <p className="text-sm leading-relaxed text-mauve">
            前回: {recommendation.latestVisit.design_notes}
          </p>
        )}

        {recommendation.latestVisit?.work_notes && (
          <p className="line-clamp-2 text-sm leading-relaxed text-mauve/80">
            {recommendation.latestVisit.work_notes}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button className="flex-1" onClick={onCompose}>
            文面を作る
          </Button>
          <Link to={`/customers/${recommendation.id}`} className="flex-1">
            <Button variant="secondary" className="w-full">
              詳細
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}
