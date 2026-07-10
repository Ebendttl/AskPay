import Link from "next/link"
import { Github } from "lucide-react"

const footerLinks = [
  { name: "How It Works", href: "/how-it-works" },
  { name: "About", href: "/about" },
  { name: "Legal", href: "/legal" },
  { name: "Contact", href: "/contact" },
  { name: "Changelog", href: "/changelog" },
]

/**
 * SiteFooter
 *
 * Global site footer — included in the root layout.
 * Static content only: no wallet hooks, no contract reads.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-5 max-w-screen-2xl">

        {/* Left — branding + nav links */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground/80 mr-1">AskPay</span>
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right — GitHub + copyright */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a
            href="https://github.com/Ebendttl/AskPay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
            aria-label="AskPay on GitHub"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <span className="hidden sm:inline text-border">|</span>
          <span>© {new Date().getFullYear()} AskPay</span>
        </div>

      </div>
    </footer>
  )
}
