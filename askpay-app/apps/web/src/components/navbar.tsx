"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, ExternalLink, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ConnectButton } from "@/components/connect-button"
import { useLanguage } from "@/hooks/useLanguage"
import { ThemeToggle } from "@/components/theme-toggle"

const navLinks = [
  { nameKey: "nav_home", href: "/" },
  { nameKey: "nav_how_it_works", href: "/how-it-works" },
  { nameKey: "nav_about", href: "/about" },
  { nameKey: "nav_dashboard", href: "/dashboard" },
  { nameKey: "nav_referrals", href: "/referrals" },
  { nameKey: "nav_stats", href: "/stats" },
  { nameKey: "nav_my_questions", href: "/my-questions" },
  { nameKey: "nav_docs", href: "https://docs.celo.org", external: true },
]

export function Navbar() {
  const pathname = usePathname()
  const { locale, setLocale, t } = useLanguage()
  
  const LanguageToggle = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === "en" ? "sw" : "en")}
      className="h-9 px-3 gap-1.5 hover:bg-muted"
      title={locale === "en" ? "Badilisha hadi Kiswahili" : "Switch to English"}
      aria-label={locale === "en" ? "Badilisha lugha kuwa Kiswahili" : "Switch language to English"}
    >
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs font-semibold uppercase">{locale}</span>
    </Button>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex items-center gap-2 mb-8">
                <span className="font-bold text-lg">
                  {t("app_title")}
                </span>
              </div>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className={`flex items-center gap-2 text-base font-medium transition-colors hover:text-primary ${
                      pathname === link.href ? "text-foreground" : "text-foreground/70"
                    }`}
                  >
                    {t(link.nameKey)}
                    {link.external && <ExternalLink className="h-4 w-4" />}
                  </Link>
                ))}
                <div className="mt-6 pt-6 border-t flex flex-col gap-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-muted-foreground font-medium">Lugha / Language</span>
                    <LanguageToggle />
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs text-muted-foreground font-medium">Mada / Theme</span>
                    <ThemeToggle />
                  </div>
                  <Button asChild className="w-full">
                    <ConnectButton />
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="hidden font-bold text-xl sm:inline-block">
              {t("app_title")}
            </span>
          </Link>
        </div>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href
                  ? "text-foreground"
                  : "text-foreground/70"
              }`}
            >
              {t(link.nameKey)}
              {link.external && <ExternalLink className="h-4 w-4" />}
            </Link>
          ))}
          
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  )
}

