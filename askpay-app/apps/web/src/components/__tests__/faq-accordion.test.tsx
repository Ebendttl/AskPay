import { describe, test, expect } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { FAQAccordion, type FAQItem } from "@/components/faq-accordion";

const mockItems: FAQItem[] = [
  {
    question: "What is AskPay?",
    answer: "AskPay is a pay-per-query AI dApp.",
  },
  {
    question: "How do I pay?",
    answer: "You can pay using USDm on Celo.",
  },
];

describe("FAQAccordion Component", () => {
  test("renders all questions", () => {
    render(<FAQAccordion items={mockItems} />);
    
    expect(screen.getByText("What is AskPay?")).toBeInTheDocument();
    expect(screen.getByText("How do I pay?")).toBeInTheDocument();
  });

  test("toggles answers on click", () => {
    render(<FAQAccordion items={mockItems} />);
    
    const firstQuestionBtn = screen.getByRole("button", { name: /What is AskPay\?/ });
    const secondQuestionBtn = screen.getByRole("button", { name: /How do I pay\?/ });

    // Initially all questions should be collapsed (aria-expanded="false")
    expect(firstQuestionBtn).toHaveAttribute("aria-expanded", "false");
    expect(secondQuestionBtn).toHaveAttribute("aria-expanded", "false");

    // Click the first question to expand
    fireEvent.click(firstQuestionBtn);
    expect(firstQuestionBtn).toHaveAttribute("aria-expanded", "true");
    expect(secondQuestionBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("AskPay is a pay-per-query AI dApp.")).toBeInTheDocument();

    // Click it again to collapse
    fireEvent.click(firstQuestionBtn);
    expect(firstQuestionBtn).toHaveAttribute("aria-expanded", "false");

    // Click the second question to expand
    fireEvent.click(secondQuestionBtn);
    expect(secondQuestionBtn).toHaveAttribute("aria-expanded", "true");
    expect(firstQuestionBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("You can pay using USDm on Celo.")).toBeInTheDocument();
  });
});
