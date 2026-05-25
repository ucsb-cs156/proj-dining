import { fireEvent, render, screen } from "@testing-library/react";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { vi } from "vitest";

describe("ReviewForm tests", () => {
  test("renders provided initial values and trims datetime-local seconds", () => {
    render(
      <ReviewForm
        initialItemName="Pasta"
        initialComments="Great texture"
        initialStars={4}
        initialDateServed="2024-04-01T12:34:56"
        submitAction={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Item Name")).toHaveValue("Pasta");
    expect(screen.getByLabelText("Item Name")).toBeDisabled();
    expect(screen.getByLabelText("Comments")).toHaveValue("Great texture");
    expect(screen.getByLabelText("Stars (1 to 5)")).toHaveValue("4");
    expect(screen.getByLabelText("Date and Time Item was Served")).toHaveValue(
      "2024-04-01T12:34",
    );
  });

  test("updates form state when initial values change", () => {
    const submitAction = vi.fn();
    const { rerender } = render(
      <ReviewForm
        initialItemName="Pasta"
        initialComments="First comment"
        initialStars={2}
        initialDateServed="2024-04-01T12:34:56"
        submitAction={submitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText("Comments"), {
      target: { value: "Locally edited comment" },
    });
    fireEvent.change(screen.getByLabelText("Stars (1 to 5)"), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText("Date and Time Item was Served"), {
      target: { value: "2024-04-03T16:20" },
    });

    rerender(
      <ReviewForm
        initialItemName="Pasta"
        initialComments="Updated from backend"
        initialStars={5}
        initialDateServed="2024-04-02T13:45:59"
        submitAction={submitAction}
      />,
    );

    expect(screen.getByLabelText("Comments")).toHaveValue(
      "Updated from backend",
    );
    expect(screen.getByLabelText("Stars (1 to 5)")).toHaveValue("5");
    expect(screen.getByLabelText("Date and Time Item was Served")).toHaveValue(
      "2024-04-02T13:45",
    );
  });

  test("does not overwrite the current date when no new initial date is provided", () => {
    const submitAction = vi.fn();
    const { rerender } = render(
      <ReviewForm
        initialItemName="Pasta"
        initialComments="First comment"
        initialStars={2}
        initialDateServed="2024-04-01T12:34:56"
        submitAction={submitAction}
      />,
    );

    fireEvent.change(screen.getByLabelText("Date and Time Item was Served"), {
      target: { value: "2024-04-03T16:20" },
    });

    rerender(
      <ReviewForm
        initialItemName="Pasta"
        initialComments="Updated from backend"
        initialStars={5}
        submitAction={submitAction}
      />,
    );

    expect(screen.getByLabelText("Comments")).toHaveValue(
      "Updated from backend",
    );
    expect(screen.getByLabelText("Stars (1 to 5)")).toHaveValue("5");
    expect(screen.getByLabelText("Date and Time Item was Served")).toHaveValue(
      "2024-04-03T16:20",
    );
  });
});
