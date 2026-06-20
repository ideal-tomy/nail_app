import { formatDate } from '../../lib/messageTemplates'
import type { VisitWithImages } from '../../types/database'
import { VisitImageGallery } from '../images/VisitImageGallery'

interface LatestVisitSectionProps {
  visit: VisitWithImages
  customerName: string
}

export function LatestVisitSection({ visit, customerName }: LatestVisitSectionProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-petal/70 bg-blush/40">
      <div className="space-y-3 p-4">
        <p className="text-sm text-mauve">前回来店</p>
        <p className="text-xl font-medium text-ink">{formatDate(visit.visit_date)}</p>

        {(visit.design_notes || visit.work_notes) && (
          <div className="space-y-2">
            {visit.design_notes && (
              <div>
                <p className="text-xs text-mauve">デザイン</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink">
                  {visit.design_notes}
                </p>
              </div>
            )}
            {visit.work_notes && (
              <div>
                <p className="text-xs text-mauve">施術内容</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink">
                  {visit.work_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {visit.price != null && (
          <p className="inline-block rounded-full bg-petal px-3 py-1 text-sm text-plum">
            ¥{visit.price.toLocaleString()}
          </p>
        )}
      </div>

      <VisitImageGallery
        images={visit.visit_images ?? []}
        altPrefix={`${customerName} ${visit.visit_date}`}
        variant="hero"
      />
    </section>
  )
}
