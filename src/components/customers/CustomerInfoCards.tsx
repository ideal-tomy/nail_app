import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/messageTemplates'
import type { Customer, VisitWithImages } from '../../types/database'
import { SignedImage } from '../images/SignedImage'
import { Button } from '../ui/Button'
import { HorizontalScroll, ScrollCard } from '../ui/HorizontalScroll'

interface CustomerInfoCardsProps {
  customer: Customer
  latestVisit: VisitWithImages | null
  onEdit: () => void
}

function InfoCard({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <article
      className={`flex aspect-square flex-col overflow-hidden rounded-3xl border border-petal/70 bg-blush/50 shadow-sm ${className}`}
    >
      <div className="flex flex-1 flex-col p-3">
        <p className="text-xs text-mauve">{label}</p>
        <div className="mt-1 flex-1 overflow-hidden text-sm leading-relaxed text-ink">
          {children}
        </div>
      </div>
    </article>
  )
}

export function CustomerInfoCards({
  customer,
  latestVisit,
  onEdit,
}: CustomerInfoCardsProps) {
  const latestImage = latestVisit?.visit_images?.[0]

  return (
    <HorizontalScroll>
      <ScrollCard>
        <InfoCard label="基本情報">
          <p className="line-clamp-2 text-base font-medium">{customer.name}</p>
          {customer.contact && (
            <p className="mt-2 line-clamp-3 text-xs text-mauve">{customer.contact}</p>
          )}
          <div className="mt-auto pt-2">
            <Button variant="secondary" className="w-full px-2 text-xs" onClick={onEdit}>
              編集
            </Button>
          </div>
        </InfoCard>
      </ScrollCard>

      {customer.booking_notes && (
        <ScrollCard>
          <InfoCard label="予約対応メモ">
            <p className="line-clamp-[7] whitespace-pre-wrap">{customer.booking_notes}</p>
          </InfoCard>
        </ScrollCard>
      )}

      {customer.preferences && (
        <ScrollCard>
          <InfoCard label="好み・季節メモ">
            <p className="line-clamp-[7] whitespace-pre-wrap">{customer.preferences}</p>
          </InfoCard>
        </ScrollCard>
      )}

      {customer.notes && (
        <ScrollCard>
          <InfoCard label="自由メモ">
            <p className="line-clamp-[7] whitespace-pre-wrap">{customer.notes}</p>
          </InfoCard>
        </ScrollCard>
      )}

      {latestVisit && (
        <ScrollCard>
          <Link to={`/customers/${customer.id}`} className="block">
            <article className="flex aspect-square flex-col overflow-hidden rounded-3xl border border-petal/70 bg-blush/50 shadow-sm">
              <SignedImage
                storagePath={latestImage?.storage_path}
                alt={`${customer.name} の前回デザイン`}
                className="aspect-square w-full shrink-0"
              />
              <div className="flex flex-1 flex-col p-3">
                <p className="text-xs text-mauve">前回来店</p>
                <p className="mt-0.5 text-sm font-medium">
                  {formatDate(latestVisit.visit_date)}
                </p>
                {latestVisit.design_notes && (
                  <p className="mt-1 line-clamp-2 text-xs text-mauve">
                    {latestVisit.design_notes}
                  </p>
                )}
                {latestVisit.price != null && (
                  <p className="mt-auto inline-block w-fit rounded-full bg-petal px-2 py-0.5 text-xs text-plum">
                    ¥{latestVisit.price.toLocaleString()}
                  </p>
                )}
              </div>
            </article>
          </Link>
        </ScrollCard>
      )}

      {!customer.preferences && !customer.notes && !customer.booking_notes && !latestVisit && (
        <ScrollCard>
          <InfoCard label="メモ">
            <p className="text-mauve">メモはまだありません</p>
          </InfoCard>
        </ScrollCard>
      )}
    </HorizontalScroll>
  )
}
