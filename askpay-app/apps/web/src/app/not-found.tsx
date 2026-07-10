import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Page Not Found | AskPay",
}

/**
 * not-found.tsx — Next.js App Router convention file.
 *
 * Rendered automatically whenever notFound() is called, or when
 * a route segment cannot be matched. Static content only.
 */
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[70vh] px-4 text-center gap-6">

      {/* Illustration */}
      <div className="relative flex items-center justify-center">
        <span className="absolute h-28 w-28 rounded-full bg-primary/5" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
          <SearchX className="h-9 w-9 text-muted-foreground/50" />
        </div>
        {/* Floating badge */}
        <span className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
          404
        </span>
      </div>

      {/* Copy */}
      <div className="max-w-sm space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This page doesn&apos;t exist or may have been moved. Double-check the
          URL, or head back to the chat.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg" className="rounded-xl gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to AskPay
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl">
          <Link href="/how-it-works">How It Works</Link>
        </Button>
      </div>

    </div>
  )
}
