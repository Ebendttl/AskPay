/**
 * POST /api/feedback
 *
 * Accepts a thumbs-up / thumbs-down vote for a completed query, with an
 * optional free-text comment. Keyed by queryId. One submission per queryId.
 *
 * No new user identification is collected — walletAddress is already
 * supplied at payment time and is re-sent here as a consistency signal only.
 *
 * Request body (JSON):
 *   queryId      string   — required
 *   vote         "up"|"down" — required
 *   walletAddress string  — required (the paying wallet)
 *   comment      string   — optional, max 500 chars
 *
 * Responses:
 *   201  { ok: true }
 *   400  { error: string }   — validation failure
 *   409  { error: string }   — already voted for this queryId
 *   405  Method Not Allowed
 */

import { NextRequest, NextResponse } from "next/server";
import { saveFeedback, type FeedbackVote } from "@/lib/feedback-store";

export const dynamic = "force-dynamic";

const COMMENT_MAX_LENGTH = 500;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  const { queryId, vote, walletAddress, comment } = body as Record<string, unknown>;

  // ── Validate required fields ──────────────────────────────────────────────

  if (typeof queryId !== "string" || !queryId.trim()) {
    return NextResponse.json({ error: "queryId is required" }, { status: 400 });
  }

  if (vote !== "up" && vote !== "down") {
    return NextResponse.json({ error: "vote must be \"up\" or \"down\"" }, { status: 400 });
  }

  if (typeof walletAddress !== "string" || !walletAddress.trim()) {
    return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
  }

  // Basic wallet address sanity — must look like a hex address
  if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress.trim())) {
    return NextResponse.json({ error: "walletAddress must be a valid Ethereum address" }, { status: 400 });
  }

  // ── Validate optional comment ─────────────────────────────────────────────

  let cleanComment: string | undefined;
  if (comment !== undefined && comment !== null && comment !== "") {
    if (typeof comment !== "string") {
      return NextResponse.json({ error: "comment must be a string" }, { status: 400 });
    }
    const trimmed = comment.trim();
    if (trimmed.length > COMMENT_MAX_LENGTH) {
      return NextResponse.json(
        { error: `comment must be at most ${COMMENT_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (trimmed.length > 0) {
      cleanComment = trimmed;
    }
  }

  // ── Persist ───────────────────────────────────────────────────────────────

  const saved = saveFeedback({
    queryId: queryId.trim(),
    vote: vote as FeedbackVote,
    walletAddress: walletAddress.trim(),
    comment: cleanComment,
    timestamp: Date.now(),
  });

  if (!saved) {
    return NextResponse.json(
      { error: "Feedback already submitted for this query" },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
