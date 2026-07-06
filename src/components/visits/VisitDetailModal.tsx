import { VisitHistoryItem } from './VisitHistoryItem'
import type { VisitWithImages } from '../../types/database'
import { Modal } from '../ui/Modal'

interface VisitDetailModalProps {
  open: boolean
  onClose: () => void
  visit: VisitWithImages | null
  customerName: string
}

export function VisitDetailModal({
  open,
  onClose,
  visit,
  customerName,
}: VisitDetailModalProps) {
  if (!visit) return null

  return (
    <Modal open={open} onClose={onClose} title="来店詳細">
      <VisitHistoryItem visit={visit} customerName={customerName} />
    </Modal>
  )
}
