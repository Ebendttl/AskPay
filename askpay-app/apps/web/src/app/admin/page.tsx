"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { 
  Shield, 
  Coins, 
  Database, 
  Activity, 
  AlertTriangle, 
  ArrowLeft,
  Key, 
  Lock, 
  CheckCircle, 
  RefreshCw,
  Clock,
  Globe,
  User,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAYPERQUERY_ADDRESS, USDM_ADDRESS, ACTIVE_NETWORK } from "@/lib/contracts";
import { useAdminStats } from "@/hooks/useAdminStats";

interface RequestLogEntry {
  ip?: string;
  wallet?: string;
  timestamp: string;
  queryId?: string;
  rateLimited: boolean;
  llmStatus?: string;
  fallbackUsed?: boolean;
  responseTimeMs?: number;
}

interface RequestLogData {
  generatedAt: string;
  config: {
    maxRequests: number;
    windowMs: number;
  };
  totalLogged: number;
  summary: {
    shown: number;
    rateLimited: number;
    llmErrors: number;
    llmSuccess: number;
  };
  entries: RequestLogEntry[];
}

export default function AdminDashboard() {
  const { address, isConnected } = useAccount();
  const {
    contractOwner,
    isOwnerLoading,
    currentFee,
    isFeeLoading,
    contractUSDmBalance,
    isBalanceLoading,
    totalQueriesPaid,
    totalRevenue,
    recentEvents,
    isEventsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useAdminStats();

  // Authentication for /api/admin/request-log
  const [adminToken, setAdminToken] = useState<string>("");
  const [logData, setLogData] = useState<RequestLogData | null>(null);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Load token from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("askpay_admin_token");
    const defaultSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET || "";
    if (saved) {
      setAdminToken(saved);
    } else if (defaultSecret) {
      setAdminToken(defaultSecret);
    }
  }, []);

  const saveToken = (val: string) => {
    setAdminToken(val);
    sessionStorage.setItem("askpay_admin_token", val);
  };

  const fetchRequestLogs = async () => {
    if (!adminToken) {
      setLogsError("Please enter the Admin Secret Token first.");
      return;
    }
    setIsLogsLoading(true);
    setLogsError(null);

    try {
      const res = await fetch("/api/admin/request-log?limit=50", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized: Invalid secret token.");
        }
        if (res.status === 503) {
          throw new Error("Service Unavailable: ADMIN_SECRET environment variable is not set on the server.");
        }
        throw new Error(`Failed with status ${res.status}`);
      }

      const data = await res.json();
      setLogData(data);
    } catch (err: any) {
      console.error("[AdminDashboard] Error fetching request logs:", err);
      setLogsError(err.message || "An error occurred while fetching logs.");
      setLogData(null);
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchRequestLogs();
    }
  }, [adminToken]);

  // UI-ONLY display gate check
  // ⚠️ SECURITY NOTE: On-chain data is inherently public. Anyone can query this contract's state or logs.
  // The gate here only determines if the dashboard UI renders, providing visual security / clean UI flow.
  const isOwner =
    isConnected &&
    address &&
    contractOwner &&
    address.toLowerCase() === contractOwner.toLowerCase();

  const formatUSDm = (val: bigint | undefined) => {
    if (val === undefined) return "Loading...";
    return `${Number(formatUnits(val, 18)).toFixed(2)} USDm`;
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background pb-20">
      
      {/* Header Bar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>AskPay Owner Console</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {ACTIVE_NETWORK}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl border border-border bg-muted/50 text-muted-foreground flex items-center gap-1.5">
                <User className="h-3 w-3" />
                {truncateAddress(address!)}
              </span>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-xl flex items-center gap-1.5"
              onClick={refetchStats}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Gate Message / Access control message */}
        <div className="mb-8 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              UI-ONLY Display Gate Policy
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed max-w-3xl">
              On-chain data, transactions, and event logs are fully public by default. This gate restricts the frontend UI visibility to the contract owner wallet for dashboard convenience. It does not act as on-chain or backend authorization.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 whitespace-nowrap">
            Contract Owner: {isOwnerLoading ? "Loading..." : contractOwner ? truncateAddress(contractOwner) : "Unknown"}
          </div>
        </div>

        {/* Access validation wrapper */}
        {!isConnected ? (
          <div className="p-12 text-center rounded-3xl border border-border bg-card shadow-sm max-w-md mx-auto my-12">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Pochi haijaunganishwa</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Tafadhali unganisha pochi yako ya msimamizi (Owner) kwenye ukurasa wa mwanzo ili uweze kuona dashibodi hii.
            </p>
            <Button asChild className="rounded-xl">
              <Link href="/">Rudi Ukurasa wa Mwanzo</Link>
            </Button>
          </div>
        ) : !isOwner && !isOwnerLoading ? (
          <div className="p-12 text-center rounded-3xl border border-red-500/20 bg-red-500/5 max-w-md mx-auto my-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-red-950 dark:text-red-200 mb-2">Huna Ruhusa ya Kutosha</h2>
            <p className="text-sm text-red-800 dark:text-red-300 mb-6 leading-relaxed">
              Anwani yako ya pochi ({truncateAddress(address!)}) hailingani na anwani ya mmiliki wa mkataba huu ({contractOwner ? truncateAddress(contractOwner) : "N/A"}).
            </p>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/">Rudi kwenye Soga</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Stat 1: Current Fee */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mkataba Ada (Fee)</span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Coins className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  {isFeeLoading ? "Loading..." : formatUSDm(currentFee)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono truncate">
                  PPQ: {truncateAddress(PAYPERQUERY_ADDRESS)}
                </p>
              </div>

              {/* Stat 2: Total Queries */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Jumla ya Malipo</span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  {isEventsLoading ? "Loading..." : totalQueriesPaid}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Imethibitishwa kupitia matukio (events)
                </p>
              </div>

              {/* Stat 3: Contract Balance */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Salio la USDm</span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Database className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  {isBalanceLoading ? "Loading..." : formatUSDm(contractUSDmBalance)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono truncate">
                  USDm: {truncateAddress(USDM_ADDRESS)}
                </p>
              </div>

              {/* Stat 4: Revenue */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mapato ya Jumla</span>
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  {isEventsLoading ? "Loading..." : formatUSDm(totalRevenue)}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Jumla ya mapato yaliyolipwa
                </p>
              </div>

            </div>

            {/* Split layout: Request logs & Contract event logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: API Request Logs (Rate limits, etc.) */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      API Request Log (LLM Logs)
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Recent API requests from memory database
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 rounded-lg text-xs"
                    onClick={fetchRequestLogs}
                    disabled={isLogsLoading}
                  >
                    {isLogsLoading ? "Loading..." : "Reload"}
                  </Button>
                </div>

                {/* Token Authentication Input */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border/80 flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Admin Secret Key (ADMIN_SECRET)
                    </label>
                    <input 
                      type="password"
                      placeholder="Enter secret token..."
                      className="w-full h-9 px-3 rounded-lg border border-border bg-card text-xs font-mono"
                      value={adminToken}
                      onChange={(e) => saveToken(e.target.value)}
                    />
                  </div>
                  <Button 
                    size="sm" 
                    className="rounded-lg h-9 w-full sm:w-auto"
                    onClick={fetchRequestLogs}
                    disabled={isLogsLoading}
                  >
                    Authenticate
                  </Button>
                </div>

                {logsError && (
                  <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-800 dark:text-red-300 leading-relaxed flex gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{logsError}</span>
                  </div>
                )}

                {/* Logs Table / List */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {!logData && !isLogsLoading ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                      <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Enter token and authenticate to view API logs.</p>
                    </div>
                  ) : isLogsLoading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Loading server API request logs...</p>
                    </div>
                  ) : logData?.entries && logData.entries.length === 0 ? (
                    <p className="text-center text-xs text-muted-foreground py-8">No requests logged yet.</p>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {logData?.entries.map((entry, idx) => (
                        <div key={idx} className="py-3 flex items-start justify-between gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-muted-foreground">{entry.ip ? truncateAddress(entry.ip) : "Unknown IP"}</span>
                              <span className="text-[10px] text-muted-foreground/60">•</span>
                              <span className="font-mono">{entry.wallet ? truncateAddress(entry.wallet) : "Anonymous"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </span>
                              {entry.responseTimeMs && (
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                  {entry.responseTimeMs}ms
                                </span>
                              )}
                              {entry.fallbackUsed && (
                                <span className="text-[10px] bg-amber-500/10 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                                  Fallback
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5">
                            {entry.rateLimited ? (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 font-semibold text-[9px] uppercase tracking-wider">
                                Rate Limited
                              </span>
                            ) : entry.llmStatus === "error" ? (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 font-semibold text-[9px] uppercase tracking-wider">
                                LLM Error
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold text-[9px] uppercase tracking-wider">
                                Success
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Smart Contract Event Logs (Payments) */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h2 className="text-base font-bold flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Miamala ya Hivi Karibuni (Events)
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      On-chain payments verified by PayPerQuery contract
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 rounded-lg text-xs"
                    onClick={refetchStats}
                    disabled={isEventsLoading}
                  >
                    {isEventsLoading ? "Loading..." : "Reload"}
                  </Button>
                </div>

                {statsError && (
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-xs text-red-800 dark:text-red-300">
                    {statsError}
                  </div>
                )}

                {/* Event Logs List */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {isEventsLoading && recentEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Loading on-chain events...</p>
                    </div>
                  ) : recentEvents.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                      <Coins className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No query payment events found on this contract.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/60">
                      {recentEvents.map((evt, idx) => (
                        <div key={idx} className="py-3.5 flex items-start justify-between gap-4 text-xs">
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground font-mono truncate block max-w-[120px] sm:max-w-none">
                                {evt.payer}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground font-mono">
                              <span>Query ID: {evt.queryId.toString().slice(0, 10)}...</span>
                              <span>•</span>
                              <span>Tx: {truncateAddress(evt.transactionHash)}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-bold text-foreground block">
                              +{formatUnits(evt.amount, 18)} USDm
                            </span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {new Date(Number(evt.timestamp) * 1000).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
