import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { findSimilarHistoryItem, type HistoryItem } from "@/components/chat-box";

describe("findSimilarHistoryItem Helper", () => {
  const mockHistory: HistoryItem[] = [
    {
      queryId: "q1",
      question: "What is Celo blockchain and how does it work?",
      answer: "Celo is an EVM-compatible Layer 2 blockchain.",
      status: "answered",
      timestamp: Date.now() - 10 * 60 * 1000, // 10 mins ago
    },
    {
      queryId: "q2",
      question: "How to deploy smart contracts on Celo?",
      answer: "You can use Hardhat or Foundry to deploy.",
      status: "answered",
      timestamp: Date.now() - 60 * 60 * 1000, // 60 mins ago
    },
  ];

  test("returns null when current question is too short", () => {
    expect(findSimilarHistoryItem("hi", mockHistory)).toBeNull();
  });

  test("returns match on exact identical question string", () => {
    const result = findSimilarHistoryItem("What is Celo blockchain and how does it work?", mockHistory);
    expect(result).not.toBeNull();
    expect(result?.queryId).toBe("q1");
  });

  test("returns match on near-identical question string (case/punctuation variants)", () => {
    const result = findSimilarHistoryItem("what IS celo blockchain and how DOES it work???", mockHistory);
    expect(result).not.toBeNull();
    expect(result?.queryId).toBe("q1");
  });

  test("returns match on high token similarity overlap", () => {
    const result = findSimilarHistoryItem("What is Celo blockchain how it works", mockHistory);
    expect(result).not.toBeNull();
    expect(result?.queryId).toBe("q1");
  });

  test("returns null when no questions are similar", () => {
    const result = findSimilarHistoryItem("What is the recipe for chocolate cake?", mockHistory);
    expect(result).toBeNull();
  });
});
