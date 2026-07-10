import type { LucideIcon } from "lucide-react"
import { Zap } from "lucide-react"

export interface EmptyStateProps {
  /** Primary heading */
  title: string
  /** Supporting sentence or two */
  description: string
  /** Lucide icon to display above the text. Defaults to Zap. */
  Icon?: LucideIcon
  /** Optional call-to-action rendered below the description */
  action?: React.ReactNode
}

/**
 * EmptyState
 *
 * A reusable centred empty-state block for use inside scrollable
 * content areas (e.g. the chat message list, a history panel, etc.).
 *
 * Purely presentational — no hooks, no wallet state, no contract reads.
 */
export function EmptyState({
  title,
  description,
  Icon = Zap,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center select-none">
      {/* Icon halo */}
      <div className="relative mb-1">
        <span className="absolute inset-0 rounded-full bg-primary/10 blur-xl scale-150 opacity-60" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-7 w-7 text-primary/40" />
        </div>
      </div>

      {/* Text */}
      <p className="text-sm font-semibold text-foreground/80">{title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed max-w-[22rem]">
        {description}
      </p>

      {/* Optional CTA */}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
