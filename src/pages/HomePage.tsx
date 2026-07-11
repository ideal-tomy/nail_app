import { useState } from 'react'
import { useContactRecommendations } from '../hooks/useContactRecommendations'
import { ContactRecommendCard } from '../components/contact/ContactRecommendCard'
import { MessageEditorModal } from '../components/contact/MessageEditorModal'
import { HomeScheduleSection } from '../components/home/HomeScheduleSection'
import { HorizontalScroll } from '../components/ui/HorizontalScroll'
import { EmptyState } from '../components/ui/EmptyState'

export function HomePage() {
  const { recommendations, isLoading, error } = useContactRecommendations()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = recommendations.find((item) => item.id === selectedId) ?? null

  return (
    <div className="space-y-8">
      <section className="space-y-5">
        <h2 className="text-xl font-medium text-ink">連絡推奨</h2>

        {isLoading && (
          <p className="text-sm text-mauve">読み込み中...</p>
        )}

        {error && (
          <p className="text-sm text-plum">
            {error instanceof Error ? error.message : 'データの取得に失敗しました'}
          </p>
        )}

        {!isLoading && !error && recommendations.length === 0 && (
          <EmptyState title="今は連絡推奨の顧客はいません" />
        )}

        {!isLoading && !error && recommendations.length > 0 && (
          <HorizontalScroll>
            {recommendations.map((recommendation) => (
              <ContactRecommendCard
                key={recommendation.id}
                recommendation={recommendation}
                onCompose={() => setSelectedId(recommendation.id)}
              />
            ))}
          </HorizontalScroll>
        )}

        {selected && (
          <MessageEditorModal
            open={Boolean(selected)}
            onClose={() => setSelectedId(null)}
            customerId={selected.id}
            customerName={selected.name}
            latestVisit={selected.latestVisit}
            canPushOfficial={Boolean(selected.line_user_id)}
          />
        )}
      </section>

      <HomeScheduleSection />
    </div>
  )
}
