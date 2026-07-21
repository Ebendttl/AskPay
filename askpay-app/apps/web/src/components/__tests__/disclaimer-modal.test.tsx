import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { DisclaimerModal, DISCLAIMER_LS_KEY } from "@/components/disclaimer-modal";

describe("DisclaimerModal Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  test("does not render when isOpen is false", () => {
    render(<DisclaimerModal isOpen={false} onAccept={vi.fn()} />);

    expect(screen.queryByText(/AI & Legal Disclaimer/i)).not.toBeInTheDocument();
  });

  test("renders disclaimer title and body when isOpen is true", () => {
    render(<DisclaimerModal isOpen={true} onAccept={vi.fn()} />);

    expect(screen.getByText(/AI & Legal Disclaimer/i)).toBeInTheDocument();
    expect(
      screen.getByText(/AskPay provides AI-generated responses for informational purposes only/i)
    ).toBeInTheDocument();
  });

  test("saves acknowledgment to localStorage and calls onAccept when agreed", () => {
    const onAcceptMock = vi.fn();
    render(<DisclaimerModal isOpen={true} onAccept={onAcceptMock} />);

    const agreeButton = screen.getByRole("button", { name: /I Understand & Agree/i });
    fireEvent.click(agreeButton);

    expect(localStorage.getItem(DISCLAIMER_LS_KEY)).toBe("true");
    expect(onAcceptMock).toHaveBeenCalledTimes(1);
  });
});
