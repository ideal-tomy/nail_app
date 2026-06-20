import type { ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 pb-24 sm:items-center sm:pb-4">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl bg-porcelain p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-mauve hover:bg-blush"
          >
            閉じる
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
