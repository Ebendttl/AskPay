import type { Metadata } from "next"
import Link from "next/link"
import {
  History,
  Code2,
  Rocket,
  Wrench,
  Package,
  Layers,
  Sparkles,
} from "lucide-react"
import { ChangelogEntry } from "@/components/changelog-entry"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Changelog | AskPay",
  description:
    "AskPay's development log and milestones — tracking progress from the initial scaffold to mainnet-ready pay-gates on Celo.",
}

export default function Changelog() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-24">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-16 pb-12 max-w-2xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <History className="h-3.5 w-3.5" />
          Changelog
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-4">
          Development Log
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Tracking the progress of AskPay as we build a pay-per-use AI assistant
          optimized for Celo and MiniPay.
        </p>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-1">
          
          <ChangelogEntry
            date="July 10, 2026"
            title="UX & Support Overhaul"
            version="v0.4.0"
            icon={Sparkles}
            description={
              <ul className="list-disc list-inside space-y-1.5 pl-1">
                <li>
                  Added custom <strong className="text-foreground">Loading skeleton / spinner</strong> for smoother route transitions.
                </li>
                <li>
                  Implemented custom <strong className="text-foreground">404 Page Not Found</strong> route.
                </li>
                <li>
                  Created reusable <strong className="text-foreground">EmptyState component</strong> for initial chat load.
                </li>
                <li>
                  Built <strong className="text-foreground">Contact & Support form</strong> with pre-filled GitHub Issue redirection.
                </li>
                <li>
                  Added <strong className="text-foreground">About and Legal pages</strong> detailing the story, stack, Terms of Use, and Privacy Notice.
                </li>
              </ul>
            }
          />

          <ChangelogEntry
            date="July 07, 2026"
            title="Extracted use-minipay-paygate NPM Package"
            version="v0.3.0"
            icon={Package}
            description={
              <div className="space-y-2">
                <p>
                  Extracted the core on-chain transaction validation logic into a standalone, lightweight npm library:{" "}
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">use-minipay-paygate</code>.
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>Compatible with any standard Celo/MiniPay application using <strong className="text-foreground">viem</strong>.</li>
                  <li>Supports both standard ERC-20 token transfers and custom smart contract events.</li>
                  <li>Fully typed and documented with setup examples.</li>
                </ul>
              </div>
            }
          />

          <ChangelogEntry
            date="July 04, 2026"
            title="Testnet Deployments & Hardhat Setup"
            version="v0.2.0"
            icon={Rocket}
            description={
              <div className="space-y-2">
                <p>
                  Set up the Solidity contracts environment and successfully completed testnet deployment to Celo Sepolia:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>
                    Deployed <strong className="text-foreground">PayPerQuery.sol</strong> (payment contract) and <strong className="text-foreground">MockERC20.sol</strong> (USDm testnet token).
                  </li>
                  <li>
                    Verified contract code on <strong className="text-foreground">Celoscan</strong> for transparent transaction tracing.
                  </li>
                  <li>
                    Configured parameterised Hardhat Ignition deployment modules for testnet and mainnet.
                  </li>
                </ul>
              </div>
            }
          />

          <ChangelogEntry
            date="July 03, 2026"
            title="Web Interface & Wallet Integration"
            version="v0.1.5"
            icon={Wrench}
            description={
              <div className="space-y-2">
                <p>
                  Built the primary web application interface and connected wallet providers:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>
                    Integrated <strong className="text-foreground">wagmi v2</strong> and <strong className="text-foreground">RainbowKit</strong> for secure web3 provider connections.
                  </li>
                  <li>
                    Developed the custom <strong className="text-foreground">useMiniPay</strong> hook to auto-detect MiniPay context and handle wallet onboarding.
                  </li>
                  <li>
                    Created the chat message bubble list and transaction progress status indicator.
                  </li>
                </ul>
              </div>
            }
          />

          <ChangelogEntry
            date="July 01, 2026"
            title="Monorepo Architecture & Smart Contract Draft"
            version="v0.1.0"
            icon={Layers}
            description={
              <div className="space-y-2">
                <p>
                  Established the monorepo workspace foundation and drafted core contracts:
                </p>
                <ul className="list-disc list-inside space-y-1.5 pl-1">
                  <li>
                    Set up <strong className="text-foreground">Turborepo</strong> structure using <strong className="text-foreground">pnpm workspaces</strong>.
                  </li>
                  <li>
                    Drafted <strong className="text-foreground">PayPerQuery.sol</strong> contract enforcing pre-paid LLM queries.
                  </li>
                  <li>
                    Implemented security constraints: OZ Ownable v5, non-custodial design, and zero DeFi/yield dependencies.
                  </li>
                </ul>
              </div>
            }
          />

        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-16 max-w-xl text-center">
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/">Try AskPay Now</Link>
        </Button>
      </section>

    </div>
  )
}
