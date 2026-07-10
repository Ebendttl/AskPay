import type { Metadata } from "next"
import Link from "next/link"
import { Github, MessageSquare, HelpCircle, ExternalLink, Mail } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Contact & Support | AskPay",
  description:
    "Get help with AskPay — report an issue on GitHub or send a message directly.",
}

// ── Support channels ──────────────────────────────────────────────────────────

const channels = [
  {
    icon: Github,
    title: "GitHub Issues",
    description:
      "The fastest way to get help. Open an issue and we\u2019ll respond there. Bug reports, feature requests, and general questions are all welcome.",
    href: "https://github.com/Ebendttl/AskPay/issues/new",
    cta: "Open an issue",
    recommended: true,
  },
  {
    icon: Mail,
    title: "Email",
    description:
      "Prefer email? Reach out directly. Response times may be slower than GitHub for this early-stage project.",
    href: "mailto:ebendttl@gmail.com",
    cta: "Send email",
    recommended: false,
  },
]

// ─────────────────────────────────────────────────────────────────────────────

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-24">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-16 pb-10 max-w-2xl text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <MessageSquare className="h-3.5 w-3.5" />
          Support
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-4">
          Contact &amp; Support
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Got a question or hit a bug? Here&apos;s how to reach us. AskPay is an
          early-stage solo project, so response times may vary — but we do read everything.
        </p>
      </section>

      <div className="container mx-auto px-4 max-w-2xl space-y-8">

        {/* ── Try the docs first ───────────────────────────────────────── */}
        <div className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/50">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">
              Check the How It Works page first
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Common questions about the payment flow, MiniPay, USDm, and on-chain
              transactions are answered there — it&apos;s quicker than waiting for a reply.
            </p>
            <Button asChild variant="outline" size="sm" className="rounded-lg gap-1.5 text-xs">
              <Link href="/how-it-works">
                <HelpCircle className="h-3.5 w-3.5" />
                How It Works &amp; FAQ
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Support channels ─────────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-foreground px-1">Support channels</h2>
          {channels.map(({ icon: Icon, title, description, href, cta, recommended }) => (
            <div
              key={href}
              className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card/50 hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  {recommended && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {description}
                </p>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-2"
                >
                  {cta}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* ── Contact form ─────────────────────────────────────────────── */}
        <div className="p-8 rounded-2xl border border-border bg-card/50 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">
              Send a message
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prefer a form? Fill this in and it will open a pre-filled GitHub Issue
              in a new tab so your message reaches us reliably.
            </p>
          </div>
          <ContactForm />
        </div>

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
