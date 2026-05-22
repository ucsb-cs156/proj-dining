import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ReviewForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <ReviewForm />
      </Router>,
    );
    await screen.findByText(/Item Name/);
    await screen.findByText(/Submit Review/);
    expect(screen.getByText(/Item Name/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a Review", async () => {
    render(
      <Router>
        <ReviewForm
          initialItemName={ReviewFixtures.oneReview["item"]["name"]}
        />
      </Router>,
    );
    await screen.findByTestId(/ReviewForm-review-item-name/);
    expect(screen.getByText(/Item Name/)).toBeInTheDocument();
    expect(screen.getByTestId(/ReviewForm-review-item-name/)).toHaveValue(
      "Make Your Own Waffle (v)",
    );
  });

  test("Correct Error messages on missing input", async () => {
    const mockSubmitAction = vi.fn();
    render(
      <Router>
        <ReviewForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("ReviewForm-submit");
    const submitButton = screen.getByTestId("ReviewForm-submit");
    const reviewDateField = screen.getByTestId("ReviewForm-review-date");

    fireEvent.change(reviewDateField, { target: { value: "" } });
    fireEvent.click(submitButton);

    // HTML native validation will prevent missing date from going through (but no rendered msg)
    await waitFor(() => expect(mockSubmitAction).not.toHaveBeenCalled());
  });

  test("No Error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <ReviewForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("ReviewForm-review-item-name");

    const reviewItemField = screen.getByTestId("ReviewForm-review-item-name");
    const reviewCommentsField = screen.getByTestId(
      "ReviewForm-review-comments",
    );
    const reviewStarsField = screen.getByTestId("ReviewForm-review-stars");
    const reviewDateField = screen.getByTestId("ReviewForm-review-date");
    const submitButton = screen.getByTestId("ReviewForm-submit");

    fireEvent.change(reviewItemField, {
      target: { value: "Big Cheese" },
    });
    fireEvent.change(reviewCommentsField, {
      target: { value: "It's not too cheesy." },
    });
    fireEvent.change(reviewStarsField, {
      target: { value: 4 },
    });
    fireEvent.change(reviewDateField, {
      target: { value: "2022-01-02T12:00" },
    });

    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ReviewForm />
      </Router>,
    );
    await screen.findByTestId("ReviewForm-cancel");
    const cancelButton = screen.getByTestId("ReviewForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
