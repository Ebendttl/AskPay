/**
 * useStreamResponse
 *
 * Thin streaming hook for AskPay.
 *
 * Responsibilities:
 *  - POST to /api/ask with Accept: text/event-stream
 *  - Read the SSE response body via ReadableStream / getReader()
 *  - Parse `data: {"token":"…"}` frames and accumulate into `streamingText`
 *  - Handle `event: error` frames → surface as status="error"
 *  - Handle `data: [DONE]` → status="done"
 *  - Handle network/fetch failures → status="error"
 *
 * Retry logic lives in the server route — this hook stays thin.
 * No wagmi/viem imports.
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { ACTIVE_NETWORK } from "@/lib/contracts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StreamStatus = "idle" | "streaming" | "done" | "error";

export interface StreamParams {
  question: string;
  queryId: string;
  txHash: `0x${string}`;
  network?: "sepolia" | "mainnet";
}

export interface UseStreamResponseReturn {
  /** Accumulated text received so far */
  streamingText: string;
  status: StreamStatus;
  errorMessage: string | null;
  /**
   * Begin streaming the LLM response for a verified payment.
   * Resolves when the stream is fully consumed (done or error).
   */
  startStream: (params: StreamParams) => Promise<void>;
  /** Reset back to idle (e.g. for a new question) */
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useStreamResponse(): UseStreamResponseReturn {
  const [streamingText, setStreamingText] = useState("");
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Keep a ref to the active reader so we can cancel on unmount if needed
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  const reset = useCallback(() => {
    // Attempt to cancel any in-flight stream
    readerRef.current?.cancel().catch(() => {});
    readerRef.current = null;
    setStreamingText("");
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const startStream = useCallback(
    async (params: StreamParams): Promise<void> => {
      // Cancel any previous in-flight stream
      readerRef.current?.cancel().catch(() => {});
      readerRef.current = null;

      setStreamingText("");
      setStatus("streaming");
      setErrorMessage(null);

      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            question: params.question,
            queryId: params.queryId,
            txHash: params.txHash,
            network: params.network ?? ACTIVE_NETWORK,
          }),
        });

        // Non-streaming error responses from the route (e.g. 400 validation, 500)
        if (!res.ok) {
          let errMsg = `Server error ${res.status}`;
          try {
            const errJson = await res.json();
            errMsg = errJson.error ?? errMsg;
          } catch {
            /* ignore parse errors */
          }
          setStatus("error");
          setErrorMessage(errMsg);
          return;
        }

        if (!res.body) {
          setStatus("error");
          setErrorMessage("No response body received from server.");
          return;
        }

        reader = res.body.getReader();
        readerRef.current = reader;

        const decoder = new TextDecoder();
        let buffer = "";
        // Tracks whether the current SSE block is an error event
        let isErrorEvent = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          // SSE spec: messages are separated by double newline
          const rawMessages = buffer.split("\n\n");
          // Keep the last (possibly incomplete) block in the buffer
          buffer = rawMessages.pop() ?? "";

          for (const message of rawMessages) {
            if (!message.trim()) continue;

            const lines = message.split("\n");
            isErrorEvent = false;

            for (const line of lines) {
              if (line.startsWith("event:")) {
                const eventType = line.slice(6).trim();
                if (eventType === "error") isErrorEvent = true;
              } else if (line.startsWith("data:")) {
                const data = line.slice(5).trim();

                if (data === "[DONE]") {
                  setStatus("done");
                  return;
                }

                if (isErrorEvent) {
                  // Error frame: data: {"message":"…"}
                  try {
                    const parsed = JSON.parse(data) as { message?: string };
                    setStatus("error");
                    setErrorMessage(parsed.message ?? "AI response failed.");
                  } catch {
                    setStatus("error");
                    setErrorMessage("AI response failed.");
                  }
                  return;
                }

                // Normal token frame: data: {"token":"…"}
                try {
                  const parsed = JSON.parse(data) as { token?: string };
                  if (parsed.token) {
                    setStreamingText((prev) => prev + parsed.token);
                  }
                } catch {
                  // Ignore malformed frames
                }
              }
            }
          }
        }

        // Stream ended without a [DONE] frame — treat as done
        setStatus("done");
      } catch (err: any) {
        const msg =
          err?.name === "AbortError"
            ? "Stream cancelled."
            : err?.message ?? "Network error — failed to fetch AI response.";
        setStatus("error");
        setErrorMessage(msg);
      } finally {
        if (reader) {
          try {
            reader.releaseLock();
          } catch {
            /* already released */
          }
        }
        readerRef.current = null;
      }
    },
    [] // no external deps — ACTIVE_NETWORK is a module-level constant
  );

  return { streamingText, status, errorMessage, startStream, reset };
}
