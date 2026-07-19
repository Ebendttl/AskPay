import { NextRequest } from "next/server";
import { getQuery } from "@/lib/query-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryId = searchParams.get("queryId");

  if (!queryId) {
    return new Response(JSON.stringify({ error: "Missing queryId parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stored = getQuery(queryId);

  if (!stored) {
    return new Response(JSON.stringify({ error: "Query not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(stored), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
