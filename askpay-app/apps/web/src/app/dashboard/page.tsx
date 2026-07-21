"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import {
  BarChart3,
  MessageSquare,
  Coins,
  Clock,
  TrendingUp,
  Zap,
  ExternalLink,
  ArrowLeft,
  Wallet,
  Download,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { useAskPay } from "@/hooks/useAskPay";
import { ACTIVE_NETWORK } from "@/lib/contracts";
import { UsageChart, type DayBucket } from "@/components/usage-chart";
import type { HistoryItem } from "@/components/chat-box";

// ---------------------------------------------------------------------------
// Export Helpers (Pure client-side blob download)
// ---------------------------------------------------------------------------

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportHistoryAsJSON(history: HistoryItem[]) {
  const dataToExport = history.map((item) => ({
    queryId: item.queryId,
    timestamp: item.timestamp,
    dateISO: new Date(item.timestamp).toISOString(),
    status: item.status,
    question: item.question,
    answer: item.answer ?? null,
    txHash: item.txHash ?? null,
  }));
  const jsonString = JSON.stringify(dataToExport, null, 2);
  downloadFile(jsonString, `askpay-history-${Date.now()}.json`, "application/json");
}

function exportHistoryAsCSV(history: HistoryItem[]) {
  const headers = ["Query ID", "Timestamp", "Date (UTC)", "Status", "Question", "Answer", "Tx Hash"];
  const escapeCsv = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = history.map((item) => [
    escapeCsv(item.queryId),
    escapeCsv(item.timestamp),
    escapeCsv(new Date(item.timestamp).toISOString()),
    escapeCsv(item.status),
    escapeCsv(item.question),
    escapeCsv(item.answer),
    escapeCsv(item.txHash),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadFile(csvContent, `askpay-history-${Date.now()}.csv`, "text/csv;charset=utf-8;");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatFee(wei: bigint): string {
  const val = parseFloat(formatUnits(wei, 18));
  if (val >= 1) return val.toFixed(2);
  if (val >= 0.01) return val.toFixed(2);
  return val.toFixed(4);
}

const explorerBaseUrl =
  ACTIVE_NETWORK === "mainnet"
    ? "https://celoscan.io"
    : "https://sepolia.celoscan.io";

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string; // tailwind colour class
}

function StatCard({ icon, label, value, sub, accent = "text-primary" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
        <span className={accent}>{icon}</span>
        {label}
      </div>
      <p className="text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { fee, isFeeLoading, balance, isBalanceLoading } = useAskPay();

  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("askpay_history");
      if (saved) {
        setHistory(JSON.parse(saved) as HistoryItem[]);
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  // ── Derived stats ────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const answered = history.filter((h) => h.status === "answered");
    const paid = history.filter((h) => h.status === "paid" || h.status === "answered");
    const failed = history.filter((h) => h.status === "failed");
    const pending = history.filter((h) => h.status === "pending");

    const totalQuestions = history.length;
    const successfulQuestions = answered.length;

    // Total USDm spent: count of paid/answered items × fee
    // We read the fee from the contract, but for history items the fee
    // at the time of payment may have differed. Since the contract has
    // a single, owner-adjustable fee and no per-query price was stored,
    // using the current fee is the best approximation.
    const currentFee = fee ?? 0n;
    const totalSpentWei = currentFee * BigInt(paid.length);
    const totalSpent = parseFloat(formatUnits(totalSpentWei, 18));

    // Average "response time" — the time between the timestamp (when
    // the pending entry was created) and … we don't have an "answered at"
    // timestamp stored. So we'll compute the distribution of timestamps
    // across the session and show average queries per day instead.
    // For now, show a human-readable "avg queries / day" stat.
    const daySet = new Set(
      history.map((h) =>
        new Date(h.timestamp).toISOString().slice(0, 10)
      )
    );
    const activeDays = daySet.size || 1;
    const avgPerDay = (totalQuestions / activeDays).toFixed(1);

    return {
      totalQuestions,
      successfulQuestions,
      totalSpent,
      activeDays,
      avgPerDay,
      failedCount: failed.length,
      pendingCount: pending.length,
      paidCount: paid.length,
    };
  }, [history, fee]);

  // ── Chart data: bucket queries by day (last 14 days) ─────────────────────

  const chartData: DayBucket[] = useMemo(() => {
    const now = new Date();
    const days: DayBucket[] = [];

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      days.push({ date: iso, label, count: 0 });
    }

    for (const item of history) {
      const iso = new Date(item.timestamp).toISOString().slice(0, 10);
      const bucket = days.find((d) => d.date === iso);
      if (bucket) bucket.count++;
    }

    return days;
  }, [history]);

  // ── Balance display ──────────────────────────────────────────────────────

  const balanceDisplay = isBalanceLoading
    ? "…"
    : balance !== undefined
    ? parseFloat(formatUnits(balance, 18)).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })
    : "0.00";

  const feeDisplay = isFeeLoading
    ? "…"
    : fee !== undefined
    ? formatFee(fee)
    : "?";

  // ── Recent queries (latest 5) ────────────────────────────────────────────

  const recentQueries = useMemo(() => history.slice(0, 5), [history]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      {/* Header */}
      <section className="container mx-auto px-4 pt-12 pb-8 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
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
              <BarChart3 className="h-7 w-7 text-primary" />
              Usage Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your personal AskPay query stats on Celo{" "}
              <span className="capitalize">{ACTIVE_NETWORK}</span>.
            </p>
          </div>

          {/* Wallet badge & Export controls */}
          {isConnected && address && (
            <div className="flex flex-wrap items-center gap-3">
              {history.length > 0 && (
                <div className="flex items-center gap-1.5 bg-card/60 border border-border p-1 rounded-xl text-xs">
                  <span className="text-[11px] text-muted-foreground font-medium px-2 flex items-center gap-1">
                    <Download className="h-3 w-3 text-primary" /> Export:
                  </span>
                  <button
                    onClick={() => exportHistoryAsJSON(history)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background hover:bg-muted/80 text-foreground font-medium transition-colors border border-border/40 text-xs shadow-xs"
                    title="Export history as JSON"
                  >
                    <FileJson className="h-3.5 w-3.5 text-primary" />
                    <span>JSON</span>
                  </button>
                  <button
                    onClick={() => exportHistoryAsCSV(history)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background hover:bg-muted/80 text-foreground font-medium transition-colors border border-border/40 text-xs shadow-xs"
                    title="Export history as CSV"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                    <span>CSV</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card/60 text-xs">
                <Wallet className="h-3.5 w-3.5 text-primary" />
                <span className="font-mono text-muted-foreground">
                  {address.slice(0, 6)}…{address.slice(-4)}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="font-medium text-foreground">{balanceDisplay} USDm</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Not connected guard */}
      {!isConnected && (
        <section className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col items-center gap-4 p-12 rounded-2xl border border-border bg-card/50 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to see your personal usage dashboard.
            </p>
            <Link
              href="/"
              className="text-xs text-primary hover:underline font-medium"
            >
              Go to Chat →
            </Link>
          </div>
        </section>
      )}

      {isConnected && (
        <>
          {/* Stat cards */}
          <section className="container mx-auto px-4 max-w-4xl mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                icon={<MessageSquare className="h-4 w-4" />}
                label="Total Questions"
                value={stats.totalQuestions}
                sub={`${stats.successfulQuestions} answered · ${stats.failedCount} failed`}
              />
              <StatCard
                icon={<Coins className="h-4 w-4" />}
                label="Total USDm Spent"
                value={`${stats.totalSpent.toFixed(2)}`}
                sub={`@ ${feeDisplay} USDm per query`}
                accent="text-emerald-500"
              />
              <StatCard
                icon={<TrendingUp className="h-4 w-4" />}
                label="Avg Queries / Day"
                value={stats.avgPerDay}
                sub={`Across ${stats.activeDays} active day${stats.activeDays !== 1 ? "s" : ""}`}
                accent="text-blue-500"
              />
              <StatCard
                icon={<Clock className="h-4 w-4" />}
                label="Current Balance"
                value={`${balanceDisplay}`}
                sub="USDm in wallet"
                accent="text-amber-500"
              />
            </div>
          </section>

          {/* Chart */}
          <section className="container mx-auto px-4 max-w-4xl mb-8">
            <div className="p-5 rounded-2xl border border-border bg-card/60">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">
                  Queries — Last 14 Days
                </h2>
              </div>
              <UsageChart data={chartData} height={180} />
            </div>
          </section>

          {/* Recent queries table */}
          <section className="container mx-auto px-4 max-w-4xl">
            <div className="p-5 rounded-2xl border border-border bg-card/60">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Recent Queries
                </h2>
                <div className="flex items-center gap-3">
                  {history.length > 5 && (
                    <span className="text-[10px] text-muted-foreground">
                      Showing 5 of {history.length}
                    </span>
                  )}
                  {history.length > 0 && (
                    <div className="flex items-center gap-1 border-l border-border/50 pl-3">
                      <button
                        onClick={() => exportHistoryAsJSON(history)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                        title="Download JSON history"
                      >
                        <FileJson className="h-3 w-3 text-primary" />
                        JSON
                      </button>
                      <button
                        onClick={() => exportHistoryAsCSV(history)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                        title="Download CSV history"
                      >
                        <FileSpreadsheet className="h-3 w-3 text-emerald-500" />
                        CSV
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {recentQueries.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 opacity-25" />
                  <p className="text-xs">
                    No queries yet. Ask your first question to get started.
                  </p>
                  <Link
                    href="/"
                    className="text-xs text-primary hover:underline font-medium mt-1"
                  >
                    Go to Chat →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentQueries.map((item) => {
                    const statusStyle =
                      item.status === "answered"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                        : item.status === "paid"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                        : item.status === "pending"
                        ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border-yellow-500/20"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";

                    return (
                      <div
                        key={item.queryId}
                        className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-background/40 hover:bg-muted/20 transition-colors"
                      >
                        {/* Status badge */}
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mt-0.5 whitespace-nowrap ${statusStyle}`}
                        >
                          {item.status}
                        </span>

                        {/* Question + meta */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground font-medium line-clamp-1">
                            {item.question}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                            <span>
                              {new Date(item.timestamp).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {item.txHash && (
                              <a
                                href={`${explorerBaseUrl}/tx/${item.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-0.5"
                              >
                                Receipt <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
