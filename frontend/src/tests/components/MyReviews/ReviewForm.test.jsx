import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import ReviewForm from "main/components/MyReviews/ReviewForm";

describe("ReviewForm", () => {
  test("shows required error and does not submit when comments are empty", async () => {
    const submitAction = vi.fn();

    render(<ReviewForm initialItemName="Burger" submitAction={submitAction} />);

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByText("Comments are required")).toBeInTheDocument();
    });

    expect(submitAction).not.toHaveBeenCalled();
  });

  test("marks comments field invalid when submit is attempted without text", async () => {
    render(
      <ReviewForm initialItemName="Burger" submitAction={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/comments/i)).toHaveClass("is-invalid");
    });
  });
});
