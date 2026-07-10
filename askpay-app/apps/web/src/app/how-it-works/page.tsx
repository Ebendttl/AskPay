import type { Metadata } from "next"
import Link from "next/link"
import { Sparkles, CheckSquare, Coins, Zap, Smartphone, Landmark, ArrowRight, HelpCircle } from "lucide-react"
import { FAQAccordion, FAQItem } from "@/components/faq-accordion"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "How It Works | AskPay",
  description: "Learn how AskPay enables pay-per-use AI chat on the Celo blockchain using MiniPay.",
}

const faqItems: FAQItem[] = [
  {
    question: "Is my money safe?",
    answer: (
      <span>
        Absolutely. AskPay is fully non-custodial and operates on audited open-source smart contracts. 
        Your stablecoins remain in your own wallet (such as MiniPay or Valora) and are only transferred 
        when you explicitly approve and confirm a transaction for a specific query. We never have access 
        to your private keys or any funds beyond what you authorize.
      </span>
    ),
  },
  {
    question: "What happens if I don't get an answer?",
    answer: (
      <span>
        The payment transaction is bound to a specific query ID on-chain. If the AI service fails to 
        respond due to a network outage or API error, the query status remains unpaid or failed. 
        Because transactions are recorded on the Celo blockchain, you will never pay for a query that 
        the AI does not answer.
      </span>
    ),
  },
  {
    question: "What is USDm?",
    answer: (
      <span>
        USDm is a stablecoin pegged to the value of the US Dollar (1 USDm = $1.00 USD) available on the 
        Celo blockchain. It allows for predictable, stable pricing for micro-transactions so you can 
        pay exact fractions of a dollar per query without worrying about the volatility of traditional cryptocurrencies.
      </span>
    ),
  },
  {
    question: "Can I use this outside MiniPay?",
    answer: (
      <span>
        Yes! While AskPay is designed to be highly optimized and seamlessly fast inside the Opera Mini 
        browser using MiniPay, it is a fully standard Web3 decentralized application. You can connect 
        any Celo-compatible wallet (such as Valora, MetaMask, Rainbow, or Ledger) on desktop or mobile 
        and interact with AskPay normally.
      </span>
    ),
  },
]

export default function HowItWorks() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
          <Zap className="h-3.5 w-3.5" />
          Pay-Per-Use AI Chat
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-6">
          How <span className="text-primary">AskPay</span> Works
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          AskPay offers direct access to state-of-the-art AI without recurring monthly subscriptions. 
          Pay only for the answers you get, powered by lightning-fast stablecoin payments on Celo.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/">Try AskPay Chat</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-xl">
            <a href="#faq">Read the FAQ</a>
          </Button>
        </div>
      </section>

      {/* Step-by-Step Flow */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            The Payment & Query Flow
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            A simple, secure, step-by-step process that keeps you in control.
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
            <h3 className="font-semibold text-base mb-2">1. Ask a Question</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
              Type your question into the chat. The app fetches the current query fee directly from our smart contract.
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-200">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10">02</div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">2. Approve USDm</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
              If your allowance is low, authorize the smart contract to spend the exact fee amount. Your wallet prompts for permission.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-200">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10">03</div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Coins className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">3. Confirm Payment</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
              Sign the fast micro-payment transaction on Celo. The exact USDm query fee is transferred securely to the smart contract.
            </p>
          </div>

          {/* Card 4 */}
          <div className="relative flex flex-col p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-200">
            <div className="absolute top-4 right-4 text-3xl font-extrabold text-primary/10">04</div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">4. Receive Answer</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
              Once the transaction is confirmed on-chain, the AskPay API instantly verifies payment and generates your AI response.
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
              <h3 className="text-xl font-bold">What is MiniPay?</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              MiniPay is a mobile-first Web3 wallet built directly into the Opera Mini browser. 
              Designed specifically for emerging markets, it lets millions of users access 
              decentralized applications with zero complexity, sub-second wallet setup, and 
              intuitive phone-number based identity.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AskPay integrates deeply within MiniPay to deliver a native app-like checkout, 
              bypassing standard browser wallet connection friction.
            </p>
          </div>

          {/* Why Celo */}
          <div className="p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Landmark className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold">Why Celo?</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Celo is a carbon-negative blockchain designed for real-world mobile payments. 
              It provides extremely low transaction fees (typically costing less than $0.001) 
              and lightning-fast execution, completing transactions in under 5 seconds.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Importantly, Celo allows paying gas fees directly in ERC20 stablecoins. 
              This means you don&apos;t need to hold volatile native blockchain gas tokens 
              (like ETH or CELO) to ask questions on AskPay.
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
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Clear, honest answers about AskPay operations and assets.
          </p>
        </div>
        <FAQAccordion items={faqItems} />
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-8 text-center max-w-xl">
        <div className="p-8 rounded-3xl border border-border bg-card shadow-sm">
          <h3 className="text-xl font-bold mb-3">Ready to ask a question?</h3>
          <p className="text-xs text-muted-foreground mb-6">
            Get instant answers from top tier AI models. Pay as you go, settled instantly on Celo.
          </p>
          <Button asChild size="lg" className="rounded-xl px-8">
            <Link href="/">Start Chatting</Link>
          </Button>
        </div>
      </section>

    </div>
  )
}
