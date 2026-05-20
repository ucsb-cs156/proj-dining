import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ReviewForm from "main/components/MyReviews/ReviewForm";

describe("ReviewForm tests", () => {
  test("renders seeded values, all star options, and submits the current form values", () => {
    const submitAction = vi.fn();

    render(
      <ReviewForm
        initialItemName="Item A"
        initialReviewerComments="great"
        initialItemsStars={4}
        initialDateItemServed="2024-05-01T10:30:00"
        submitAction={submitAction}
      />,
    );

    expect(screen.getByLabelText(/item name/i)).toHaveValue("Item A");
    expect(screen.getByLabelText(/comments/i)).toHaveValue("great");
    expect(screen.getByLabelText(/stars/i)).toHaveValue("4");
    expect(screen.getByLabelText(/date and time/i)).toHaveValue(
      "2024-05-01T10:30",
    );
    expect(screen.getByLabelText(/item name/i)).toBeDisabled();

    const starOptions = screen
      .getByLabelText(/stars/i)
      .querySelectorAll("option");
    expect(starOptions).toHaveLength(5);

    fireEvent.change(screen.getByLabelText(/comments/i), {
      target: { value: "updated" },
    });
    fireEvent.change(screen.getByLabelText(/stars/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "2024-05-02T11:15" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(submitAction).toHaveBeenCalledWith({
      reviewerComments: "updated",
      itemsStars: 2,
      dateItemServed: "2024-05-02T11:15",
    });
  });

  test("updates seeded form values when props change", () => {
    const submitAction = vi.fn();

    const { rerender } = render(
      <ReviewForm
        initialItemName="Item A"
        initialReviewerComments="great"
        initialItemsStars={4}
        initialDateItemServed="2024-05-01T10:30:00"
        submitAction={submitAction}
      />,
    );

    rerender(
      <ReviewForm
        initialItemName="Item A"
        initialReviewerComments="even better"
        initialItemsStars={1}
        initialDateItemServed="2024-05-03T08:45:00"
        submitAction={submitAction}
      />,
    );

    expect(screen.getByLabelText(/comments/i)).toHaveValue("even better");
    expect(screen.getByLabelText(/stars/i)).toHaveValue("1");
    expect(screen.getByLabelText(/date and time/i)).toHaveValue(
      "2024-05-03T08:45",
    );
  });
});
