import Link from "next/link";
import { headers } from "next/headers";
import { createPublicClient, http, formatUnits } from "viem";
import { celo, celoSepolia } from "viem/chains";
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
  Clock,
  Globe,
  AlertCircle
} from "lucide-react";
import {
  PAY_PER_QUERY_ABI,
  ERC20_ABI,
  PAYPERQUERY_ADDRESS_MAINNET,
  PAYPERQUERY_ADDRESS_SEPOLIA,
  USDM_ADDRESS_MAINNET,
  USDM_ADDRESS_SEPOLIA,
  DEPLOY_BLOCK_MAINNET,
  DEPLOY_BLOCK_SEPOLIA,
  ACTIVE_NETWORK
} from "@/lib/contracts";
import { getRequestLog, getRequestLogCount, rateLimiterConfig } from "@/lib/rate-limiter";

// Ensure Node runtime is used for viem / in-memory rate-limiter logs
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEPOLIA_RPC = "https://forno.celo-sepolia.celo-testnet.org";
const MAINNET_RPC = "https://forno.celo.org";

interface QueryPaidEventLog {
  payer: `0x${string}`;
  amount: bigint;
  queryId: bigint;
  timestamp: bigint;
  transactionHash: `0x${string}`;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  // ── 1. Gating logic (server-side only) ───────────────────────────────────
  const adminSecret = process.env.ADMIN_SECRET;

  // Retrieve token from query parameter or Authorization header
  const queryToken = searchParams.token;
  const authHeader = headers().get("authorization") ?? "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  const token = queryToken || headerToken;
  const isAuthorized = adminSecret && token === adminSecret;

  if (!adminSecret) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-red-200">Configuration Error</h2>
          <p className="text-sm text-red-300/80 leading-relaxed">
            The server's <code>ADMIN_SECRET</code> environment variable is not configured. Please set it before accessing the console.
          </p>
          <Link href="/" className="inline-block text-xs font-semibold px-4 py-2 rounded-xl bg-muted border border-border hover:bg-muted/80 transition">
            Back to Chat
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] text-foreground flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-border bg-card/60 backdrop-blur-md shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground">AskPay Console</h2>
            <p className="text-xs text-muted-foreground">
              Please enter the Admin Secret to access read-only contract state and request logs.
            </p>
          </div>

          <form method="GET" action="/admin" className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Admin Secret Key
              </label>
              <input
                type="password"
                name="token"
                placeholder="Enter secret token..."
                required
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-ring text-sm font-mono"
              />
            </div>
            {token && (
              <p className="text-xs text-red-400 text-center font-medium animate-pulse">
                Invalid secret token. Try again.
              </p>
            )}
            <button
              type="submit"
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition"
            >
              Authenticate
            </button>
          </form>

          <div className="text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:underline">
              Cancel and Return
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. Authorized - Fetch on-chain state & logs server-side ──────────────
  const isMainnet = ACTIVE_NETWORK === "mainnet";
  const chain = isMainnet ? celo : celoSepolia;
  const rpcUrl = isMainnet ? MAINNET_RPC : SEPOLIA_RPC;
  const contractAddress = isMainnet
    ? PAYPERQUERY_ADDRESS_MAINNET
    : PAYPERQUERY_ADDRESS_SEPOLIA;
  const usdmAddress = isMainnet ? USDM_ADDRESS_MAINNET : USDM_ADDRESS_SEPOLIA;
  const deployBlock = isMainnet ? DEPLOY_BLOCK_MAINNET : DEPLOY_BLOCK_SEPOLIA;

  let currentFee = 0n;
  let contractUSDmBalance = 0n;
  let contractOwner = "0x0000000000000000000000000000000000000000";
  let recentEvents: QueryPaidEventLog[] = [];
  let totalQueriesPaid = 0;
  let totalRevenue = 0n;
  let fetchError: string | null = null;

  try {
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Execute queries in parallel
    const [feeData, balanceData, ownerData, logs] = await Promise.all([
      publicClient.readContract({
        address: contractAddress,
        abi: PAY_PER_QUERY_ABI,
        functionName: "fee",
      }),
      publicClient.readContract({
        address: usdmAddress,
        abi: ERC20_ABI,
        args: [contractAddress],
        functionName: "balanceOf",
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: PAY_PER_QUERY_ABI,
        functionName: "owner",
      }),
      publicClient.getContractEvents({
        address: contractAddress,
        abi: PAY_PER_QUERY_ABI,
        eventName: "QueryPaid",
        fromBlock: deployBlock,
        toBlock: "latest",
      }),
    ]);

    currentFee = BigInt(feeData);
    contractUSDmBalance = BigInt(balanceData);
    contractOwner = ownerData as string;

    const formattedEvents = logs
      .map((log) => {
        const { payer, amount, queryId, timestamp } = log.args as any;
        return {
          payer: payer || "0x",
          amount: amount || 0n,
          queryId: queryId || 0n,
          timestamp: timestamp || 0n,
          transactionHash: log.transactionHash || "0x",
        };
      })
      .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

    totalQueriesPaid = formattedEvents.length;
    totalRevenue = formattedEvents.reduce((acc, e) => acc + e.amount, 0n);
    recentEvents = formattedEvents.slice(0, 10);
  } catch (err: any) {
    console.error("[AdminDashboard] Server-side Web3 fetch error:", err);
    fetchError = err.message || "Failed to fetch on-chain state.";
  }

  // Fetch in-memory API request logs
  const apiLogs = getRequestLog(50);
  const totalLogged = getRequestLogCount();
  const rateLimitedCount = apiLogs.filter((e) => e.rateLimited).length;
  const errorCount = apiLogs.filter((e) => e.llmStatus === "error").length;
  const doneCount = apiLogs.filter((e) => e.llmStatus === "done").length;

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatUSDm = (val: bigint) => {
    return `${Number(formatUnits(val, 18)).toFixed(2)} USDm`;
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-foreground pb-20">
      
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
            <Link 
              href={`/admin?token=${encodeURIComponent(token ?? "")}`}
              className="px-3 py-1.5 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition"
            >
              Refresh Logs
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Policy Message */}
        <div className="mb-8 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0" />
              UI-ONLY Display Gate Policy
            </h3>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed max-w-3xl">
              On-chain data and event logs are public by default. This gate restricts the frontend UI visibility to the holder of the <code>ADMIN_SECRET</code> key. This is a read-only console: contract state mutations must be performed on-chain via Owner scripts or Celoscan.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 whitespace-nowrap">
            Contract Owner: {truncateAddress(contractOwner)}
          </div>
        </div>

        {fetchError && (
          <div className="mb-8 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-800 dark:text-red-300 flex gap-2">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Web3 Load Error</p>
              <p className="mt-0.5 opacity-90">{fetchError}</p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          
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
                {formatUSDm(currentFee)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono truncate">
                PPQ: {truncateAddress(contractAddress)}
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
                {totalQueriesPaid}
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
                {formatUSDm(contractUSDmBalance)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 font-mono truncate">
                USDm: {truncateAddress(usdmAddress)}
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
                {formatUSDm(totalRevenue)}
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
                    Recent API requests from memory database ({totalLogged} total)
                  </p>
                </div>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-3 gap-2 text-center p-3.5 bg-muted/30 rounded-xl text-[10px] font-semibold text-muted-foreground">
                <div>
                  <p className="text-base font-bold text-foreground">{apiLogs.length}</p>
                  <p>Shown</p>
                </div>
                <div>
                  <p className="text-base font-bold text-red-500">{rateLimitedCount}</p>
                  <p>Rate Limited</p>
                </div>
                <div>
                  <p className="text-base font-bold text-emerald-600">{doneCount}</p>
                  <p>Success</p>
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {apiLogs.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-8">No requests logged yet.</p>
                ) : (
                  <div className="divide-y divide-border/60">
                    {apiLogs.map((entry, idx) => (
                      <div key={idx} className="py-3 flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-muted-foreground">{entry.ip ? truncateAddress(entry.ip) : "Unknown IP"}</span>
                            <span className="text-[10px] text-muted-foreground/60">•</span>
                            <span className="font-mono">{entry.walletAddress ? truncateAddress(entry.walletAddress) : "Anonymous"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleTimeString()}
                            </span>
                            <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                              {entry.network || "unknown"}
                            </span>
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
                    10 most recent payments verified by PayPerQuery contract
                  </p>
                </div>
              </div>

              {/* Event Logs List */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {recentEvents.length === 0 ? (
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
                            <span className="font-semibold text-foreground font-mono truncate block">
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

      </main>

    </div>
  );
}
