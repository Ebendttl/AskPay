import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import DashboardPage from "@/app/dashboard/page";

// Mock wagmi
const mockUseAccount = vi.fn();
vi.mock("wagmi", () => ({
  useAccount: () => mockUseAccount(),
}));

// Mock useAskPay
const mockUseAskPay = vi.fn();
vi.mock("@/hooks/useAskPay", () => ({
  useAskPay: () => mockUseAskPay(),
}));

describe("DashboardPage History Export", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();

    mockUseAccount.mockReturnValue({
      address: "0x1234567890123456789012345678901234567890",
      isConnected: true,
    });

    mockUseAskPay.mockReturnValue({
      fee: 10000000000000000n,
      isFeeLoading: false,
      balance: 50000000000000000n,
      isBalanceLoading: false,
    });
  });

  test("renders disconnected state when wallet is not connected", () => {
    mockUseAccount.mockReturnValue({ isConnected: false });
    render(<DashboardPage />);

    expect(
      screen.getByText(/Connect your wallet to see your personal usage dashboard/i)
    ).toBeInTheDocument();
  });

  test("renders export buttons when connected and history exists", () => {
    const mockHistory = [
      {
        queryId: "123",
        question: "What is Celo?",
        answer: "Celo is a carbon-negative layer 2 blockchain.",
        status: "answered",
        timestamp: Date.now(),
        txHash: "0xabcdef1234567890",
      },
    ];
    localStorage.setItem("askpay_history", JSON.stringify(mockHistory));

    render(<DashboardPage />);

    const jsonButtons = screen.getAllByRole("button", { name: /JSON/i });
    const csvButtons = screen.getAllByRole("button", { name: /CSV/i });

    expect(jsonButtons.length).toBeGreaterThan(0);
    expect(csvButtons.length).toBeGreaterThan(0);
  });

  test("triggers file download when JSON export button is clicked", () => {
    const mockHistory = [
      {
        queryId: "456",
        question: "How does MiniPay work?",
        answer: "MiniPay is built into Opera Mini.",
        status: "answered",
        timestamp: Date.now(),
      },
    ];
    localStorage.setItem("askpay_history", JSON.stringify(mockHistory));

    // Mock URL.createObjectURL, revokeObjectURL, and document.createElement
    const createObjectURLMock = vi.fn().mockReturnValue("blob:test");
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    render(<DashboardPage />);

    const jsonButtons = screen.getAllByRole("button", { name: /JSON/i });
    fireEvent.click(jsonButtons[0]);

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });
});
