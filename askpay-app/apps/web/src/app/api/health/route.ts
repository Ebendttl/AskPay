import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAINNET_RPC = "https://forno.celo.org";
const CHECK_TIMEOUT_MS = 5_000;

interface CheckResult {
  status: "ok" | "error";
  latencyMs?: number;
  [key: string]: unknown;
}

/** Check RPC connectivity to Celo mainnet via eth_blockNumber */
async function checkRpcConnectivity(): Promise<CheckResult> {
  const start = Date.now();
  try {
    const client = createPublicClient({
      chain: celo,
      transport: http(MAINNET_RPC, { timeout: CHECK_TIMEOUT_MS }),
    });

    const blockNumber = await client.getBlockNumber();
    const latencyMs = Date.now() - start;

    return {
      status: "ok",
      network: "celo-mainnet",
      blockNumber: Number(blockNumber),
      latencyMs,
    };
  } catch (error) {
    const latencyMs = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : "RPC request failed";
    return {
      status: "error",
      network: "celo-mainnet",
      latencyMs,
      error: errorMessage.slice(0, 200), // sanitize / trim
    };
  }
}

/** Check LLM API configuration and provider reachability without token generation */
async function checkLlmReachability(): Promise<CheckResult> {
  const apiKey = process.env.LLM_API_KEY;
  const provider = (process.env.LLM_API_PROVIDER || "gemini").toLowerCase();

  if (!apiKey) {
    return {
      status: "error",
      provider,
      configured: false,
      reachable: false,
      error: "LLM_API_KEY is not configured",
    };
  }

  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    let response: Response;

    if (provider === "groq") {
      response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
      });
    } else {
      // Default to Gemini models list check
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;
      response = await fetch(url, {
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;

    if (response.ok) {
      return {
        status: "ok",
        provider,
        configured: true,
        reachable: true,
        latencyMs,
      };
    } else {
      return {
        status: "error",
        provider,
        configured: true,
        reachable: false,
        latencyMs,
        error: `Provider returned HTTP ${response.status}`,
      };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    const errorMessage = error instanceof Error ? error.message : "Reachability check failed";

    return {
      status: "error",
      provider,
      configured: true,
      reachable: false,
      latencyMs,
      error: errorMessage.slice(0, 200),
    };
  }
}

export async function GET() {
  const timestamp = new Date().toISOString();
  const version = "0.1.0";
  const commitHash =
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    "development";

  const [rpcResult, llmResult] = await Promise.all([
    checkRpcConnectivity(),
    checkLlmReachability(),
  ]);

  const isHealthy = rpcResult.status === "ok" && llmResult.status === "ok";
  const overallStatus = isHealthy
    ? "ok"
    : rpcResult.status === "ok" || llmResult.status === "ok"
    ? "degraded"
    : "error";

  const body = {
    status: overallStatus,
    timestamp,
    version,
    commitHash,
    checks: {
      rpc: rpcResult,
      llm: llmResult,
    },
  };

  return NextResponse.json(body, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
