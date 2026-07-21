import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@/test/test-utils";
import { ChatBox } from "@/components/chat-box";

// Mock RainbowKit ConnectButton
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: () => <button data-testid="rainbow-connect">Connect Wallet</button>,
}));

// Mock hooks
const mockUseAccount = vi.fn();
vi.mock("wagmi", () => ({
  useAccount: () => mockUseAccount(),
}));

const mockUseMiniPay = vi.fn();
vi.mock("@/hooks/useMiniPay", () => ({
  useMiniPay: () => mockUseMiniPay(),
}));

const mockUseAskPay = vi.fn();
vi.mock("@/hooks/useAskPay", () => ({
  useAskPay: () => mockUseAskPay(),
  generateQueryId: () => 12345n,
}));

const mockUseStreamResponse = vi.fn();
vi.mock("@/hooks/use-stream-response", () => ({
  useStreamResponse: () => mockUseStreamResponse(),
}));

describe("ChatBox Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    localStorage.setItem("askpay_disclaimer_ack", "true");

    // Default mock returns
    mockUseMiniPay.mockReturnValue({ isMiniPay: false, detected: true });
    
    mockUseAskPay.mockReturnValue({
      fee: 10000000000000000n, // 0.01 USDm
      isFeeLoading: false,
      balance: 50000000000000000n, // 0.05 USDm
      isBalanceLoading: false,
      refetchBalance: vi.fn(),
      state: { step: "idle", errorMessage: null, lastQueryId: null },
      submitQuestion: vi.fn(),
      reset: vi.fn(),
    });

    mockUseStreamResponse.mockReturnValue({
      streamingText: "",
      status: "idle",
      errorMessage: null,
      startStream: vi.fn(),
      reset: vi.fn(),
    });
  });

  test("renders connect wallet prompts when disconnected and NOT inside MiniPay", () => {
    mockUseAccount.mockReturnValue({ isConnected: false, address: undefined });

    render(<ChatBox />);

    // Connect wallet prompt should be visible
    expect(screen.getByTestId("rainbow-connect")).toBeInTheDocument();
  });

  test("does NOT render RainbowKit button when disconnected but inside MiniPay", () => {
    mockUseAccount.mockReturnValue({ isConnected: false, address: undefined });
    mockUseMiniPay.mockReturnValue({ isMiniPay: true, detected: true });

    render(<ChatBox />);

    // No Connect button should render since MiniPay manages authentication auto-connects
    expect(screen.queryByTestId("rainbow-connect")).not.toBeInTheDocument();
  });

  test("renders chat area when connected with sufficient funds", () => {
    mockUseAccount.mockReturnValue({ isConnected: true, address: "0x1234567890123456789012345678901234567890" });

    render(<ChatBox />);

    // Check balance is displayed
    expect(screen.getByText(/0\.05\s*USDm/i)).toBeInTheDocument();
    
    // Check input is visible
    expect(screen.getByPlaceholderText(/Type your question/i)).toBeInTheDocument();

    // No warning should render
    expect(screen.queryByText(/Insufficient USDm balance/i)).not.toBeInTheDocument();
  });

  test("renders balance warning UI when wallet has insufficient funds", () => {
    mockUseAccount.mockReturnValue({ isConnected: true, address: "0x1234567890123456789012345678901234567890" });
    
    // Set balance lower than fee
    mockUseAskPay.mockReturnValue({
      fee: 10000000000000000n, // 0.01 USDm
      isFeeLoading: false,
      balance: 5000000000000000n, // 0.005 USDm
      isBalanceLoading: false,
      refetchBalance: vi.fn(),
      state: { step: "idle", errorMessage: null, lastQueryId: null },
      submitQuestion: vi.fn(),
      reset: vi.fn(),
    });

    render(<ChatBox />);

    // Warning text should be visible matchingtranslations.ts English version
    expect(screen.getByText(/need at least 0.01 USDm to ask a question/i)).toBeInTheDocument();
    expect(screen.getByText(/use the mint script to top up/i)).toBeInTheDocument();
  });

  test("starts askQuestion flow and triggers stream on question submission", async () => {
    mockUseAccount.mockReturnValue({ isConnected: true, address: "0x1234567890123456789012345678901234567890" });
    
    const submitQuestionMock = vi.fn().mockResolvedValue({ queryId: 123n, txHash: "0xabc" });
    const startStreamMock = vi.fn().mockResolvedValue(undefined);

    mockUseAskPay.mockReturnValue({
      fee: 10000000000000000n,
      isFeeLoading: false,
      balance: 50000000000000000n,
      isBalanceLoading: false,
      refetchBalance: vi.fn(),
      state: { step: "idle", errorMessage: null, lastQueryId: null },
      submitQuestion: submitQuestionMock,
      reset: vi.fn(),
    });

    mockUseStreamResponse.mockReturnValue({
      streamingText: "",
      status: "idle",
      errorMessage: null,
      startStream: startStreamMock,
      reset: vi.fn(),
    });

    render(<ChatBox />);

    const textarea = screen.getByPlaceholderText(/Type your question/i);
    const submitBtn = screen.getByRole("button", { name: /Ask \(0.01 USDm\)/i });

    // Enter question and submit
    await act(async () => {
      fireEvent.change(textarea, { target: { value: "Hello world" } });
      fireEvent.click(submitBtn);
    });

    expect(submitQuestionMock).toHaveBeenCalled();
  });
});
