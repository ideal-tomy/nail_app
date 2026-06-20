import { useState, type ReactNode } from 'react'

interface AccordionItemProps {
  title: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-2xl border border-petal/60 bg-blush/30">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">{title}</div>
        <span
          className={`shrink-0 text-mauve transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▼
        </span>
      </button>
      {open && (
        <div className="border-t border-petal/50 px-4 pb-4 pt-3">{children}</div>
      )}
    </div>
  )
}

interface AccordionProps {
  children: ReactNode
  className?: string
}

export function Accordion({ children, className = '' }: AccordionProps) {
  return <div className={`space-y-2 ${className}`}>{children}</div>
}
