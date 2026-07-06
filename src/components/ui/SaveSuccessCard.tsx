import { useEffect } from 'react'

interface SaveSuccessCardProps {
  message: string
  onDismiss: () => void
  autoDismissMs?: number
}

export function SaveSuccessCard({
  message,
  onDismiss,
  autoDismissMs = 4000,
}: SaveSuccessCardProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, autoDismissMs)
    return () => window.clearTimeout(timer)
  }, [onDismiss, autoDismissMs])

  return (
    <div
      className="flex items-start justify-between gap-3 rounded-2xl border border-plum/30 bg-petal/40 px-4 py-3"
      role="status"
    >
      <p className="text-sm leading-relaxed text-ink">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-sm text-mauve hover:text-plum"
        aria-label="閉じる"
      >
        ×
      </button>
    </div>
  )
}
