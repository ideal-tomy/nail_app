import { Link } from 'react-router-dom'
import { formatDaysSince } from '../../lib/messageTemplates'
import type { ContactRecommendation } from '../../hooks/useContactRecommendations'
import { Button } from '../ui/Button'

interface ContactRecommendCardProps {
  recommendation: ContactRecommendation
  onCompose: () => void
}

export function ContactRecommendCard({
  recommendation,
  onCompose,
}: ContactRecommendCardProps) {
  return (
    <article className="rounded-3xl border border-petal/70 bg-blush/50 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <Link
          to={`/customers/${recommendation.id}`}
          className="text-lg font-medium text-ink hover:text-plum"
        >
          {recommendation.name}
        </Link>
        <span className="shrink-0 rounded-full bg-petal px-3 py-1 text-sm text-plum">
          {formatDaysSince(recommendation.days_since)}
        </span>
      </div>

      {recommendation.latestVisit?.design_notes && (
        <p className="mt-2 text-sm leading-relaxed text-mauve">
          前回: {recommendation.latestVisit.design_notes}
        </p>
      )}

      {recommendation.latestVisit?.work_notes && (
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-mauve/80">
          {recommendation.latestVisit.work_notes}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <Button className="flex-1" onClick={onCompose}>
          文面を作る
        </Button>
        <Link to={`/customers/${recommendation.id}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            詳細
          </Button>
        </Link>
      </div>
    </article>
  )
}
