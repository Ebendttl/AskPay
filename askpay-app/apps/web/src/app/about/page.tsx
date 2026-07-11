"use client"

import Link from "next/link"
import {
  Github,
  Package,
  Globe,
  Zap,
  Ship,
  Code2,
  ArrowUpRight,
} from "lucide-react"
import { BuilderCard } from "@/components/builder-card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/useLanguage"

// ── Stack items pulled from what's actually used in the codebase ──────────────

const stack = [
  {
    name: "Next.js 14",
    detail: "App Router, server components, API routes (the /api/ask endpoint).",
    color: "bg-slate-100 text-slate-800",
  },
  {
    name: "Solidity 0.8.28",
    detail:
      "PayPerQuery.sol — ERC-20 pull-payment contract using OpenZeppelin Ownable v5.",
    color: "bg-violet-100 text-violet-800",
  },
  {
    name: "Hardhat + Ignition",
    detail:
      "Contract compilation, testing, and parameterised deployment to Celo Sepolia / mainnet.",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    name: "viem v2",
    detail:
      "All on-chain reads (fee, allowance, balanceOf) and transaction receipt parsing in the verification layer.",
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "wagmi v2",
    detail:
      "React hooks for wallet connection, contract reads, and write transactions inside the chat UI.",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    name: "Celo (mainnet + Sepolia)",
    detail:
      "Target chain — chosen for sub-$0.001 gas, ~5 s finality, and native ERC-20 gas fee tokens.",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "MiniPay / Opera Mini",
    detail:
      "Primary deployment target. Auto-detects the MiniPay provider and skips the standard connect button.",
    color: "bg-orange-100 text-orange-800",
  },
  {
    name: "use-minipay-paygate",
    detail:
      "Internal npm package (also published separately) — server-side on-chain payment verification built on viem.",
    color: "bg-teal-100 text-teal-800",
  },
  {
    name: "Turborepo + pnpm",
    detail:
      "Monorepo tooling tying together the web app, contracts workspace, and shared packages.",
    color: "bg-rose-100 text-rose-800",
  },
]

// ── External links ────────────────────────────────────────────────────────────

const links = [
  {
    label: "GitHub — Ebendttl/AskPay",
    href: "https://github.com/Ebendttl/AskPay",
    icon: Github,
    sub: "Source code, contract deployment scripts, and docs",
  },
  {
    label: "npm — use-minipay-paygate",
    href: "https://www.npmjs.com/package/use-minipay-paygate",
    icon: Package,
    sub: "The open-source payment verification library extracted from this project",
  },
  {
    label: "Celo.org",
    href: "https://celo.org",
    icon: Globe,
    sub: "The blockchain powering AskPay's micro-payments",
  },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-16 pb-12 max-w-3xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Ship className="h-3.5 w-3.5" />
          Celo · Proof of Ship
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-5">
          {t("about_title")}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t("about_subtitle")}
        </p>
      </section>

      {/* ── Problem & audience ───────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="p-8 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">{t("about_problem_title")}</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>{t("about_problem_desc_1")}</p>
            <p>{t("about_problem_desc_2")}</p>
            <p>{t("about_problem_desc_3")}</p>
          </div>
        </div>
      </section>

      {/* ── Proof of Ship context ─────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="p-8 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Ship className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">{t("about_pos_title")}</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>{t("about_pos_desc_1")}</p>
            <p>{t("about_pos_desc_2")}</p>
          </div>
        </div>
      </section>

      {/* ── Why we built this ────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="p-8 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Code2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">{t("about_why_title")}</h2>
          </div>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>{t("about_why_desc_1")}</p>
            <p>{t("about_why_desc_2")}</p>
          </div>
        </div>
      </section>

      {/* ── Builder ──────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <h2 className="text-xl font-bold mb-5">{t("about_builder_title")}</h2>
        <BuilderCard
          name="Ebendttl"
          role="Solo Developer"
          href="https://github.com/Ebendttl"
          bio={t("about_builder_bio")}
        />
      </section>

      {/* ── Links ────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <h2 className="text-xl font-bold mb-5">{t("about_links_title")}</h2>
        <div className="space-y-3">
          {links.map(({ label, href, icon: Icon, sub }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card/50 hover:border-primary/40 hover:bg-card transition-all duration-200"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          ))}
        </div>
      </section>

      {/* ── Built With ───────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-10 max-w-3xl">
        <h2 className="text-xl font-bold mb-2">{t("about_built_with_title")}</h2>
        <p className="text-xs text-muted-foreground mb-6">
          {t("about_built_with_sub")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stack.map(({ name, detail, color }) => (
            <div
              key={name}
              className="flex flex-col gap-1.5 p-4 rounded-xl border border-border bg-card/50"
            >
              <span className={`self-start text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color}`}>
                {name}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-4 pb-8 text-center max-w-xl">
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/">{t("about_cta_try")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <Link href="/how-it-works">{t("nav_how_it_works")}</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
