import { formatDate } from '../../lib/messageTemplates'
import type { VisitWithImages } from '../../types/database'
import { VisitImageGallery } from '../images/VisitImageGallery'

interface VisitHistoryItemProps {
  visit: VisitWithImages
  customerName: string
  embedded?: boolean
}

export function VisitHistoryItem({
  visit,
  customerName,
  embedded = false,
}: VisitHistoryItemProps) {
  const content = (
    <>
      {!embedded && (
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-mauve">来店日</p>
              <p className="text-lg font-medium text-ink">{formatDate(visit.visit_date)}</p>
            </div>
            {visit.price != null && (
              <p className="shrink-0 rounded-full bg-petal px-3 py-1 text-sm text-plum">
                ¥{visit.price.toLocaleString()}
              </p>
            )}
          </div>

          {(visit.design_notes || visit.work_notes) && (
            <div className="space-y-2 border-t border-petal/50 pt-3">
              {visit.design_notes && (
                <div>
                  <p className="text-xs text-mauve">デザイン</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {visit.design_notes}
                  </p>
                </div>
              )}
              {visit.work_notes && (
                <div>
                  <p className="text-xs text-mauve">施術内容</p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                    {visit.work_notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {embedded && (visit.design_notes || visit.work_notes || visit.price != null) && (
        <div className="mb-3 space-y-2">
          {visit.design_notes && (
            <div>
              <p className="text-xs text-mauve">デザイン</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {visit.design_notes}
              </p>
            </div>
          )}
          {visit.work_notes && (
            <div>
              <p className="text-xs text-mauve">施術内容</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {visit.work_notes}
              </p>
            </div>
          )}
          {visit.price != null && (
            <p className="inline-block rounded-full bg-petal px-3 py-1 text-sm text-plum">
              ¥{visit.price.toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className={embedded ? '' : 'px-4 pb-4'}>
        <VisitImageGallery
          images={visit.visit_images ?? []}
          altPrefix={`${customerName} ${visit.visit_date}`}
          variant="history"
        />
      </div>
    </>
  )

  if (embedded) {
    return <div>{content}</div>
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-petal/60 bg-blush/40">
      {content}
    </article>
  )
}
