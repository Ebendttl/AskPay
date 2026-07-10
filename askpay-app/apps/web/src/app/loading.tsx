import { Loader2 } from "lucide-react"

/**
 * loading.tsx — Next.js App Router convention file.
 *
 * Rendered automatically during any route segment transition.
 * Uses only existing Tailwind design tokens. No hooks, no wallet state.
 */
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-6 px-4">

      {/* Animated logo mark */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/20 animate-ping" />
        {/* Inner circle */}
        <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </span>
      </div>

      {/* Skeleton content blocks — mimic a generic page layout */}
      <div className="w-full max-w-sm space-y-3 mt-2">
        <div className="h-3 rounded-full bg-muted animate-pulse w-3/4 mx-auto" />
        <div className="h-3 rounded-full bg-muted animate-pulse w-1/2 mx-auto" />
      </div>

      <p className="text-xs text-muted-foreground tracking-wide">Loading…</p>
    </div>
  )
}
