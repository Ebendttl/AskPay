import { ExternalLink } from "lucide-react"

export interface CreditItemProps {
  name: string
  description: string
  href: string
  version?: string
}

/**
 * CreditItem
 *
 * A clean list item for representing an open-source library or tool.
 * Purely presentational — no hooks, no wagmi/viem imports.
 */
export function CreditItem({ name, description, href, version }: CreditItemProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 p-4 rounded-xl border border-border bg-card/40 hover:border-primary/30 hover:bg-card transition-all duration-200"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
            {name}
          </span>
          {version && (
            <span className="text-[10px] font-mono text-muted-foreground">
              {version}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
    </a>
  )
}
