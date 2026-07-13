"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowLeft, Users, Gift, ShieldAlert, Award } from "lucide-react";
import { ReferralCard } from "@/components/referral-card";

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      <section className="container mx-auto px-4 pt-12 pb-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Chat
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Gift className="h-7 w-7 text-primary" />
          Referrals & Rewards
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invite friends to AskPay and earn rewards on Celo.
        </p>
      </section>

      <section className="container mx-auto px-4 max-w-2xl space-y-6">
        {!isConnected ? (
          <div className="flex flex-col items-center gap-4 p-12 rounded-2xl border border-border bg-card/50 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to generate your unique referral link.
            </p>
            <Link
              href="/"
              className="text-xs text-primary hover:underline font-medium"
            >
              Go to Chat →
            </Link>
          </div>
        ) : (
          <>
            {/* Referral link generator card */}
            {address && <ReferralCard address={address} />}

            {/* Stats section */}
            <div className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <Award className="h-4 w-4 text-primary" />
                Referral Statistics
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-xl border border-border bg-background/40">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Total Referred
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">0</p>
                  <p className="text-[9px] text-muted-foreground mt-1">referrals: coming soon</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-background/40">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    Rewards Earned
                  </p>
                  <p className="text-lg font-bold text-foreground mt-1">0.00 USDm</p>
                  <p className="text-[9px] text-muted-foreground mt-1">tracking is not live yet</p>
                </div>
              </div>

              {/* Honest backend disclosure banner */}
              <div className="flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Referral tracking system is coming soon</p>
                  <p className="opacity-90 mt-0.5">
                    This dashboard is currently display-only. We are building the on-chain indexer to track referrals and credit rewards. Rest assured, links shared now will be retroactively credited.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
