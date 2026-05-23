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
    render(<ReviewForm initialItemName="Burger" submitAction={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/comments/i)).toHaveClass("is-invalid");
    });
  });

  test("uses empty date when initialContents has no dateItemServed", async () => {
    const submitAction = vi.fn();

    render(
      <ReviewForm
        initialItemName="Burger"
        submitAction={submitAction}
        initialContents={{
          reviewerComments: "Some comment",
          itemsStars: 4,
          dateItemServed: null,
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/comments/i)).toHaveValue("Some comment");
    });

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith({
        reviewerComments: "Some comment",
        itemsStars: 4,
        dateItemServed: "",
      });
    });
  });

  test("truncates dateItemServed from initialContents for datetime-local input", async () => {
    const submitAction = vi.fn();

    render(
      <ReviewForm
        initialItemName="Burger"
        submitAction={submitAction}
        initialContents={{
          reviewerComments: "Some comment",
          itemsStars: 4,
          dateItemServed: "2026-05-18T23:57:00.000Z",
        }}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText(/date and time item was served/i),
      ).toHaveValue("2026-05-18T23:57");
    });

    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith({
        reviewerComments: "Some comment",
        itemsStars: 4,
        dateItemServed: "2026-05-18T23:57",
      });
    });
  });
});
