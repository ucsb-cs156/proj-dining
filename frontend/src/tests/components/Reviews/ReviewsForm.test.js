import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ReviewsForm from "main/components/Reviews/ReviewsForm";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { BrowserRouter as Router } from "react-router";

const mockedNavigate = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockedNavigate,
}));

describe("ReviewsForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <ReviewsForm />
      </Router>,
    );
    await screen.findByText(/Create/);
  });

  test("renders correctly when passing in a review", async () => {
    render(
      <Router>
        <ReviewsForm initialContents={ReviewFixtures.oneReview} />
      </Router>,
    );
    await screen.findByTestId("ReviewsForm-id");
    expect(screen.getByTestId("ReviewsForm-itemsStars")).toHaveValue(5);
    expect(screen.getByTestId("ReviewsForm-dateReviewed")).toHaveValue(
      "2022-01-01T12:00",
    );
    expect(screen.getByTestId("ReviewsForm-reviewerComments")).toHaveValue(
      "Tasty and fresh!",
    );
  });

  test("Correct Error messages on missing input", async () => {
    render(
      <Router>
        <ReviewsForm />
      </Router>,
    );
    await screen.findByTestId("ReviewsForm-submit");
    const submitButton = screen.getByTestId("ReviewsForm-submit");
    fireEvent.click(submitButton);
    await screen.findByText(/Stars are required./);
    expect(screen.getByText(/Date Reviewed is required./)).toBeInTheDocument();
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = jest.fn();
    render(
      <Router>
        <ReviewsForm submitAction={mockSubmitAction} />
      </Router>,
    );
    fireEvent.change(screen.getByTestId("ReviewsForm-itemsStars"), {
      target: { value: 5 },
    });
    fireEvent.change(screen.getByTestId("ReviewsForm-dateReviewed"), {
      target: { value: "2022-01-01T12:00" },
    });
    fireEvent.change(screen.getByTestId("ReviewsForm-reviewerComments"), {
      target: { value: "Tasty and fresh!" },
    });
    fireEvent.click(screen.getByTestId("ReviewsForm-submit"));
    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });

  test("navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ReviewsForm />
      </Router>,
    );
    const cancelButton = screen.getByTestId("ReviewsForm-cancel");
    fireEvent.click(cancelButton);
    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("displays error when stars is below minimum", async () => {
    render(
      <Router>
        <ReviewsForm />
      </Router>,
    );

    fireEvent.change(screen.getByTestId("ReviewsForm-itemsStars"), {
      target: { value: 0 }, // below min
    });
    fireEvent.change(screen.getByTestId("ReviewsForm-dateReviewed"), {
      target: { value: "2023-12-12T15:00" },
    });
    fireEvent.change(screen.getByTestId("ReviewsForm-reviewerComments"), {
      target: { value: "Too low" },
    });

    fireEvent.click(screen.getByTestId("ReviewsForm-submit"));

    await screen.findByText(/Stars must be at least 1./);
    expect(screen.getByText(/Stars must be at least 1./)).toBeInTheDocument();
  });

  test("displays error when stars is above maximum", async () => {
    render(
      <Router>
        <ReviewsForm />
      </Router>,
    );

    fireEvent.change(screen.getByTestId("ReviewsForm-itemsStars"), {
      target: { value: 6 }, // above max
    });
    fireEvent.change(screen.getByTestId("ReviewsForm-dateReviewed"), {
      target: { value: "2023-12-12T15:00" },
    });
    fireEvent.change(screen.getByTestId("ReviewsForm-reviewerComments"), {
      target: { value: "Too high" },
    });

    fireEvent.click(screen.getByTestId("ReviewsForm-submit"));

    await screen.findByText(/Stars must be at most 5./);
    expect(screen.getByText(/Stars must be at most 5./)).toBeInTheDocument();
  });

  test("renders itemName field when initialContents.itemName is present", () => {
    render(
      <Router>
        <ReviewsForm
          initialContents={{
            itemName: "Test Product",
            itemsStars: 3,
            dateReviewed: "2023-12-12T15:00",
            reviewerComments: "Looks good.",
          }}
        />
      </Router>,
    );

    // Check that the itemName input is rendered and has the correct value
    const itemNameInput = screen.getByTestId("ReviewsForm-itemName");
    expect(itemNameInput).toBeInTheDocument();
    expect(itemNameInput).toHaveValue("Test Product");
  });

  test("does not render itemName field when initialContents.itemName is missing", () => {
    render(
      <Router>
        <ReviewsForm
          initialContents={{
            itemsStars: 4,
            dateReviewed: "2023-12-12T15:00",
            reviewerComments: "All good.",
          }}
        />
      </Router>,
    );

    // The itemName input should not exist
    expect(
      screen.queryByTestId("ReviewsForm-itemName"),
    ).not.toBeInTheDocument();
  });
});
