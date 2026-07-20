/**
 * feedback-store.ts
 *
 * In-memory + JSON-file-backed store for per-query thumbs up/down feedback.
 *
 * Shape: { [queryId]: FeedbackEntry }
 *
 * Persistence pattern mirrors referral-store.ts — synchronous write-through
 * on every mutation, loaded into memory at module initialisation.
 *
 * Storage location: apps/web/src/lib/feedback-db.json  (gitignored)
 *
 * Intentionally no external DB dependency. If volume warrants it, swap the
 * JSON file for SQLite/Turso by changing only this module.
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FeedbackVote = "up" | "down";

export interface FeedbackEntry {
  queryId: string;
  vote: FeedbackVote;
  /** Optional free-text comment, max 500 chars */
  comment?: string;
  /** Lowercase wallet address — already collected at payment time */
  walletAddress: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const feedbackFile = path.join(process.cwd(), "src/lib/feedback-db.json");

let feedbackMap: Record<string, FeedbackEntry> = {};

// Load from disk at module initialisation
try {
  if (fs.existsSync(feedbackFile)) {
    const raw = fs.readFileSync(feedbackFile, "utf-8");
    feedbackMap = JSON.parse(raw);
  }
} catch (err) {
  console.error("[feedback-store] Failed to load feedback-db.json:", err);
}

function persistToDisk(): void {
  try {
    const dir = path.dirname(feedbackFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbackMap, null, 2), "utf-8");
  } catch (err) {
    console.error("[feedback-store] Failed to write feedback-db.json:", err);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Save feedback for a queryId.
 * Returns false if feedback for this queryId already exists (one vote per query).
 */
export function saveFeedback(entry: FeedbackEntry): boolean {
  if (feedbackMap[entry.queryId]) {
    return false; // already voted
  }
  feedbackMap[entry.queryId] = { ...entry, walletAddress: entry.walletAddress.toLowerCase() };
  persistToDisk();
  return true;
}

/**
 * Retrieve feedback for a single queryId (undefined if not yet rated).
 */
export function getFeedback(queryId: string): FeedbackEntry | undefined {
  return feedbackMap[queryId];
}

/**
 * Return all feedback entries sorted newest-first (for future admin reads).
 */
export function getAllFeedback(): FeedbackEntry[] {
  return Object.values(feedbackMap).sort((a, b) => b.timestamp - a.timestamp);
}
