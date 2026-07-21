import { describe, test, expect, vi, beforeEach } from "vitest";

const mockGetBlockNumber = vi.fn();

vi.mock("viem", async () => {
  const actual = await vi.importActual<typeof import("viem")>("viem");
  return {
    ...actual,
    createPublicClient: () => ({
      getBlockNumber: mockGetBlockNumber,
    }),
  };
});

// Import route AFTER vi.mock
import { GET } from "../route";

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBlockNumber.mockResolvedValue(12345678n);
    delete process.env.LLM_API_KEY;
    process.env.LLM_API_PROVIDER = "gemini";
  });

  test("returns degraded status when LLM_API_KEY is not configured but RPC is ok", async () => {
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.status).toBe("degraded");
    expect(json.checks.rpc.status).toBe("ok");
    expect(json.checks.rpc.blockNumber).toBe(12345678);
    expect(json.checks.llm.status).toBe("error");
    expect(json.checks.llm.configured).toBe(false);
    expect(json).not.toHaveProperty("LLM_API_KEY");
  });

  test("returns ok status when RPC and LLM checks both pass", async () => {
    process.env.LLM_API_KEY = "test-api-key";

    // Mock fetch for Gemini models list
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe("ok");
    expect(json.checks.rpc.status).toBe("ok");
    expect(json.checks.llm.status).toBe("ok");
    expect(json.checks.llm.configured).toBe(true);
    expect(json.checks.llm.reachable).toBe(true);
    expect(json).not.toHaveProperty("LLM_API_KEY");
    expect(JSON.stringify(json)).not.toContain("test-api-key");
  });
});
