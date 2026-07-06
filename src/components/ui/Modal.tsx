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
      <div className="relative z-10 flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-porcelain shadow-xl sm:max-h-[90dvh]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-petal/50 px-5 pb-4 pt-5">
          <h2 className="text-lg font-medium leading-snug text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full px-3 py-1 text-sm text-mauve hover:bg-blush"
          >
            閉じる
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-5 pt-4">{children}</div>
      </div>
    </div>
  )
}
