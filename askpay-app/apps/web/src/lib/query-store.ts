/**
 * query-store.ts
 *
 * In-memory store for tracking queries, their transaction hashes, questions,
 * status, and generated answers. Used to provide backend resilience:
 * if the initial LLM call fails, the query is retried in the background,
 * and the user can poll or query the status later by queryId.
 *
 * Capped to avoid memory leaks (FIFO eviction).
 */

export type QueryStatus = "pending" | "streaming" | "answered" | "failed" | "retrying";

export interface StoredQuery {
  queryId: string;
  txHash: string;
  question: string;
  status: QueryStatus;
  answer?: string;
  errorMessage?: string;
  timestamp: number;
}

const MAX_STORED_QUERIES = 2000;
const queries = new Map<string, StoredQuery>();
const queryIdQueue: string[] = [];

/**
 * Save or update a query in the store.
 * If query already exists, updates it. Otherwise, creates it and enforces FIFO cap.
 */
export function saveQuery(
  queryId: string,
  data: Omit<StoredQuery, "queryId" | "timestamp"> & { timestamp?: number }
): StoredQuery {
  const existing = queries.get(queryId);
  const timestamp = data.timestamp ?? existing?.timestamp ?? Date.now();

  const newEntry: StoredQuery = {
    queryId,
    timestamp,
    ...data,
  };

  queries.set(queryId, newEntry);

  if (!existing) {
    queryIdQueue.push(queryId);
    // Enforce FIFO cap
    if (queryIdQueue.length > MAX_STORED_QUERIES) {
      const oldestId = queryIdQueue.shift();
      if (oldestId) {
        queries.delete(oldestId);
      }
    }
  }

  return newEntry;
}

/**
 * Retrieve a query from the store by queryId.
 */
export function getQuery(queryId: string): StoredQuery | undefined {
  return queries.get(queryId);
}

/**
 * Update specific fields of a query.
 */
export function updateQuery(queryId: string, fields: Partial<Omit<StoredQuery, "queryId">>): boolean {
  const existing = queries.get(queryId);
  if (!existing) return false;

  const updated = {
    ...existing,
    ...fields,
  };
  queries.set(queryId, updated);
  return true;
}

/**
 * Return all stored queries (useful for debugging/telemetry).
 */
export function getAllQueries(): StoredQuery[] {
  return Array.from(queries.values()).sort((a, b) => b.timestamp - a.timestamp);
}
