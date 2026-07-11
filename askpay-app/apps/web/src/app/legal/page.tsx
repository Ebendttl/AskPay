"use client"

import Link from "next/link"
import { Scale, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react"
import { useLanguage } from "@/hooks/useLanguage"

/** ISO date of the last meaningful edit to this page */
const LAST_UPDATED = "2026-07-10"

// ── Reusable section wrapper ──────────────────────────────────────────────────

function LegalSection({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ElementType
  title: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <section className="p-8 rounded-2xl border border-border bg-card/50">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-border/60">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {badge && (
            <span className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-5 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  )
}

// ── Clause helpers ────────────────────────────────────────────────────────────

function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Legal() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-24">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-16 pb-10 max-w-3xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-semibold mb-6">
          <AlertTriangle className="h-3.5 w-3.5" />
          Early-Stage / Testnet Project
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-4">
          {t("legal_title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          Last updated:{" "}
          <time dateTime={LAST_UPDATED}>
            {new Date(LAST_UPDATED).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        </p>
      </section>

      {/* ── Two sections ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-3xl space-y-8">

        {/* ── Terms of Use ─────────────────────────────────────────────── */}
        <LegalSection
          icon={Scale}
          title="Terms of Use"
          badge="Early-Stage Software"
        >
          <Clause title="1. Nature of the Service">
            <p>
              AskPay is an early-stage, experimental pay-per-use AI chat application. It is provided
              strictly <strong className="text-foreground">as-is</strong>, with no warranties of any
              kind — express or implied. The application is currently in active development and may
              run against testnet contracts, mainnet contracts, or both, depending on the deployment
              configuration.
            </p>
            <p>
              By using AskPay you acknowledge that you are interacting with pre-production software.
              Bugs, unexpected behaviour, and breaking changes may occur at any time without notice.
            </p>
          </Clause>

          <Clause title="2. Your Wallet and Funds Are Your Responsibility">
            <p>
              AskPay is a non-custodial application. It never holds, controls, or has access to your
              private keys. All transactions are initiated and signed exclusively by your own wallet
              (MiniPay, Valora, MetaMask, or another compatible wallet).
            </p>
            <p>
              You are solely responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Keeping your wallet seed phrase and private keys secure.</li>
              <li>Verifying every transaction before you sign it.</li>
              <li>Ensuring you have sufficient USDm balance before submitting a query.</li>
              <li>Understanding that approving a transaction authorises a token transfer from your wallet.</li>
            </ul>
          </Clause>

          <Clause title="3. No Guarantee of Uptime or Service">
            <p>
              AskPay is provided without any guarantee of continuous availability. The application,
              its backend API, and any third-party AI provider it relies on may be unavailable,
              slow, or return errors at any time.
            </p>
            <p>
              We do not commit to a specific service level agreement (SLA), maintenance window, or
              response-time target for this early-stage deployment.
            </p>
          </Clause>

          <Clause title="4. On-Chain Transactions Are Irreversible">
            <p>
              All payments made through AskPay are recorded on the Celo blockchain. Once a
              transaction is confirmed, it <strong className="text-foreground">cannot be reversed,
              cancelled, or refunded</strong> — this is a property of the underlying blockchain, not
              a policy choice. Please verify the query fee displayed in the UI before signing.
            </p>
            <p>
              If the AI response is unavailable after a confirmed payment (e.g. due to a backend
              outage or API error), the on-chain payment cannot be undone. We will make reasonable
              efforts to surface errors clearly in the UI before a payment is requested.
            </p>
          </Clause>

          <Clause title="5. No Liability">
            <p>
              To the fullest extent permitted by applicable law, the developers of AskPay shall not
              be liable for any direct, indirect, incidental, or consequential damages arising from
              your use of, or inability to use, the application — including but not limited to loss
              of funds, loss of data, or loss of access to your wallet.
            </p>
          </Clause>

          <Clause title="6. Experimental Smart Contracts">
            <p>
              The <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">PayPerQuery.sol</code>{" "}
              contract deployed on Celo has not undergone a formal third-party security audit. It is
              intentionally simple and non-upgradeable, but you interact with it at your own risk.
              The{" "}
              <a
                href="https://github.com/Ebendttl/AskPay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:no-underline inline-flex items-center gap-0.5"
              >
                source code is publicly available
                <ExternalLink className="h-3 w-3" />
              </a>{" "}
              for your review.
            </p>
          </Clause>

          <Clause title="7. Changes to These Terms">
            <p>
              These terms may be updated as the project matures. The &quot;Last updated&quot; date at the
              top of this page reflects the most recent revision. Continued use of AskPay after a
              change constitutes acceptance of the revised terms.
            </p>
          </Clause>
        </LegalSection>

        {/* ── Privacy Notice ───────────────────────────────────────────── */}
        <LegalSection icon={ShieldCheck} title="Privacy Notice">
          <Clause title="1. What Information Is Visible On-Chain">
            <p>
              The Celo blockchain is a public ledger. When you pay for a query, the following
              information is permanently and publicly recorded on-chain:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Your wallet address (the account that signed the transaction).</li>
              <li>The amount of USDm transferred as the query fee.</li>
              <li>The unique query ID associated with that payment.</li>
              <li>The block number and timestamp of the transaction.</li>
            </ul>
            <p>
              This is inherent to how blockchains work and is not something AskPay controls.
              Anyone can inspect this data using a public block explorer such as{" "}
              <a
                href="https://celoscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:no-underline inline-flex items-center gap-0.5"
              >
                celoscan.io
                <ExternalLink className="h-3 w-3" />
              </a>.
            </p>
          </Clause>

          <Clause title="2. What AskPay Does Not Collect">
            <p>
              AskPay does not collect, store, or process:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Your name, email address, or any other personally identifying information.</li>
              <li>IP addresses or device fingerprints (beyond what a standard web server log would record for a single request, which is not retained).</li>
              <li>Browsing history, cookies set for tracking, or any analytics identifiers.</li>
              <li>The content of your questions or the AI answers on a persistent server-side basis.</li>
            </ul>
            <p>
              Query history displayed in the AskPay UI is stored locally in your browser&apos;s{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">localStorage</code>.
              It never leaves your device unless you share it yourself.
            </p>
          </Clause>

          <Clause title="3. Questions Sent to Third-Party AI Providers">
            <p>
              This is the most important disclosure: <strong className="text-foreground">the text
              of your question is forwarded to a third-party AI API</strong> in order to generate a
              response. Depending on server configuration, that provider is either:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong className="text-foreground">Groq</strong> — running{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">llama3-8b-8192</code>.
                Groq&apos;s privacy policy applies:{" "}
                <a
                  href="https://groq.com/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:no-underline inline-flex items-center gap-0.5"
                >
                  groq.com/privacy-policy
                  <ExternalLink className="h-3 w-3" />
                </a>.
              </li>
              <li>
                <strong className="text-foreground">Google Gemini</strong> — running{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">gemini-1.5-flash</code>.
                Google&apos;s API terms apply:{" "}
                <a
                  href="https://ai.google.dev/gemini-api/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-2 hover:no-underline inline-flex items-center gap-0.5"
                >
                  ai.google.dev/gemini-api/terms
                  <ExternalLink className="h-3 w-3" />
                </a>.
              </li>
            </ul>
            <p>
              Do not submit sensitive personal information, confidential data, or anything you
              would not want processed by a third-party AI API. The query text is not logged
              server-side beyond the in-flight API call, but AskPay cannot control how the
              upstream provider handles it.
            </p>
          </Clause>

          <Clause title="4. No Data Sold to Third Parties">
            <p>
              AskPay does not sell, rent, or trade any user data — on-chain or off-chain — to any
              third party. The forwarding of your question text to an AI provider (described in
              §3 above) is strictly for the purpose of generating your answer, not for advertising
              or data brokerage.
            </p>
          </Clause>

          <Clause title="5. Contact">
            <p>
              If you have questions about this notice, open an issue or discussion on the{" "}
              <a
                href="https://github.com/Ebendttl/AskPay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:no-underline inline-flex items-center gap-0.5"
              >
                AskPay GitHub repository
                <ExternalLink className="h-3 w-3" />
              </a>.
            </p>
          </Clause>
        </LegalSection>

      </div>

      {/* ── Back link ────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 pt-10 max-w-3xl text-center">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
        >
          {t("back_to_chat")}
        </Link>
      </div>

    </div>
  )
}
