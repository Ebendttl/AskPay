import { describe, test, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { EmptyState } from "@/components/empty-state";
import { HelpCircle } from "lucide-react";

describe("EmptyState Component", () => {
  test("renders title and description", () => {
    render(<EmptyState title="No items found" description="Try adding some items to see them here." />);
    
    expect(screen.getByText("No items found")).toBeInTheDocument();
    expect(screen.getByText("Try adding some items to see them here.")).toBeInTheDocument();
  });

  test("renders custom icon when provided", () => {
    const { container } = render(
      <EmptyState 
        title="Help needed" 
        description="Please check back later." 
        Icon={HelpCircle} 
      />
    );
    
    // Check that we don't crash and the component renders.
    expect(screen.getByText("Help needed")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  test("renders call-to-action when provided", () => {
    render(
      <EmptyState 
        title="Empty" 
        description="Nothing here" 
        action={<button data-testid="cta-btn">Add Now</button>} 
      />
    );
    
    expect(screen.getByTestId("cta-btn")).toBeInTheDocument();
    expect(screen.getByText("Add Now")).toBeInTheDocument();
  });
});
