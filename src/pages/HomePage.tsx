import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useContactRecommendations } from '../hooks/useContactRecommendations'
import { ContactRecommendCard } from '../components/contact/ContactRecommendCard'
import { MessageEditorModal } from '../components/contact/MessageEditorModal'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'

export function HomePage() {
  const { recommendations, isLoading, error } = useContactRecommendations()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = recommendations.find((item) => item.id === selectedId) ?? null

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-xl font-medium text-ink">連絡推奨</h2>
        <p className="mt-1 text-sm leading-relaxed text-mauve">
          前回来店から14日以上経過し、まだ連絡していない方を表示しています。
        </p>
      </section>

      <Card padding="sm">
        <p className="mb-3 text-sm font-medium text-ink">クイック操作</p>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/broadcast">
            <Button variant="secondary" className="w-full text-xs sm:text-sm">
              一斉送信
            </Button>
          </Link>
          <Link to="/visits">
            <Button variant="secondary" className="w-full text-xs sm:text-sm">
              来店分析
            </Button>
          </Link>
        </div>
      </Card>

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

      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <ContactRecommendCard
            key={recommendation.id}
            recommendation={recommendation}
            onCompose={() => setSelectedId(recommendation.id)}
          />
        ))}
      </div>

      {selected && (
        <MessageEditorModal
          open={Boolean(selected)}
          onClose={() => setSelectedId(null)}
          customerId={selected.id}
          customerName={selected.name}
          latestVisit={selected.latestVisit}
        />
      )}
    </div>
  )
}
