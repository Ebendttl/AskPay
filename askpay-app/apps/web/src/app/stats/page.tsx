"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  DollarSign,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  ArrowLeft,
  Zap,
} from "lucide-react";
import { PAYPERQUERY_ADDRESS_MAINNET, ACTIVE_NETWORK } from "@/lib/contracts";
import { useLanguage } from "@/hooks/useLanguage";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StatsData {
  success: boolean;
  network: string;
  totalQuestions: number;
  totalFeesUsdm: string;
  uniquePayers: number;
  fetchedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatFee(raw: string): string {
  const n = parseFloat(raw);
  if (isNaN(n)) return "0.0000";
  // Show up to 4 significant decimal places, trimming trailing zeros
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function timeAgo(iso: string): string {
  const delta = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (delta < 60) return `${delta}s ago`;
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  return `${Math.floor(delta / 3600)}h ago`;
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}

function StatCard({ icon, label, value, sub, accent = "text-primary" }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      {/* Subtle gradient blob */}
      <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ${accent}`}
          >
            {icon}
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight text-foreground">
              {value}
            </p>
            {sub && (
              <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-6 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-muted mb-4" />
      <div className="h-3 w-24 rounded bg-muted mb-3" />
      <div className="h-8 w-32 rounded bg-muted" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();

  const network = ACTIVE_NETWORK;

  async function fetchStats(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Always fetch mainnet stats on the public /stats page
      const res = await fetch(`/api/stats?network=mainnet`, {
        // Force a fresh fetch when the user manually refreshes
        cache: isRefresh ? "no-store" : "default",
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data: StatsData = await res.json();
      if (!data.success) throw new Error(data.fetchedAt ?? "API error");
      setStats(data);
    } catch (err: any) {
      setError(err.message ?? "Could not load stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const celoscanUrl =
    PAYPERQUERY_ADDRESS_MAINNET && PAYPERQUERY_ADDRESS_MAINNET !== "0x"
      ? `https://celoscan.io/address/${PAYPERQUERY_ADDRESS_MAINNET}#events`
      : "https://celoscan.io";

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-24">
      {/* ── Header ── */}
      <section className="container mx-auto max-w-3xl px-4 pt-12 pb-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
            {t("back_to_chat")}
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-foreground">
              <BarChart3 className="h-7 w-7 text-primary" />
              {t("stats_title")}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
              {t("stats_subtitle")}
            </p>
          </div>

          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            {t("stats_refresh")}
          </button>
        </div>

        {/* Network badge */}
        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-[11px] font-semibold text-green-600 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {t("stats_status_live")}
          </span>
          {stats?.fetchedAt && !loading && (
            <span className="text-[11px] text-muted-foreground">
              {t("stats_updated_prefix", { time: timeAgo(stats.fetchedAt) })} · {t("stats_cached_suffix")}
            </span>
          )}
        </div>
      </section>

      {/* ── Stat Cards ── */}
      <section className="container mx-auto max-w-3xl px-4">
        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-sm font-semibold text-red-500">
              {t("stats_failed_to_load")}
            </p>
            <p className="mt-1 text-xs text-red-400/80">{error}</p>
            <button
              onClick={() => fetchStats()}
              className="mt-4 text-xs text-red-500 underline underline-offset-2"
            >
              {t("stats_try_again")}
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              icon={<MessageSquare className="h-5 w-5" />}
              label={t("stats_total_questions")}
              value={formatNumber(stats.totalQuestions)}
              sub={t("stats_total_questions_sub")}
            />
            <StatCard
              icon={<DollarSign className="h-5 w-5" />}
              label={t("stats_total_fees")}
              value={`$${formatFee(stats.totalFeesUsdm)}`}
              sub={t("stats_total_fees_sub")}
              accent="text-emerald-500"
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label={t("stats_unique_payers")}
              value={formatNumber(stats.uniquePayers)}
              sub={t("stats_unique_payers_sub")}
              accent="text-violet-500"
            />
          </div>
        ) : null}
      </section>

      {/* ── Info banner ── */}
      <section className="container mx-auto max-w-3xl px-4 mt-6">
        <div className="rounded-2xl border border-border bg-card/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                {t("stats_calc_title")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {t("stats_calc_desc")}
              </p>
            </div>
          </div>
          <a
            href={celoscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-medium hover:border-primary/40 hover:text-primary transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("stats_view_on_celoscan")}
          </a>
        </div>
      </section>

      {/* ── Contract address ── */}
      {PAYPERQUERY_ADDRESS_MAINNET && PAYPERQUERY_ADDRESS_MAINNET !== "0x" && (
        <section className="container mx-auto max-w-3xl px-4 mt-4">
          <div className="rounded-xl border border-border/60 bg-background/30 px-4 py-3 flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span className="text-[10px] uppercase tracking-wider font-sans font-semibold text-muted-foreground/70 shrink-0">
              {t("stats_contract_label")}
            </span>
            <span className="truncate">{PAYPERQUERY_ADDRESS_MAINNET}</span>
            <a
              href={`https://celoscan.io/address/${PAYPERQUERY_ADDRESS_MAINNET}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
