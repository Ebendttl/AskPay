import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@/test/test-utils";
import { OnboardingModal } from "@/components/onboarding-modal";

const LS_KEY = "askpay_onboarding_seen";

describe("OnboardingModal Accessibility", () => {
  beforeEach(() => {
    localStorage.clear();
    // Clear any dialog from body
    const dialogs = document.querySelectorAll('div[role="dialog"]');
    dialogs.forEach((el) => el.remove());
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders when onboarding has not been seen", () => {
    render(<OnboardingModal isConnected={false} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("What is AskPay?")).toBeInTheDocument();
  });

  test("does not render when onboarding has already been seen", () => {
    localStorage.setItem(LS_KEY, "1");
    render(<OnboardingModal isConnected={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("closes dialog when clicking skip/close button", () => {
    render(<OnboardingModal isConnected={false} />);
    const skipBtn = screen.getByRole("button", { name: /skip onboarding/i });
    fireEvent.click(skipBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(LS_KEY)).toBe("1");
  });

  test("closes dialog when pressing Escape key", () => {
    render(<OnboardingModal isConnected={false} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(LS_KEY)).toBe("1");
  });

  test("traps keyboard focus when tabbing on the last element", async () => {
    render(<OnboardingModal isConnected={false} />);
    const dialog = screen.getByRole("dialog");
    
    const focusable = dialog.querySelectorAll('button, a, input');
    const firstElement = focusable[0] as HTMLElement;
    const lastElement = focusable[focusable.length - 1] as HTMLElement;

    // Focus last element
    lastElement.focus();
    expect(document.activeElement).toBe(lastElement);

    // Simulate tab keypress
    fireEvent.keyDown(window, { key: "Tab" });
    
    // It should wrap around to the first element
    expect(document.activeElement).toBe(firstElement);
  });

  test("traps keyboard focus when shift-tabbing on the first element", async () => {
    render(<OnboardingModal isConnected={false} />);
    const dialog = screen.getByRole("dialog");
    
    const focusable = dialog.querySelectorAll('button, a, input');
    const firstElement = focusable[0] as HTMLElement;
    const lastElement = focusable[focusable.length - 1] as HTMLElement;

    // Focus first element
    firstElement.focus();
    expect(document.activeElement).toBe(firstElement);

    // Simulate Shift+Tab keypress
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    
    // It should wrap around to the last element
    expect(document.activeElement).toBe(lastElement);
  });
});
