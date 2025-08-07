import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import InteractivePrompt from "@/app/components/InteractivePrompt";

describe("InteractivePrompt", () => {
  it("renders prompt and handles user input", () => {
    const mockOnSubmit = jest.fn();
    render(<InteractivePrompt onSubmit={mockOnSubmit} />);

    // Check initial prompt
    expect(screen.getByText("Ask your question:")).toBeInTheDocument();

    // Simulate user input
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "What is my future?" } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    // Verify callback
    expect(mockOnSubmit).toHaveBeenCalledWith("What is my future?");
  });
});
