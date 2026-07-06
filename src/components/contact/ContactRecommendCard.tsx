import { Link } from 'react-router-dom'
import { backState } from '../../lib/navigationState'
import type { ContactRecommendation } from '../../hooks/useContactRecommendations'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ScrollCard } from '../ui/HorizontalScroll'
import { CustomerSummaryCard } from '../customers/CustomerSummaryCard'

interface ContactRecommendCardProps {
  recommendation: ContactRecommendation
  onCompose: () => void
}

export function ContactRecommendCard({
  recommendation,
  onCompose,
}: ContactRecommendCardProps) {
  return (
    <ScrollCard>
      <Card padding="sm" className="h-full overflow-hidden p-0">
        <Link
          to={`/customers/${recommendation.id}`}
          state={backState('/', 'ホームへ')}
          className="block active:bg-petal/30"
        >
          <CustomerSummaryCard
            customerName={recommendation.name}
            status={recommendation}
            latestVisit={recommendation.latestVisit}
            upcomingReservation={recommendation.upcomingReservation}
            variant="scroll"
            bare
          />
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
