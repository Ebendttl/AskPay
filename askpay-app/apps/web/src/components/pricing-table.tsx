import { Check, X } from "lucide-react"

/**
 * PricingTable
 *
 * A simple, static comparison table comparing AskPay's pay-per-use model
 * with typical recurring AI subscriptions.
 * Purely presentational — no hooks, no wagmi/viem imports.
 */
export function PricingTable() {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-left border-collapse min-w-[500px]">
        <thead>
          <tr className="border-b border-border/80 bg-muted/40">
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Feature</th>
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-primary">AskPay Model</th>
            <th className="p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Typical Subscription</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-xs sm:text-sm">
          <tr>
            <td className="p-4 font-semibold text-foreground">Pricing Basis</td>
            <td className="p-4 text-foreground font-medium">Pay-per-query (0.01 USDm / query)</td>
            <td className="p-4 text-muted-foreground">Flat monthly rate (typically ~$20/mo)</td>
          </tr>
          <tr>
            <td className="p-4 font-semibold text-foreground">Upfront Commitment</td>
            <td className="p-4 text-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>None — pay only when you ask</span>
              </div>
            </td>
            <td className="p-4 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <X className="h-4 w-4 text-red-500 shrink-0" />
                <span>100% paid upfront regardless of usage</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-semibold text-foreground">Account / KYC</td>
            <td className="p-4 text-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>None — connect wallet & query</span>
              </div>
            </td>
            <td className="p-4 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <X className="h-4 w-4 text-red-500 shrink-0" />
                <span>Required email, password, profile setup</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-semibold text-foreground">Payment Method</td>
            <td className="p-4 text-foreground">Celo USDm stablecoin</td>
            <td className="p-4 text-muted-foreground">Credit/Debit Card (recurring mandate)</td>
          </tr>
          <tr>
            <td className="p-4 font-semibold text-foreground">Cancellation Hassle</td>
            <td className="p-4 text-foreground">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>None — simply close the app</span>
              </div>
            </td>
            <td className="p-4 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <X className="h-4 w-4 text-red-500 shrink-0" />
                <span>Multi-step unsubscribe flows required</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
