"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { useState } from "react";
import {
  ArrowLeft,
  Search,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Coins,
  History,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Wallet
} from "lucide-react";
import { useMyQuestions } from "@/hooks/useMyQuestions";
import { useLanguage } from "@/hooks/useLanguage";
import { ACTIVE_NETWORK } from "@/lib/contracts";

export default function MyQuestionsPage() {
  const { isConnected, address } = useAccount();
  const { events, isLoading, error, refetch } = useMyQuestions();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const explorerBaseUrl =
    ACTIVE_NETWORK === "mainnet"
      ? "https://celoscan.io"
      : "https://sepolia.celoscan.io";

  // Format addresses for display
  const shortAddress = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "";

  // Clipboard copy handler
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter events based on search query (by query ID or tx hash)
  const filteredEvents = events.filter((e) => {
    const qStr = e.queryId.toString();
    const txStr = e.transactionHash.toLowerCase();
    const s = searchQuery.toLowerCase();
    return qStr.includes(s) || txStr.includes(s);
  });

  // Calculate statistics
  const totalQueries = events.length;
  const totalSpent = events.reduce((acc, e) => acc + e.amount, 0n);
  const formattedTotalSpent = parseFloat(formatUnits(totalSpent, 18)).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      <section className="container mx-auto px-4 pt-12 pb-8 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
          >
            <ArrowLeft className="h-3 w-3 group-hover:-translate-x-0.5 transition-transform" />
            {t("back_to_chat")}
          </Link>

          {isConnected && (
            <button
              onClick={refetch}
              disabled={isLoading}
              className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? t("chat_button_processing") : "Refresh"}
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <History className="h-7 w-7 text-primary animate-pulse" />
              {t("my_questions_title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {t("my_questions_subtitle")}
            </p>
          </div>

          {isConnected && address && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card/40 backdrop-blur-sm text-xs text-muted-foreground">
              <Wallet className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono">{shortAddress}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-4xl space-y-6">
        {!isConnected ? (
          <div className="flex flex-col items-center gap-4 p-12 rounded-2xl border border-border bg-card/50 text-center shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Wallet className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground max-w-md">
              {t("my_questions_connect")}
            </p>
            <Link
              href="/"
              className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 transition-colors shadow-sm"
            >
              Go to Chat
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-card to-background/50 shadow-sm relative overflow-hidden group">
                <div className="absolute right-3 top-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
                  <History className="h-14 w-14 text-foreground" />
                </div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  {t("my_questions_total")}
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-2">
                  {isLoading ? "…" : totalQueries}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-card to-background/50 shadow-sm relative overflow-hidden group">
                <div className="absolute right-3 top-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-14 w-14 text-foreground" />
                </div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  {t("my_questions_total_spent")}
                </p>
                <div className="flex items-baseline gap-1 mt-2">
                  <p className="text-3xl font-extrabold text-foreground">
                    {isLoading ? "…" : formattedTotalSpent}
                  </p>
                  <span className="text-xs font-semibold text-muted-foreground">USDm</span>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-sm space-y-6">
              {/* Search filter input */}
              {events.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by Query ID or Transaction Hash…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary text-sm transition-all placeholder:text-muted-foreground/60"
                  />
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-3">
                  <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm font-medium animate-pulse">
                    {t("my_questions_loading")}
                  </p>
                </div>
              ) : error ? (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Failed to fetch on-chain query log history</p>
                    <p className="opacity-90 mt-1">{error}</p>
                  </div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                  <Coins className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm max-w-sm">
                    {events.length === 0
                      ? t("my_questions_empty")
                      : "No results matched your search query."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/80">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-medium text-xs">
                        <th className="p-4">{t("my_questions_query_id")}</th>
                        <th className="p-4">{t("my_questions_timestamp")}</th>
                        <th className="p-4">{t("my_questions_amount")}</th>
                        <th className="p-4 text-right">{t("my_questions_tx_hash")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredEvents.map((e) => {
                        const date = new Date(Number(e.timestamp) * 1000);
                        const formattedDate = date.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        });
                        const formattedTime = date.toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        });
                        const qIdStr = e.queryId.toString();
                        const shortQId = `${qIdStr.slice(0, 12)}…${qIdStr.slice(-6)}`;
                        const isCopied = copiedId === qIdStr;

                        const usdmFormatted = parseFloat(
                          formatUnits(e.amount, 18)
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        });

                        return (
                          <tr
                            key={e.queryId.toString() + e.transactionHash}
                            className="hover:bg-muted/20 transition-colors duration-150"
                          >
                            <td className="p-4 font-mono text-xs text-foreground">
                              <div className="flex items-center gap-1.5 group">
                                <span title={qIdStr}>{shortQId}</span>
                                <button
                                  onClick={() => handleCopy(qIdStr)}
                                  className="text-muted-foreground hover:text-primary p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150"
                                  title="Copy full Query ID"
                                >
                                  {isCopied ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">
                                  {formattedDate}
                                </span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {formattedTime}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-bold text-foreground">
                              {usdmFormatted} <span className="text-[10px] text-muted-foreground font-normal">USDm</span>
                            </td>
                            <td className="p-4 text-right">
                              <a
                                href={`${explorerBaseUrl}/tx/${e.transactionHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold decoration-primary/30"
                              >
                                {e.transactionHash.slice(0, 8)}…
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
