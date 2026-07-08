import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseEventLogs } from "viem";
import { celo, celoSepolia } from "viem/chains";
import {
  PAY_PER_QUERY_ABI,
  PAYPERQUERY_ADDRESS_SEPOLIA,
} from "@/lib/contracts";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

// Celo Sepolia and Celo Mainnet RPCs
const SEPOLIA_RPC = "https://forno.celo-sepolia.celo-testnet.org";
const MAINNET_RPC = "https://forno.celo.org";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AskRequest {
  question: string;
  queryId: string; // string representation of the BigInt queryId
  txHash: `0x${string}`;
  network?: "sepolia" | "mainnet";
}

// ---------------------------------------------------------------------------
// LLM Integration
// ---------------------------------------------------------------------------

async function getLLMResponse(question: string): Promise<string> {
  const provider = process.env.LLM_API_PROVIDER?.toLowerCase() || "";
  const apiKey = process.env.LLM_API_KEY || "";

  if (!apiKey) {
    console.warn("[AskPay API] LLM_API_KEY is not configured. Running in Mock/Demo mode.");
    return `[Demo Mode] Payment verified successfully! Your question was: "${question}". Since the LLM API key is not configured in .env.local on the server, here is a mock response. Please add LLM_API_KEY and LLM_API_PROVIDER (gemini/groq) to your environment variables to get real AI answers.`;
  }

  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response from Gemini API");
      return text;
    } catch (err) {
      console.error("[AskPay API] Gemini LLM Call failed:", err);
      throw new Error("Failed to retrieve response from Gemini API");
    }
  } else if (provider === "groq") {
    const url = "https://api.groq.com/openai/v1/chat/completions";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: question }],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Groq API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error("Empty response from Groq API");
      return text;
    } catch (err) {
      console.error("[AskPay API] Groq LLM Call failed:", err);
      throw new Error("Failed to retrieve response from Groq API");
    }
  } else {
    // If provider is not recognized but key is present, fallback
    return `[Config Error] LLM_API_PROVIDER is set to "${provider}", which is unrecognized. Supported values are "gemini" or "groq".`;
  }
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body: AskRequest = await req.json();
    const { question, queryId, txHash, network = "sepolia" } = body;

    // Validate inputs
    if (!question || !question.trim()) {
      return NextResponse.json({ error: "Missing or empty question" }, { status: 400 });
    }
    if (!queryId) {
      return NextResponse.json({ error: "Missing queryId" }, { status: 400 });
    }
    if (!txHash || !txHash.startsWith("0x") || txHash.length !== 66) {
      return NextResponse.json({ error: "Invalid transaction hash format" }, { status: 400 });
    }

    // Determine target chain & config based on the network requested
    const isMainnet = network === "mainnet";
    const chain = isMainnet ? celo : celoSepolia;
    const rpcUrl = isMainnet ? MAINNET_RPC : SEPOLIA_RPC;

    const contractAddress = isMainnet
      ? (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET as `0x${string}`)
      : PAYPERQUERY_ADDRESS_SEPOLIA;

    if (!contractAddress || contractAddress === "0x") {
      return NextResponse.json(
        { error: `Contract address for network "${network}" is not configured on the server` },
        { status: 500 }
      );
    }

    console.log(`[AskPay API] Verifying payment on ${network}...`, {
      txHash,
      queryId,
      contractAddress,
    });

    // Initialize Viem Client
    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // 1. Fetch transaction receipt on-chain
    let receipt;
    try {
      receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    } catch (err) {
      console.error("[AskPay API] Failed to fetch transaction receipt:", err);
      return NextResponse.json(
        { error: "Transaction receipt not found. Make sure the transaction is confirmed." },
        { status: 400 }
      );
    }

    // 2. Verify status
    if (receipt.status !== "success") {
      return NextResponse.json(
        { error: `Transaction failed on-chain with status: ${receipt.status}` },
        { status: 400 }
      );
    }

    // 3. Verify recipient address
    const toAddress = receipt.to?.toLowerCase();
    if (toAddress !== contractAddress.toLowerCase()) {
      return NextResponse.json(
        { error: `Transaction recipient mismatch. Expected contract: ${contractAddress}, got: ${receipt.to}` },
        { status: 400 }
      );
    }

    // 4. Verify QueryPaid event log
    const logs = parseEventLogs({
      abi: PAY_PER_QUERY_ABI,
      eventName: "QueryPaid",
      logs: receipt.logs,
    });

    if (logs.length === 0) {
      return NextResponse.json(
        { error: "QueryPaid event not found in transaction logs" },
        { status: 400 }
      );
    }

    // Check queryId match (using BigInt comparison since queryId on chain is uint256)
    const targetQueryId = BigInt(queryId);
    const matchingLog = logs.find((log) => {
      // log.args.queryId is type bigint
      return log.args.queryId === targetQueryId;
    });

    if (!matchingLog) {
      return NextResponse.json(
        { error: `QueryPaid event found, but queryId mismatch. Expected: ${queryId}` },
        { status: 400 }
      );
    }

    console.log("[AskPay API] Payment verified successfully!");

    // 5. Call LLM
    const answer = await getLLMResponse(question);

    return NextResponse.json({
      success: true,
      answer,
      queryId,
      txHash,
    });
  } catch (err: any) {
    console.error("[AskPay API] Internal Server Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
