import type { ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

interface TabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeId, onChange, className = '' }: TabsProps) {
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0]

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex gap-1 rounded-2xl bg-blush/60 p-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-petal text-plum shadow-sm'
                  : 'text-mauve hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" className="mt-4">
        {activeTab?.content}
      </div>
    </div>
  )
}
