"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import {
  PAYPERQUERY_ADDRESS,
  USDM_ADDRESS,
  PAY_PER_QUERY_ABI,
  ERC20_ABI,
  ACTIVE_CHAIN,
  DEPLOY_BLOCK,
  getLogsInChunks,
} from "@/lib/contracts";

export interface QueryPaidEventLog {
  payer: `0x${string}`;
  amount: bigint;
  queryId: bigint;
  timestamp: bigint;
  transactionHash: `0x${string}`;
}

export interface UseAdminStatsReturn {
  contractOwner: `0x${string}` | undefined;
  isOwnerLoading: boolean;
  currentFee: bigint | undefined;
  isFeeLoading: boolean;
  contractUSDmBalance: bigint | undefined;
  isBalanceLoading: boolean;
  totalQueriesPaid: number;
  totalRevenue: bigint;
  recentEvents: QueryPaidEventLog[];
  isEventsLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const queryPaidEventAbiItem = parseAbiItem(
  "event QueryPaid(address indexed payer, uint256 amount, uint256 indexed queryId, uint256 timestamp)"
);

export function useAdminStats(): UseAdminStatsReturn {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: ACTIVE_CHAIN.id });

  const [recentEvents, setRecentEvents] = useState<QueryPaidEventLog[]>([]);
  const [totalQueriesPaid, setTotalQueriesPaid] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<bigint>(0n);
  const [isEventsLoading, setIsEventsLoading] = useState<boolean>(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // 1. Read owner from contract
  const {
    data: contractOwner,
    isLoading: isOwnerLoading,
    refetch: refetchOwner,
  } = useReadContract({
    address: PAYPERQUERY_ADDRESS,
    abi: PAY_PER_QUERY_ABI,
    functionName: "owner",
    chainId: ACTIVE_CHAIN.id,
  });

  // 2. Read current query fee
  const {
    data: currentFee,
    isLoading: isFeeLoading,
    refetch: refetchFee,
  } = useReadContract({
    address: PAYPERQUERY_ADDRESS,
    abi: PAY_PER_QUERY_ABI,
    functionName: "fee",
    chainId: ACTIVE_CHAIN.id,
  });

  // 3. Read contract USDm balance
  const {
    data: contractUSDmBalance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: USDM_ADDRESS,
    abi: ERC20_ABI,
    args: [PAYPERQUERY_ADDRESS],
    functionName: "balanceOf",
    chainId: ACTIVE_CHAIN.id,
  });

  // 4. Read events via getLogs
  const fetchEvents = useCallback(async () => {
    if (!publicClient) return;
    setIsEventsLoading(true);
    setEventsError(null);

    try {
      const logs = await getLogsInChunks(publicClient, {
        address: PAYPERQUERY_ADDRESS,
        event: queryPaidEventAbiItem,
        fromBlock: DEPLOY_BLOCK,
        toBlock: "latest",
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

      const totalAmount = formattedEvents.reduce((acc, e) => acc + e.amount, 0n);

      setRecentEvents(formattedEvents);
      setTotalQueriesPaid(formattedEvents.length);
      setTotalRevenue(totalAmount);
    } catch (err: any) {
      console.error("[useAdminStats] Error fetching QueryPaid logs:", err);
      setEventsError(err.message || "Failed to fetch event logs.");
    } finally {
      setIsEventsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refetch = useCallback(() => {
    refetchOwner();
    refetchFee();
    refetchBalance();
    fetchEvents();
  }, [refetchOwner, refetchFee, refetchBalance, fetchEvents]);

  return {
    contractOwner,
    isOwnerLoading,
    currentFee,
    isFeeLoading,
    contractUSDmBalance,
    isBalanceLoading,
    totalQueriesPaid,
    totalRevenue,
    recentEvents,
    isEventsLoading,
    error: eventsError,
    refetch,
  };
}
