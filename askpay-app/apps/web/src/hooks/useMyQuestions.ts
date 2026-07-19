"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import {
  PAYPERQUERY_ADDRESS,
  ACTIVE_CHAIN,
  DEPLOY_BLOCK,
} from "@/lib/contracts";

export interface QueryPaidEventLog {
  payer: `0x${string}`;
  amount: bigint;
  queryId: bigint;
  timestamp: bigint;
  transactionHash: `0x${string}`;
}

export interface UseMyQuestionsReturn {
  events: QueryPaidEventLog[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const queryPaidEventAbiItem = parseAbiItem(
  "event QueryPaid(address indexed payer, uint256 amount, uint256 indexed queryId, uint256 timestamp)"
);

export function useMyQuestions(): UseMyQuestionsReturn {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: ACTIVE_CHAIN.id });

  const [events, setEvents] = useState<QueryPaidEventLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    // If not connected or no wallet address or no public client, clear events and stop
    if (!isConnected || !address || !publicClient) {
      setEvents([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const logs = await publicClient.getLogs({
        address: PAYPERQUERY_ADDRESS,
        event: queryPaidEventAbiItem,
        args: {
          payer: address,
        },
        fromBlock: DEPLOY_BLOCK,
      });

      const formattedEvents: QueryPaidEventLog[] = logs
        .map((log) => {
          const { payer, amount, queryId, timestamp } = log.args || {};
          return {
            payer: payer || "0x",
            amount: amount || 0n,
            queryId: queryId || 0n,
            timestamp: timestamp || 0n,
            transactionHash: log.transactionHash || "0x",
          };
        })
        // Sort by timestamp desc (newest first)
        .sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));

      setEvents(formattedEvents);
    } catch (err: any) {
      console.error("[useMyQuestions] Error fetching QueryPaid logs:", err);
      setError(err.message || "Failed to fetch event logs.");
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, publicClient]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}
