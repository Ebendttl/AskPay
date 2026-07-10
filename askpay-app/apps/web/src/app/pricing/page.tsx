import type { Metadata } from "next"
import Link from "next/link"
import { Coins, HelpCircle, AlertCircle } from "lucide-react"
import { PricingTable } from "@/components/pricing-table"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Pricing | AskPay",
  description:
    "AskPay's pricing model — pay-per-query AI chats utilizing Celo stablecoins with zero recurring subscriptions.",
}

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-24">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-16 pb-12 max-w-2xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Coins className="h-3.5 w-3.5" />
          Pricing
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-4">
          Pay Only For What You Use
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          No subscriptions, no hidden setup fees, and no recurring bills.
          You pay a small, fixed fee per question directly on-chain.
        </p>
      </section>

      <div className="container mx-auto px-4 max-w-2xl space-y-10">

        {/* ── The 0.01 USDm Detail Card ────────────────────────────────────── */}
        <section className="p-8 rounded-2xl border border-border bg-card/50 text-center relative overflow-hidden">
          <span className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl scale-125 opacity-30 pointer-events-none" />
          
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Per-Query Cost</h2>
          <div className="text-5xl font-extrabold text-foreground tracking-tight mb-2">
            0.01 <span className="text-2xl font-semibold text-muted-foreground">USDm</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Every question you ask costs exactly 0.01 USDm (pegged to 1 US Cent) sent to our pay-gate contract.
            Celo network gas fees are extra but typically average less than $0.001 per transaction.
          </p>
        </section>

        {/* ── Model adjustment disclosure ───────────────────────────────────── */}
        <section className="flex items-start gap-3 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-900">Fee Adjustment Policy</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              The query fee is configurable in the deployed smart contract. The owner may adjust
              this value up or down to align with downstream AI LLM API provider costs.
              The interface will always display the current live fee fetched directly from the blockchain
              before you confirm any payment.
            </p>
          </div>
        </section>

        {/* ── Comparison Section ───────────────────────────────────────────── */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-foreground px-1">How it compares</h2>
          <PricingTable />
        </section>

        {/* ── FAQ Quick link ─────────────────────────────────────────────── */}
        <section className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">
              Have questions about transaction safety?
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Read our full &quot;How It Works&quot; page to understand how smart contract payments are verified
              and how browser-local caching secures your queries.
            </p>
            <Button asChild variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs">
              <Link href="/how-it-works">
                <HelpCircle className="h-3.5 w-3.5" />
                Read the FAQ
              </Link>
            </Button>
          </div>
        </section>

      </div>

      {/* ── Back link ────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pt-10 max-w-2xl text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
        >
          ← Back to AskPay
        </Link>
      </div>

    </div>
  )
}
