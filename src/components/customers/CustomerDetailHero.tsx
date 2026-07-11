import { useState } from 'react'
import type { Customer, CustomerStatus, Reservation, VisitWithImages } from '../../types/database'
import { ImageLightbox } from '../images/ImageLightbox'
import { Button } from '../ui/Button'
import { CustomerSummaryCard } from './CustomerSummaryCard'

interface CustomerDetailHeroProps {
  customer: Customer
  status?: CustomerStatus
  latestVisit: VisitWithImages | null
  upcomingReservation: Reservation | null
  onEdit: () => void
  onCompose: () => void
}

export function CustomerDetailHero({
  customer,
  status,
  latestVisit,
  upcomingReservation,
  onEdit,
  onCompose,
}: CustomerDetailHeroProps) {
  const [lightboxPath, setLightboxPath] = useState<string | null>(null)
  const latestImagePath = latestVisit?.visit_images?.[0]?.storage_path ?? null

  return (
    <div className="space-y-3">
      <CustomerSummaryCard
        customerName={customer.name}
        status={status}
        latestVisit={latestVisit}
        upcomingReservation={upcomingReservation}
        variant="hero"
        onImageClick={
          latestImagePath ? () => setLightboxPath(latestImagePath) : undefined
        }
      />

      {customer.contact && (
        <p className="px-1 text-sm text-mauve">{customer.contact}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" className="flex-1 text-xs" onClick={onEdit}>
          編集
        </Button>
        <Button variant="line" className="flex-1 text-xs" onClick={onCompose}>
          文面作成
        </Button>
      </div>

      {lightboxPath && (
        <ImageLightbox
          storagePath={lightboxPath}
          alt={`${customer.name} の前回デザイン`}
          onClose={() => setLightboxPath(null)}
        />
      )}
    </div>
  )
}
