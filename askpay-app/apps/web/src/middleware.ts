/**
 * middleware.ts
 *
 * Next.js middleware that enforces per-IP rate limiting on /api/ask.
 *
 * Why this file, why this position:
 *   - Must live at apps/web/src/middleware.ts (Next.js App Router convention)
 *   - Runs BEFORE the route handler — blocks spam before blockchain
 *     verification or the LLM stream even begins
 *   - Uses the Node.js runtime so it can share the singleton Map from
 *     lib/rate-limiter.ts across requests within the same process
 *
 * Rate-limited responses:
 *   HTTP 429  Content-Type: application/json
 *   { "error": "Rate limit exceeded. Try again in N seconds.", "retryAfter": N }
 *   Retry-After: N   (standard header for well-behaved clients)
 *
 * Blocked requests are also written to the in-memory request log so the
 * admin route (/api/admin/request-log) can surface abuse patterns.
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, recordRequest } from "@/lib/rate-limiter";

// ---------------------------------------------------------------------------
// Runtime declaration
// ---------------------------------------------------------------------------

// Declare Node.js runtime so this middleware can import the singleton Map
// module from lib/rate-limiter.ts (Edge runtime cannot share module state).
export const runtime = "nodejs";

// ---------------------------------------------------------------------------
// Route matcher — only intercept /api/ask
// ---------------------------------------------------------------------------

export const config = {
  matcher: ["/api/ask"],
};

// ---------------------------------------------------------------------------
// Middleware handler
// ---------------------------------------------------------------------------

export function middleware(req: NextRequest) {
  // ── Extract client IP ──────────────────────────────────────────────────────
  // x-forwarded-for is set by Vercel / reverse proxies; req.ip is the direct
  // socket address (useful in local dev). We take the first address in the
  // XFF chain (the originating client) as the canonical IP.
  const xff = req.headers.get("x-forwarded-for");
  const ip: string = xff ? xff.split(",")[0]!.trim() : (req.ip ?? "unknown");

  // ── Check rate limit ───────────────────────────────────────────────────────
  const result = checkRateLimit(ip);

  if (!result.allowed) {
    const retryAfter = result.retryAfter ?? 60;

    // Log the blocked attempt (rateLimited: true, no body available yet)
    recordRequest({
      ip,
      queryId: "",
      txHash: "",
      network: "",
      rateLimited: true,
      llmStatus: "pending",
      userAgent: req.headers.get("user-agent"),
    });

    console.warn(
      `[RateLimit] Blocked ${ip} — retry in ${retryAfter}s`,
      new Date().toISOString()
    );

    return new NextResponse(
      JSON.stringify({
        error: `Rate limit exceeded. You have sent too many requests. Try again in ${retryAfter} second${retryAfter === 1 ? "" : "s"}.`,
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          // Prevent the browser from caching a 429
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // ── Allowed — pass through with rate-limit headers ─────────────────────────
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(result.remaining !== undefined ? (result.remaining + (/* hits so far= */ 1)) : "?"));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining ?? 0));

  return response;
}
