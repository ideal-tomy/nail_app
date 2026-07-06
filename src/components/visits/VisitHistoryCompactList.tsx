import { useState } from 'react'
import { formatDate } from '../../lib/messageTemplates'
import type { VisitWithImages } from '../../types/database'
import { SignedImage } from '../images/SignedImage'
import { VisitDetailModal } from './VisitDetailModal'

interface VisitHistoryCompactListProps {
  visits: VisitWithImages[]
  customerName: string
}

function VisitThumbnail({ visit }: { visit: VisitWithImages }) {
  const imagePath = visit.visit_images?.[0]?.storage_path

  if (imagePath) {
    return (
      <SignedImage
        storagePath={imagePath}
        alt=""
        className="h-12 w-12 shrink-0 rounded-lg object-cover"
      />
    )
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-petal/60 text-lg text-mauve">
      ◎
    </div>
  )
}

export function VisitHistoryCompactList({
  visits,
  customerName,
}: VisitHistoryCompactListProps) {
  const [selectedVisit, setSelectedVisit] = useState<VisitWithImages | null>(null)

  return (
    <>
      <div className="space-y-2">
        {visits.map((visit) => (
          <button
            key={visit.id}
            type="button"
            onClick={() => setSelectedVisit(visit)}
            className="flex w-full items-center gap-3 rounded-2xl border border-petal/60 bg-blush/40 px-3 py-2.5 text-left transition hover:bg-blush active:bg-petal/30"
          >
            <VisitThumbnail visit={visit} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-ink">
                  {formatDate(visit.visit_date)}
                </p>
                {visit.price != null && (
                  <p className="shrink-0 text-xs text-mauve">
                    ¥{visit.price.toLocaleString()}
                  </p>
                )}
              </div>
              <p className="mt-0.5 truncate text-sm text-mauve">
                {visit.design_notes || visit.work_notes || 'メモなし'}
              </p>
            </div>
          </button>
        ))}
      </div>

      <VisitDetailModal
        open={Boolean(selectedVisit)}
        onClose={() => setSelectedVisit(null)}
        visit={selectedVisit}
        customerName={customerName}
      />
    </>
  )
}
