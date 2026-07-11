/**
 * /api/admin/request-log
 *
 * GET-only endpoint that returns the in-memory request log and rate-limiter
 * config. Intended for developer/admin use only — protected by a Bearer token.
 *
 * Auth:
 *   Authorization: Bearer <ADMIN_SECRET>
 *   Returns 401 if header is missing or the secret does not match.
 *
 * Query params:
 *   ?limit=N   — number of entries to return (default 50, max 500)
 *
 * Required env var:
 *   ADMIN_SECRET   — the shared secret; if unset the route always returns 503
 *
 * Example response:
 * {
 *   "generatedAt": "2026-07-11T22:00:00.000Z",
 *   "config": { "maxRequests": 10, "windowMs": 60000 },
 *   "totalLogged": 12,
 *   "limit": 50,
 *   "entries": [ { ...RequestLogEntry }, … ]
 * }
 */

import { NextRequest } from "next/server";
import {
  getRequestLog,
  getRequestLogCount,
  rateLimiterConfig,
} from "@/lib/rate-limiter";

// This route runs on the Node.js runtime (needs the singleton module state)
export const runtime = "nodejs";

// Do NOT cache admin responses
export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  // ── Verify ADMIN_SECRET is configured ─────────────────────────────────────
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return new Response(
      JSON.stringify({
        error:
          "Admin endpoint is not configured. Set the ADMIN_SECRET environment variable.",
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // ── Authenticate via Bearer token ──────────────────────────────────────────
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token || token !== adminSecret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized. Provide a valid Bearer token." }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'Bearer realm="AskPay Admin"',
          "Cache-Control": "no-store",
        },
      }
    );
  }

  // ── Parse ?limit query param ───────────────────────────────────────────────
  const rawLimit = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(
    500,
    Math.max(1, rawLimit ? parseInt(rawLimit, 10) || 50 : 50)
  );

  // ── Build response ─────────────────────────────────────────────────────────
  const entries = getRequestLog(limit);
  const totalLogged = getRequestLogCount();

  const rateLimitedCount = entries.filter((e) => e.rateLimited).length;
  const errorCount = entries.filter((e) => e.llmStatus === "error").length;
  const doneCount = entries.filter((e) => e.llmStatus === "done").length;

  return new Response(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        config: rateLimiterConfig,
        totalLogged,
        limit,
        summary: {
          shown: entries.length,
          rateLimited: rateLimitedCount,
          llmErrors: errorCount,
          llmSuccess: doneCount,
        },
        entries,
      },
      null,
      2
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache",
        // Prevent search engines from indexing this route
        "X-Robots-Tag": "noindex",
      },
    }
  );
}
