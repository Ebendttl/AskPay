"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowLeft, Users, Gift, Info, Award, Loader2 } from "lucide-react";
import { ReferralCard } from "@/components/referral-card";
import { ACTIVE_NETWORK } from "@/lib/contracts";

export default function ReferralsPage() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<{ count: number; friends: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !isConnected) {
      setStats(null);
      return;
    }

    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/referrals/stats?address=${address}&network=${ACTIVE_NETWORK}`);
        if (!res.ok) {
          throw new Error("Failed to fetch referral statistics");
        }
        const data = await res.json();
        if (data.success) {
          setStats({
            count: data.count,
            friends: data.friends,
          });
        } else {
          throw new Error(data.error || "Unknown error occurred");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Could not load stats");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [address, isConnected]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      <section className="container mx-auto px-4 pt-12 pb-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
            Back to Chat
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
          <Gift className="h-7 w-7 text-primary animate-pulse" />
          Referrals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Share AskPay with your friends and build the network on Celo.
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
            <div className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm space-y-6">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Referral Statistics
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="p-4 text-xs text-red-500 bg-red-500/10 rounded-xl border border-red-500/20 text-center">
                  {error}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-border bg-background/40 transition-all hover:bg-background/60">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Friends Who Joined
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stats ? stats.count : 0}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      On-chain verified queries
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background/40 transition-all hover:bg-background/60">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Incentive Mode
                    </p>
                    <p className="text-sm font-bold text-foreground mt-2">
                      Purely Info
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      No farming / rewards
                    </p>
                  </div>
                </div>
              )}

              {/* Show referred friend list if any */}
              {stats && stats.friends.length > 0 && (
                <div className="space-y-2 mt-4 animate-fade-in">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Referred Wallets
                  </h3>
                  <div className="max-h-40 overflow-y-auto border border-border/60 rounded-xl divide-y divide-border bg-background/30">
                    {stats.friends.map((friend) => (
                      <div key={friend} className="px-3 py-2 flex items-center justify-between text-xs font-mono">
                        <span className="text-foreground">
                          {friend.slice(0, 10)}...{friend.slice(-8)}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded">
                          First Query Complete
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info banner explaining the mechanics */}
              <div className="flex items-start gap-2.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">How referral tracking works</p>
                  <p className="opacity-90 mt-0.5 leading-relaxed">
                    When someone visits AskPay using your referral link, connects their wallet, and executes their first paid AI query, they are permanently recorded as your referee.
                  </p>
                  <p className="opacity-90 mt-1.5 leading-relaxed">
                    To comply with Proof of Ship guidelines against reward-farming mechanics, AskPay's referrals are <strong>purely informational</strong> — there are no token payouts or fee discounts. It exists solely to track organic sharing.
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
