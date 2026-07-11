/**
 * rate-limiter.ts
 *
 * Singleton module providing:
 *  1. A sliding-window per-IP rate limiter (no external dependencies)
 *  2. An in-memory request log (capped at MAX_LOG_ENTRIES, FIFO eviction)
 *
 * Both structures live as module-level variables so they survive across
 * requests within a single server process lifetime (acceptable for the
 * "in-memory is fine" requirement). They reset on server restart.
 *
 * Configuration via env vars (with safe defaults):
 *   RATE_LIMIT_MAX_REQUESTS  — max hits per window per IP   (default: 10)
 *   RATE_LIMIT_WINDOW_MS     — sliding window in ms          (default: 60000)
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? "10", 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10);

/** Hard cap on how many IPs we track to prevent unbounded Map growth. */
const MAX_TRACKED_IPS = 5_000;

/** Hard cap on the number of log entries kept in memory. */
const MAX_LOG_ENTRIES = 500;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LLMStatus = "pending" | "streaming" | "done" | "error";

export interface RequestLogEntry {
  id: string;
  timestamp: number;
  ip: string;
  queryId: string;
  txHash: string;
  network: string;
  rateLimited: boolean;
  llmStatus: LLMStatus;
  userAgent: string | null;
  /** Wallet address parsed from the POST body (may be undefined for blocked requests) */
  walletAddress?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the oldest in-window request expires (only set when !allowed) */
  retryAfter?: number;
  /** How many requests remain in the current window (only set when allowed) */
  remaining?: number;
}

// ---------------------------------------------------------------------------
// Sliding-window rate limiter
// ---------------------------------------------------------------------------

/**
 * ip → sorted list of request timestamps within the current window.
 * Pruned lazily on each access; also evicted when MAX_TRACKED_IPS is exceeded.
 */
const ipWindows = new Map<string, number[]>();

/**
 * Check whether `ip` is within the rate limit.
 * Mutates the tracking map as a side-effect (records this hit if allowed).
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Lazy eviction of the oldest IP if we're at the cap
  if (!ipWindows.has(ip) && ipWindows.size >= MAX_TRACKED_IPS) {
    const oldestKey = ipWindows.keys().next().value;
    if (oldestKey !== undefined) ipWindows.delete(oldestKey);
  }

  // Get (or create) this IP's hit list and prune stale timestamps
  const hits = (ipWindows.get(ip) ?? []).filter((t) => t > windowStart);

  if (hits.length >= MAX_REQUESTS) {
    // Oldest hit determines how long until a slot opens up
    const retryAfter = Math.ceil((hits[0]! + WINDOW_MS - now) / 1000);
    ipWindows.set(ip, hits);
    return { allowed: false, retryAfter };
  }

  hits.push(now);
  ipWindows.set(ip, hits);
  return { allowed: true, remaining: MAX_REQUESTS - hits.length };
}

// Expose config so the admin route can include it in responses
export const rateLimiterConfig = {
  maxRequests: MAX_REQUESTS,
  windowMs: WINDOW_MS,
} as const;

// ---------------------------------------------------------------------------
// Request log
// ---------------------------------------------------------------------------

const requestLog: RequestLogEntry[] = [];

/**
 * Append an entry to the in-memory request log.
 * Evicts the oldest entry when the log is full (FIFO).
 */
export function recordRequest(
  entry: Omit<RequestLogEntry, "id" | "timestamp">
): string {
  const id = crypto.randomUUID();
  const newEntry: RequestLogEntry = { id, timestamp: Date.now(), ...entry };

  if (requestLog.length >= MAX_LOG_ENTRIES) {
    requestLog.shift(); // FIFO eviction
  }
  requestLog.push(newEntry);
  return id;
}

/**
 * Update the llmStatus of a previously recorded entry (by id).
 * Used by the route handler to flip "pending" → "streaming" | "done" | "error"
 * once the LLM stream outcome is known.
 */
export function updateRequestStatus(id: string, llmStatus: LLMStatus): void {
  const entry = requestLog.find((e) => e.id === id);
  if (entry) entry.llmStatus = llmStatus;
}

/**
 * Return a shallow copy of the log (newest-first) optionally limited to `limit` entries.
 */
export function getRequestLog(limit = 50): readonly RequestLogEntry[] {
  const start = Math.max(0, requestLog.length - limit);
  return requestLog.slice(start).reverse();
}

/** Total number of entries in the log (for reporting). */
export function getRequestLogCount(): number {
  return requestLog.length;
}
