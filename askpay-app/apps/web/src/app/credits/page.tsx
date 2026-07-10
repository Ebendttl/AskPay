import type { Metadata } from "next"
import Link from "next/link"
import { Heart, Scale, ExternalLink } from "lucide-react"
import { CreditItem } from "@/components/credit-item"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Credits | AskPay",
  description:
    "Credits and acknowledgements for the open-source libraries, frameworks, and Celo tools powering AskPay.",
}

// ── Real dependencies pulled directly from package.json files ─────────────────

const dependencies = [
  {
    name: "Next.js",
    version: "^14.0.0",
    description: "The React framework for the web, powering the frontend routes and backend /api/ask handler.",
    href: "https://nextjs.org",
  },
  {
    name: "Tailwind CSS",
    version: "^3.4.4",
    description: "Utility-first CSS framework used to build AskPay's modern, responsive, HSL-themed visual language.",
    href: "https://tailwindcss.com",
  },
  {
    name: "viem",
    version: "^2.0.0",
    description: "An extremely fast, lightweight, type-safe TypeScript interface to Ethereum and Celo JSON-RPC interfaces.",
    href: "https://viem.sh",
  },
  {
    name: "wagmi",
    version: "^2.0.0",
    description: "React Hooks for Ethereum, used for wallet connection state, address retrieval, and transaction execution.",
    href: "https://wagmi.sh",
  },
  {
    name: "RainbowKit",
    version: "^2.0.0",
    description: "A fast, customizable React library making it easy for non-MiniPay users to connect their web3 wallet.",
    href: "https://rainbowkit.com",
  },
  {
    name: "React Query",
    version: "^5.0.0",
    description: "Powerful async state synchronization library driving wagmi's balance and contract read hooks.",
    href: "https://tanstack.com/query",
  },
  {
    name: "OpenZeppelin Contracts",
    version: "^5.0.0",
    description: "Audited modular smart contract standards providing the ERC20 interfaces and Ownable primitives in PayPerQuery.",
    href: "https://openzeppelin.com/contracts",
  },
  {
    name: "Hardhat",
    version: "^2.19.0",
    description: "EVM developer environment driving contract compilation, unit tests, and Ignition deployments.",
    href: "https://hardhat.org",
  },
  {
    name: "Hardhat Ignition",
    version: "^0.15.0",
    description: "Declarative deployment framework matching smart contracts to parameter JSON targets.",
    href: "https://hardhat.org/ignition",
  },
  {
    name: "Lucide React",
    version: "^0.292.0",
    description: "Beautiful, consistent vector icons driving AskPay's interface layouts.",
    href: "https://lucide.dev",
  },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function Credits() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-24">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-16 pb-12 max-w-2xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 text-xs font-semibold mb-6">
          <Heart className="h-3.5 w-3.5 fill-rose-700/20" />
          Acknowledgements
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-4">
          Credits &amp; Open Source
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          AskPay is built entirely on open-source foundations. We thank the community
          whose libraries, toolkits, and infrastructure made this project possible.
        </p>
      </section>

      <div className="container mx-auto px-4 max-w-2xl space-y-10">

        {/* ── Thank You Message ────────────────────────────────────────────── */}
        <section className="p-8 rounded-2xl border border-border bg-card/50">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            Community Appreciation
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              A special thank-you goes to the <strong className="text-foreground">Celo and Mento ecosystems</strong>
              . Their focus on mobile-first design, fast ~5 second transaction finality, and stablecoins (like USDm)
              provides the perfect micro-payment rails for utility dApps like AskPay.
            </p>
            <p>
              We also express gratitude to the organizers and builders of Celo&apos;s <strong className="text-foreground">Proof of Ship</strong>
              program, which challenges developers to turn early ideas into production-ready software.
            </p>
          </div>
        </section>

        {/* ── License Card ────────────────────────────────────────────────── */}
        <section className="p-6 rounded-xl border border-border bg-card/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Open-Source License</p>
              <p className="text-xs text-muted-foreground">AskPay is licensed under the MIT License.</p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs self-start sm:self-auto">
            <a
              href="https://github.com/Ebendttl/AskPay/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
            >
              View License
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </section>

        {/* ── Dependency List ──────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground px-1">Software Stack &amp; Libraries</h2>
            <p className="text-xs text-muted-foreground px-1 mt-0.5">
              Real open-source packages imported and compiled in this workspace.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {dependencies.map(({ name, version, description, href }) => (
              <CreditItem
                key={name}
                name={name}
                version={version}
                description={description}
                href={href}
              />
            ))}
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
