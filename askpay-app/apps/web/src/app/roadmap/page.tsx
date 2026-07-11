"use client"

import Link from "next/link"
import {
  Map,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Compass,
} from "lucide-react"
import { ChangelogEntry } from "@/components/changelog-entry"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/useLanguage"

export default function Roadmap() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-24">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-16 pb-12 max-w-2xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Map className="h-3.5 w-3.5" />
          {t("nav_roadmap")}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-4">
          {t("roadmap_title")}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {t("roadmap_subtitle")}
        </p>
      </section>

      {/* ── Roadmap Items ────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-1">

          {/* Planned */}
          <ChangelogEntry
            date="Aspirational"
            title="ODIS Identity Integration"
            version="Planned"
            icon={Lightbulb}
            description={
              <div className="space-y-2">
                <p>
                  Explore integration with Celo&apos;s <strong className="text-foreground">ODIS (On-Chain Decentralised Identity Service)</strong>
                  to enable phone-number-based interactions:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>Send/share query answers directly to friends via their phone number.</li>
                  <li>Enable querying via sms or alternative light clients utilizing verified phone hashes.</li>
                </ul>
              </div>
            }
          />

          <ChangelogEntry
            date="Aspirational"
            title="Multi-LLM Provider Selection"
            version="Planned"
            icon={Compass}
            description={
              <div className="space-y-2">
                <p>
                  Allow users to select which LLM model processes their query at runtime:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>Choose between lighter fast models (e.g. Gemini Flash) for a lower fee.</li>
                  <li>Access premium frontier models (e.g. GPT-4, Gemini Pro) with higher fee scales set contract-side.</li>
                </ul>
              </div>
            }
          />

          <ChangelogEntry
            date="Aspirational"
            title="Usage Analytics Dashboard"
            version="Planned"
            icon={Lightbulb}
            description={
              <div className="space-y-2">
                <p>
                  Build a lightweight, non-custodial analytics page:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>Display aggregate fee revenues accumulated in the paygate contract.</li>
                  <li>Trace total queries handled over time, average confirmation speeds, and success rates.</li>
                </ul>
              </div>
            }
          />

          {/* In Progress */}
          <ChangelogEntry
            date="Q3 2026"
            title="Celo Mainnet Deployment"
            version="In Progress"
            icon={TrendingUp}
            description={
              <div className="space-y-2">
                <p>
                  Transitioning the application logic to support mainnet Celo transactions:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>Deploying the final audited version of <strong className="text-foreground">PayPerQuery.sol</strong> to Celo Mainnet.</li>
                  <li>Wiring production USDm stablecoin address and live Celo mainnet public client routing on the server.</li>
                </ul>
              </div>
            }
          />

          {/* Shipped */}
          <ChangelogEntry
            date="Completed"
            title="Core Platform Launch"
            version="Shipped"
            icon={CheckCircle2}
            description={
              <div className="space-y-2">
                <p>
                  Successfully built and deployed the initial framework:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>Drafted and verified <strong className="text-foreground">PayPerQuery.sol</strong> on Celo Sepolia.</li>
                  <li>Built responsive chat UI with RainbowKit &amp; <strong className="text-foreground">MiniPay detection</strong>.</li>
                  <li>Extracted and published the <strong className="text-foreground">use-minipay-paygate</strong> npm helper library.</li>
                  <li>Integrated Next.js server-side LLM call handler with automatic transaction receipt checks.</li>
                </ul>
              </div>
            }
          />

        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-16 max-w-xl text-center">
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/">{t("about_cta_try")}</Link>
        </Button>
      </section>

    </div>
  )
}
