import { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { celo, celoSepolia } from "viem/chains";
import {
  PAY_PER_QUERY_ABI,
  PAYPERQUERY_ADDRESS_SEPOLIA,
  DEPLOY_BLOCK_SEPOLIA,
  DEPLOY_BLOCK_MAINNET,
} from "@/lib/contracts";
import { getReferralsMap } from "@/lib/referral-store";

export const runtime = "nodejs";

const SEPOLIA_RPC = "https://forno.celo-sepolia.celo-testnet.org";
const MAINNET_RPC = "https://forno.celo.org";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const network = searchParams.get("network") || "sepolia";

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return new Response(JSON.stringify({ error: "Missing or invalid wallet address" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const isMainnet = network === "mainnet";
  const chain = isMainnet ? celo : celoSepolia;
  const rpcUrl = isMainnet ? MAINNET_RPC : SEPOLIA_RPC;
  const deployBlock = isMainnet ? DEPLOY_BLOCK_MAINNET : DEPLOY_BLOCK_SEPOLIA;

  const contractAddress = isMainnet
    ? (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET as `0x${string}`)
    : PAYPERQUERY_ADDRESS_SEPOLIA;

  if (!contractAddress || contractAddress === "0x") {
    return new Response(
      JSON.stringify({ error: `Contract address for network "${network}" is not configured` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // 1. Read QueryPaid events from the contract
    const queryPaidEvent = PAY_PER_QUERY_ABI.find((x) => x.name === "QueryPaid");
    if (!queryPaidEvent) {
      throw new Error("QueryPaid event ABI definition not found");
    }

    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: queryPaidEvent,
      fromBlock: deployBlock,
      toBlock: "latest",
    });

    // 2. Extract distinct payer addresses
    const distinctPayers = new Set<string>();
    for (const log of logs) {
      const payer = log.args?.payer;
      if (payer && typeof payer === "string") {
        distinctPayers.add(payer.toLowerCase());
      }
    }

    // 3. Cross-reference against server-side referral store
    const referrals = getReferralsMap();
    const referrerLower = address.toLowerCase();

    const friendsWhoJoined: string[] = [];
    for (const referee of distinctPayers) {
      const mappedReferrer = referrals[referee];
      if (mappedReferrer === referrerLower) {
        friendsWhoJoined.push(referee);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        referrer: address,
        count: friendsWhoJoined.length,
        friends: friendsWhoJoined,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("[Referrals API] Error fetching stats:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to fetch stats" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
