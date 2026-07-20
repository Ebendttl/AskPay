import { NextRequest } from "next/server";
import { createPublicClient, http, formatUnits } from "viem";
import { celo, celoSepolia } from "viem/chains";
import {
  PAY_PER_QUERY_ABI,
  PAYPERQUERY_ADDRESS_MAINNET,
  PAYPERQUERY_ADDRESS_SEPOLIA,
  DEPLOY_BLOCK_MAINNET,
  DEPLOY_BLOCK_SEPOLIA,
} from "@/lib/contracts";

// ---------------------------------------------------------------------------
// Runtime / caching
// ---------------------------------------------------------------------------

// Node.js runtime required for viem.
export const runtime = "nodejs";

// Next.js ISR: cache this route's response for 5 minutes, then revalidate
// in the background. This means the RPC is called at most once per 5 min
// across all visitors, not on every request.
export const revalidate = 300; // seconds

// ---------------------------------------------------------------------------
// RPC endpoints (public — no API key required)
// ---------------------------------------------------------------------------

const MAINNET_RPC = "https://forno.celo.org";
const SEPOLIA_RPC = "https://forno.celo-sepolia.celo-testnet.org";

// ---------------------------------------------------------------------------
// GET /api/stats
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const network = (searchParams.get("network") ?? "mainnet") as
    | "mainnet"
    | "sepolia";

  const isMainnet = network === "mainnet";
  const chain = isMainnet ? celo : celoSepolia;
  const rpcUrl = isMainnet ? MAINNET_RPC : SEPOLIA_RPC;
  const contractAddress = isMainnet
    ? PAYPERQUERY_ADDRESS_MAINNET
    : PAYPERQUERY_ADDRESS_SEPOLIA;
  const deployBlock = isMainnet ? DEPLOY_BLOCK_MAINNET : DEPLOY_BLOCK_SEPOLIA;

  if (!contractAddress || contractAddress === "0x") {
    return Response.json(
      { error: `Contract address for "${network}" is not configured` },
      { status: 500 }
    );
  }

  try {
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Pull every QueryPaid event from deploy block → latest using
    // getContractEvents, which infers args types directly from the ABI
    // so TypeScript knows the shape of log.args.
    const logs = await publicClient.getContractEvents({
      address: contractAddress,
      abi: PAY_PER_QUERY_ABI,
      eventName: "QueryPaid",
      fromBlock: deployBlock,
      toBlock: "latest",
    });

    // --- Aggregate ---
    let totalFeesWei = 0n;
    const uniquePayers = new Set<string>();

    for (const log of logs) {
      const args = log.args as any;
      if (args?.amount !== undefined) {
        totalFeesWei += BigInt(args.amount);
      }
      if (args?.payer) {
        uniquePayers.add((args.payer as string).toLowerCase());
      }
    }

    // Format fees: USDm uses 18 decimals, display with 4 dp
    const totalFeesUsdm = formatUnits(totalFeesWei, 18);

    return Response.json(
      {
        success: true,
        network,
        totalQuestions: logs.length,
        totalFeesUsdm,
        uniquePayers: uniquePayers.size,
        // Include raw wei for any consumer that needs full precision
        totalFeesWei: totalFeesWei.toString(),
        // ISO timestamp so clients can show "last updated"
        fetchedAt: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          // Let CDN / Vercel edge also cache for 5 min
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (err: any) {
    console.error("[/api/stats] Error fetching on-chain stats:", err);
    return Response.json(
      { error: err.message ?? "Failed to fetch on-chain stats" },
      { status: 500 }
    );
  }
}
