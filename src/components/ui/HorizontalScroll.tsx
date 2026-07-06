import type { ReactNode } from 'react'

interface HorizontalScrollProps {
  children: ReactNode
  className?: string
}

export function HorizontalScroll({ children, className = '' }: HorizontalScrollProps) {
  return (
    <div className={`-mx-4 overflow-hidden ${className}`}>
      <div
        className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  )
}

interface ScrollCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

const cardWidthClass =
  'w-[calc((min(100vw,42rem)-2rem-0.75rem)/2.5)] shrink-0 snap-start'

export function ScrollCard({ children, className = '', onClick }: ScrollCardProps) {
  const cardClass = `${cardWidthClass} ${className}`

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`text-left ${cardClass}`}>
        {children}
      </button>
    )
  }

  return <div className={cardClass}>{children}</div>
}
