import { ExternalLink } from "lucide-react"

export interface BuilderCardProps {
  name: string
  role: string
  /** Optional URL (GitHub profile, personal site, etc.) */
  href?: string
  /** Optional short bio or extra detail */
  bio?: string
}

/**
 * BuilderCard
 *
 * A small, reusable card for displaying a project contributor.
 * Purely presentational — no hooks, no wallet state.
 */
export function BuilderCard({ name, role, href, bio }: BuilderCardProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const inner = (
    <div
      className={`group flex items-start gap-4 p-5 rounded-2xl border border-border bg-card transition-all duration-200 ${
        href ? "hover:border-primary/40 hover:shadow-sm cursor-pointer" : ""
      }`}
    >
      {/* Avatar */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm select-none">
        {initials}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-sm text-foreground truncate">{name}</span>
          {href && (
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
        <p className="text-xs text-primary font-medium mt-0.5">{role}</p>
        {bio && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{bio}</p>}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    )
  }

  return inner
}
