"use client"

import Link from "next/link"
import { Sparkles, Coins, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/useLanguage"

export interface HeroSectionProps {
  connectButton: React.ReactNode
}

export function HeroSection({ connectButton }: HeroSectionProps) {
  const { t } = useLanguage()

  const steps = [
    {
      icon: Sparkles,
      label: t("hero_step_1_title"),
      detail: t("hero_step_1_detail"),
      color: "bg-violet-100 text-violet-600 dark:bg-violet-950/45 dark:text-violet-400",
    },
    {
      icon: Coins,
      label: t("hero_step_2_title"),
      detail: t("hero_step_2_detail"),
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/45 dark:text-emerald-400",
    },
    {
      icon: Zap,
      label: t("hero_step_3_title"),
      detail: t("hero_step_3_detail"),
      color: "bg-amber-100 text-amber-600 dark:bg-amber-950/45 dark:text-amber-400",
    },
  ]

  const trustItems = [
    t("hero_trust_1"),
    t("hero_trust_2"),
    t("hero_trust_3"),
    t("hero_trust_4"),
  ]

  return (
    <div className="flex flex-col items-center gap-16 w-full max-w-4xl mx-auto px-4 py-10">

      {/* ── Headline & pitch ─────────────────────────────────────────── */}
      <section className="text-center max-w-2xl">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
          <Zap className="h-3.5 w-3.5" />
          {t("hero_badge")}
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-5">
          {t("hero_title_1")}{" "}
          <span className="text-primary">{t("hero_title_2")}</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
          {t("hero_description")}
        </p>

        {/* Connect CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {connectButton}
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link href="/how-it-works">
              {t("nav_how_it_works")}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── 3-step visual ────────────────────────────────────────────── */}
      <section className="w-full" aria-label={t("nav_how_it_works")}>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-6">
          {t("nav_how_it_works")}
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
                  {t("hero_step_label")} {idx + 1}
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
        {trustItems.map((item) => (
          <span key={item} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
            {item}
          </span>
        ))}
      </section>

    </div>
  )
}
