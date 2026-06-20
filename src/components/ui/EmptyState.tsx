interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-petal bg-blush/60 px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-mauve">{description}</p>
      )}
    </div>
  )
}
