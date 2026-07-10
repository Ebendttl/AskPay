import Link from "next/link"
import { Sparkles, Coins, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HeroSectionProps {
  /**
   * Passed in from ChatBox which already holds `isMiniPay` and `isConnected`
   * from wagmi/useMiniPay. HeroSection itself imports nothing from wagmi/viem.
   *
   * Render the connect button as a slot so HeroSection stays framework-agnostic.
   */
  connectButton: React.ReactNode
}

// ── Step data ─────────────────────────────────────────────────────────────────

const steps = [
  {
    icon: Sparkles,
    label: "Ask",
    detail: "Type any question into the chat. No account or subscription needed.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: Coins,
    label: "Pay a few cents",
    detail: "Approve a small USDm stablecoin fee — fractions of a cent per query.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Zap,
    label: "Get your answer",
    detail: "Once the payment is confirmed on-chain, your AI answer arrives instantly.",
    color: "bg-amber-100 text-amber-600",
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * HeroSection
 *
 * Marketing landing view shown to first-time / disconnected visitors.
 * Entirely static illustrative content — no hooks, no wagmi/viem imports,
 * no contract reads. Connection state is threaded in as a React slot
 * (connectButton) so this component stays pure.
 */
export function HeroSection({ connectButton }: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center gap-16 w-full max-w-4xl mx-auto px-4 py-10">

      {/* ── Headline & pitch ─────────────────────────────────────────── */}
      <section className="text-center max-w-2xl">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
          <Zap className="h-3.5 w-3.5" />
          Now live on Celo
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-5">
          Pay-as-you-go AI,{" "}
          <span className="text-primary">right inside MiniPay</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
          AskPay lets you get instant AI answers using Celo stablecoins — no monthly
          subscription, no account required. Pay a few cents per question, settled
          on-chain in seconds.
        </p>

        {/* Connect CTA — injected from ChatBox so HeroSection stays wagmi-free */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {connectButton}
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link href="/how-it-works">
              How It Works
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── 3-step visual ────────────────────────────────────────────── */}
      <section className="w-full" aria-label="How AskPay works">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-6">
          How it works
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 relative">
          {steps.map(({ icon: Icon, label, detail, color }, idx) => (
            <div key={label} className="relative flex flex-col items-center text-center gap-3">

              {/* Connector arrow between steps (desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden sm:flex absolute top-6 left-[calc(100%-1rem)] w-8 items-center justify-center z-10">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}

              {/* Step card */}
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all duration-200 w-full">
                {/* Icon */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Step number */}
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Step {idx + 1}
                </span>

                {/* Label */}
                <h3 className="font-bold text-base text-foreground leading-snug">{label}</h3>

                {/* Detail */}
                <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────── */}
      <section className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
        {[
          "Non-custodial — your keys, your funds",
          "Open-source smart contract",
          "Payments settle in ~5 seconds on Celo",
          "No subscription, pay per query",
        ].map((item) => (
          <span key={item} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
            {item}
          </span>
        ))}
      </section>

    </div>
  )
}
