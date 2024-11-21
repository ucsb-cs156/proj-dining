import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ReviewForm from "main/components/Review/ReviewForm";
import { reviewFixtures } from "fixtures/reviewFixtures";
import { BrowserRouter as Router } from "react-router-dom";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("ReviewForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <ReviewForm />
      </Router>
    );
    await screen.findByText(/Item ID/);
    await screen.findByText(/Create/);
  });

  test("renders correctly when passing in a Review", async () => {
    render(
      <Router>
        <ReviewForm initialContents={reviewFixtures.oneReview} />
      </Router>
    );
    await screen.findByTestId(/ReviewForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/ReviewForm-id/)).toHaveValue("1");
  });

  test("Correct Error messages on bad input", async () => {
    render(
      <Router>
        <ReviewForm />
      </Router>
    );

    await screen.findByTestId("ReviewForm-itemId");
    const itemIdField = screen.getByTestId("ReviewForm-itemId");
    const studentIdField = screen.getByTestId("ReviewForm-studentId");
    const dateItemServedField = screen.getByTestId("ReviewForm-dateItemServed");
    const submitButton = screen.getByTestId("ReviewForm-submit");

    fireEvent.change(itemIdField, { target: { value: "bad-input" } });
    fireEvent.change(studentIdField, { target: { value: "bad-input" } });
    fireEvent.change(dateItemServedField, { target: { value: "bad-input" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Item ID must be an integer, e.g. 1 for item #1/);
    await screen.findByText(/Student ID must be an integer/);
    await screen.findByText(/Date Item Served is required/);
  });

  test("Correct Error messages on missing input", async () => {
    render(
      <Router>
        <ReviewForm />
      </Router>
    );
    const submitButton = screen.getByTestId("ReviewForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Item ID is required/);
    expect(screen.getByText(/Student ID is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Item Served is required/)).toBeInTheDocument();
  });

  test("No Error messages on good input", async () => {
    const mockSubmitAction = jest.fn();

    render(
      <Router>
        <ReviewForm submitAction={mockSubmitAction} />
      </Router>
    );

    const itemIdField = screen.getByTestId("ReviewForm-itemId");
    const studentIdField = screen.getByTestId("ReviewForm-studentId");
    const dateItemServedField = screen.getByTestId("ReviewForm-dateItemServed");
    const submitButton = screen.getByTestId("ReviewForm-submit");

    fireEvent.change(itemIdField, { target: { value: "9" } });
    fireEvent.change(studentIdField, { target: { value: "12345" } });
    fireEvent.change(dateItemServedField, {
      target: { value: "2022-01-02T12:00:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Item ID must be an integer, e.g. 1 for item #1/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Student ID is required/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Date Item Served is required/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ReviewForm />
      </Router>
    );
    const cancelButton = screen.getByTestId("ReviewForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
