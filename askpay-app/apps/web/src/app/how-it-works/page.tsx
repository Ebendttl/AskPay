"use client"

import Link from "next/link"
import { Sparkles, CheckSquare, Coins, Zap, Smartphone, Landmark, ArrowRight, HelpCircle } from "lucide-react"
import { FAQAccordion, FAQItem } from "@/components/faq-accordion"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/useLanguage"

export default function HowItWorks() {
  const { t } = useLanguage();

  const faqItems: FAQItem[] = [
    {
      question: t("how_faq_1_q"),
      answer: <span>{t("how_faq_1_a")}</span>,
    },
    {
      question: t("how_faq_2_q"),
      answer: <span>{t("how_faq_2_a")}</span>,
    },
    {
      question: t("how_faq_3_q"),
      answer: <span>{t("how_faq_3_a")}</span>,
    },
    {
      question: t("how_faq_4_q"),
      answer: <span>{t("how_faq_4_a")}</span>,
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Zap className="h-3.5 w-3.5" />
          {t("hero_badge")}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-6">
          {t("how_title")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {t("how_subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/">{t("how_cta_btn")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <a href="#faq">{t("pricing_faq_cta")}</a>
          </Button>
        </div>
      </section>

      {/* Step-by-Step Flow */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("how_flow_title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("how_flow_subtitle")}
          </p>
        </div>

        {/* 4-Step Diagram Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {/* Card 1 */}
          <div className="relative flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-200">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10">01</div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">{t("how_flow_step_1_title")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
              {t("how_flow_step_1_desc")}
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-200">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10">02</div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">{t("how_flow_step_2_title")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
              {t("how_flow_step_2_desc")}
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-200">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10">03</div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Coins className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">{t("how_flow_step_3_title")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
              {t("how_flow_step_3_desc")}
            </p>
          </div>

          {/* Card 4 */}
          <div className="relative flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-200">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10">04</div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">{t("how_flow_step_4_title")}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
              {t("how_flow_step_4_desc")}
            </p>
          </div>

        </div>
      </section>

      {/* MiniPay & Celo Explanations */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* What is MiniPay */}
          <div className="p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold">{t("how_minipay_title")}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t("how_minipay_desc_1")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("how_minipay_desc_2")}
            </p>
          </div>

          {/* Why Celo */}
          <div className="p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold">{t("how_celo_title")}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {t("how_celo_desc_1")}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("how_celo_desc_2")}
            </p>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="container mx-auto px-4 py-12 max-w-4xl scroll-mt-16">
        <div className="text-center mb-10">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("how_faq_title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t("how_faq_subtitle")}
          </p>
        </div>
        <FAQAccordion items={faqItems} />
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-8 text-center max-w-xl">
        <div className="p-8 rounded-3xl border border-border bg-card shadow-sm">
          <h3 className="text-xl font-bold mb-3">{t("how_cta_title")}</h3>
          <p className="text-xs text-muted-foreground mb-6">
            {t("how_cta_desc")}
          </p>
          <Button asChild size="lg" className="rounded-xl px-8">
            <Link href="/">{t("how_cta_btn")}</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
