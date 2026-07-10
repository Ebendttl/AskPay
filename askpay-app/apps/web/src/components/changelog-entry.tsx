import type { LucideIcon } from "lucide-react"

export interface ChangelogEntryProps {
  date: string
  title: string
  version?: string
  description: React.ReactNode
  icon?: LucideIcon
}

/**
 * ChangelogEntry
 *
 * Renders a single milestone on a visual vertical timeline.
 * Purely presentational — no hooks, no wagmi/viem imports.
 */
export function ChangelogEntry({
  date,
  title,
  version,
  description,
  icon: Icon,
}: ChangelogEntryProps) {
  return (
    <div className="relative pl-8 sm:pl-10 pb-10 last:pb-0 group">
      {/* Vertical connector line */}
      <div className="absolute left-[15px] sm:left-[19px] top-2 bottom-0 w-0.5 bg-border/60 group-last:hidden" />

      {/* Timeline bullet/icon */}
      <div className="absolute left-1 sm:left-2 top-1.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors shadow-sm z-10">
        {Icon ? <Icon className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors" />}
      </div>

      {/* Content card */}
      <div className="p-5 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-3">
          <h3 className="font-bold text-base text-foreground leading-snug">{title}</h3>
          <div className="flex items-center gap-2">
            {version && (
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                {version}
              </span>
            )}
            <time className="text-xs text-muted-foreground font-medium">{date}</time>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-2">
          {description}
        </div>
      </div>
    </div>
  )
}
