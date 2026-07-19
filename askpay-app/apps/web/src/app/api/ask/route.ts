import { NextRequest } from "next/server";
import { createPublicClient, http } from "viem";
import { celo, celoSepolia } from "viem/chains";
import {
  PAY_PER_QUERY_ABI,
  PAYPERQUERY_ADDRESS_SEPOLIA,
} from "@/lib/contracts";
import { recordRequest, updateRequestStatus } from "@/lib/rate-limiter";
import { saveQuery, updateQuery } from "@/lib/query-store";

// ---------------------------------------------------------------------------
// Runtime / Vercel config
// ---------------------------------------------------------------------------

// Must run on Node.js — viem and the rate-limiter singleton are incompatible
// with the Edge runtime. maxDuration extends the function timeout to 60s on
// Vercel Pro so long LLM streams are not cut short.
export const runtime = "nodejs";
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SEPOLIA_RPC = "https://forno.celo-sepolia.celo-testnet.org";
const MAINNET_RPC = "https://forno.celo.org";

/** Timeout per individual LLM provider fetch (ms) */
const LLM_TIMEOUT_MS = 25_000;
/** Pause between attempt #1 and attempt #2 (ms) */
const RETRY_DELAY_MS = 300;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AskRequest {
  question: string;
  queryId: string;
  txHash: `0x${string}`;
  network?: "sepolia" | "mainnet";
}

// ---------------------------------------------------------------------------
// SSE helpers
// ---------------------------------------------------------------------------

/** Encode a normal token frame: `data: {"token":"…"}\n\n` */
function encodeToken(token: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ token })}\n\n`);
}

/** Encode the [DONE] sentinel */
function encodeDone(): Uint8Array {
  return new TextEncoder().encode("data: [DONE]\n\n");
}

/** Encode an error event frame */
function encodeError(message: string): Uint8Array {
  return new TextEncoder().encode(
    `event: error\ndata: ${JSON.stringify({ message })}\n\n`
  );
}

// ---------------------------------------------------------------------------
// LLM streaming helpers
// ---------------------------------------------------------------------------

/**
 * Stream tokens from a provider into the WritableStreamDefaultWriter.
 * Throws on any network / API error — caller handles retry.
 */
async function streamFromProvider(
  question: string,
  writer: WritableStreamDefaultWriter<Uint8Array>
): Promise<void> {
  const provider = process.env.LLM_API_PROVIDER?.toLowerCase() || "";
  const apiKey = process.env.LLM_API_KEY || "";

  // ── Demo / mock mode ───────────────────────────────────────────────────────
  if (!apiKey) {
    const mockAnswer = `[Demo Mode] Payment verified! Your question was: "${question}". Add LLM_API_KEY and LLM_API_PROVIDER (gemini/groq) to .env.local for real AI answers.`;
    const words = mockAnswer.split(" ");
    for (const word of words) {
      await writer.write(encodeToken(word + " "));
      await new Promise((r) => setTimeout(r, 40));
    }
    return;
  }

  // ── Config error ──────────────────────────────────────────────────────────
  if (provider !== "gemini" && provider !== "groq") {
    const msg = `[Config Error] LLM_API_PROVIDER is "${provider}". Supported values: "gemini" | "groq".`;
    await writer.write(encodeToken(msg));
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);

  try {
    if (provider === "gemini") {
      await streamGemini(question, apiKey, writer, controller.signal);
    } else {
      await streamGroq(question, apiKey, writer, controller.signal);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

async function streamGemini(
  question: string,
  apiKey: string,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  signal: AbortSignal
): Promise<void> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: question }] }],
    }),
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }

  await pipeSseLinesFromResponse(res, writer, (data) => {
    try {
      const parsed = JSON.parse(data);
      return parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch {
      return null;
    }
  });
}

async function streamGroq(
  question: string,
  apiKey: string,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  signal: AbortSignal
): Promise<void> {
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [{ role: "user", content: question }],
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errorText}`);
  }

  await pipeSseLinesFromResponse(res, writer, (data) => {
    if (data === "[DONE]") return null;
    try {
      const parsed = JSON.parse(data);
      return parsed?.choices?.[0]?.delta?.content ?? null;
    } catch {
      return null;
    }
  });
}

/**
 * Reads an SSE response body line-by-line.
 * Calls `extractToken` on each `data:` line's payload.
 * Writes non-null tokens to the writer.
 */
async function pipeSseLinesFromResponse(
  res: Response,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  extractToken: (data: string) => string | null
): Promise<void> {
  if (!res.body) throw new Error("Provider returned no response body");

  const decoder = new TextDecoder();
  const reader = res.body.getReader();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        const token = extractToken(data);
        if (token) {
          await writer.write(encodeToken(token));
        }
      }
    }

    // Flush any remaining buffer content
    if (buffer.startsWith("data:")) {
      const data = buffer.slice(5).trim();
      const token = extractToken(data);
      if (token) await writer.write(encodeToken(token));
    }
  } finally {
    reader.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // ── Parse & validate ──────────────────────────────────────────────────────
  let body: AskRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { question, queryId, txHash, network = "sepolia" } = body;

  if (!question || !question.trim()) {
    return new Response(JSON.stringify({ error: "Missing or empty question" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!queryId) {
    return new Response(JSON.stringify({ error: "Missing queryId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (!txHash || !txHash.startsWith("0x") || txHash.length !== 66) {
    return new Response(
      JSON.stringify({ error: "Invalid transaction hash format" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Chain / contract config ───────────────────────────────────────────────
  const isMainnet = network === "mainnet";
  const chain = isMainnet ? celo : celoSepolia;
  const rpcUrl = isMainnet ? MAINNET_RPC : SEPOLIA_RPC;

  const contractAddress = isMainnet
    ? (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET as `0x${string}`)
    : PAYPERQUERY_ADDRESS_SEPOLIA;

  if (!contractAddress || contractAddress === "0x") {
    return new Response(
      JSON.stringify({
        error: `Contract address for network "${network}" is not configured on the server`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Extract IP for logging (middleware already enforced the rate limit) ────
  const xff = req.headers.get("x-forwarded-for");
  const ip = xff ? xff.split(",")[0]!.trim() : (req.ip ?? "unknown");

  // ── Record this request in the admin log (pending until stream resolves) ──
  const logId = recordRequest({
    ip,
    queryId,
    txHash,
    network,
    rateLimited: false,
    llmStatus: "pending",
    userAgent: req.headers.get("user-agent"),
    walletAddress: undefined, // Not available in the request body at this point
  });

  // ── Payment verification (synchronous — must pass before stream opens) ───
  console.log(`[AskPay API] Verifying payment on ${network}...`, {
    txHash,
    queryId,
    contractAddress,
  });

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const { verifyPayment } = await import("use-minipay-paygate");
  try {
    await verifyPayment({
      publicClient,
      txHash,
      expectedReceiver: contractAddress,
      customEvent: {
        abi: PAY_PER_QUERY_ABI,
        eventName: "QueryPaid",
        verifyArgs: (args: any) => {
          return args.queryId === BigInt(queryId);
        },
      },
    });
  } catch (err: any) {
    console.error("[AskPay API] Payment verification failed:", err.message);
    updateRequestStatus(logId, "error");
    return new Response(
      JSON.stringify({ error: err.message || "Payment verification failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log("[AskPay API] Payment verified ✓ — opening SSE stream");

  // ── Open SSE stream ───────────────────────────────────────────────────────
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  // Run the LLM call in the background (don't await — return the stream immediately)
  (async () => {
    let lastError: Error | null = null;

    // Flip log entry to "streaming" as soon as we start the first attempt
    updateRequestStatus(logId, "streaming");

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        if (attempt === 2) {
          console.warn("[AskPay API] Attempt 1 failed, retrying after delay…");
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }

        await streamFromProvider(question, writer);
        // Success — write [DONE] and close
        await writer.write(encodeDone());
        await writer.close();
        updateRequestStatus(logId, "done");
        console.log("[AskPay API] SSE stream completed successfully");
        return;
      } catch (err: any) {
        lastError = err;
        console.error(`[AskPay API] LLM attempt ${attempt} failed:`, err.message);
      }
    }

    // Both attempts failed — emit error frame and close
    const friendlyMessage =
      lastError?.message?.includes("AbortError") || lastError?.name === "AbortError"
        ? "The AI provider timed out. Please try again."
        : `AI response failed: ${lastError?.message ?? "Unknown error"}`;

    updateRequestStatus(logId, "error");

    try {
      await writer.write(encodeError(friendlyMessage));
      await writer.close();
    } catch (closeErr) {
      console.error("[AskPay API] Error closing stream after failure:", closeErr);
      writer.abort(closeErr);
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Allow Next.js edge / node runtime to flush immediately
      "X-Accel-Buffering": "no",
    },
  });
}
