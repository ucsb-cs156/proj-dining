import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ReviewForm from "main/components/MenuItemReviews/ReviewForm";

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
    useParams: jest.fn(),
  };
});

const renderWithProviders = (ui) => {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <Router>{ui}</Router>
    </QueryClientProvider>,
  );
};

describe("ReviewForm: full branch coverage including Cancel", () => {
  let submitAction;
  let navigateMock;

  beforeEach(() => {
    submitAction = jest.fn();
    navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);
    useLocation.mockReturnValue({ state: { from: "/ignored" } });
    useParams.mockReturnValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("hides the Menu Item ID input when hideItemId=true", () => {
    renderWithProviders(
      <ReviewForm
        initialContents={{}}
        submitAction={submitAction}
        hideItemId={true}
      />,
    );
    expect(screen.queryByLabelText(/Menu Item ID/i)).toBeNull();
  });

  it("renders a disabled id field when initialContents.id is provided", () => {
    renderWithProviders(
      <ReviewForm
        initialContents={{ id: "ABC123" }}
        submitAction={submitAction}
      />,
    );
    const idInput = screen.getByDisplayValue("ABC123");
    expect(idInput).toBeDisabled();
  });

  it("shows 'required' errors and prevents submit when fields empty", async () => {
    renderWithProviders(
      <ReviewForm hideItemId={false} submitAction={submitAction} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(await screen.findByText(/Menu item ID is required/)).toBeVisible();
    expect(screen.getByText(/Stars is required/)).toBeVisible();
    expect(submitAction).not.toHaveBeenCalled();
  });

  it("validates itemId: non-integer, zero, negative => positive-integer error", async () => {
    renderWithProviders(
      <ReviewForm hideItemId={false} submitAction={submitAction} />,
    );
    const itemInput = screen.getByLabelText(/Menu Item ID/i);

    fireEvent.change(itemInput, { target: { value: "3.14" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(
      await screen.findByText(/Item ID must be a positive integer/),
    ).toBeVisible();

    fireEvent.change(itemInput, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(
      await screen.findByText(/Item ID must be a positive integer/),
    ).toBeVisible();

    fireEvent.change(itemInput, { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(
      await screen.findByText(/Item ID must be a positive integer/),
    ).toBeVisible();

    expect(submitAction).not.toHaveBeenCalled();
  });

  it("validates stars: below 1, above 5, non-integer", async () => {
    renderWithProviders(
      <ReviewForm hideItemId={false} submitAction={submitAction} />,
    );
    const starsInput = screen.getByLabelText(/Stars/i);

    fireEvent.change(starsInput, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(await screen.findByText(/Minimum 1 star/)).toBeVisible();

    fireEvent.change(starsInput, { target: { value: "6" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(await screen.findByText(/Maximum 5 stars/)).toBeVisible();

    fireEvent.change(starsInput, { target: { value: "4.5" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(
      await screen.findByText(/Please enter a whole number/),
    ).toBeVisible();

    expect(submitAction).not.toHaveBeenCalled();
  });

  it("validates comments max length of 255", async () => {
    renderWithProviders(
      <ReviewForm hideItemId={false} submitAction={submitAction} />,
    );
    const comments = screen.getByLabelText(/Comments/i);
    fireEvent.change(comments, { target: { value: "x".repeat(256) } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(
      await screen.findByText(/Max length is 255 characters/),
    ).toBeVisible();
    expect(submitAction).not.toHaveBeenCalled();
  });

  it("submits successfully with valid inputs", async () => {
    renderWithProviders(
      <ReviewForm hideItemId={false} submitAction={submitAction} />,
    );

    fireEvent.change(screen.getByLabelText(/Menu Item ID/i), {
      target: { value: "42" },
    });
    fireEvent.change(screen.getByLabelText(/Stars/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/Comments/i), {
      target: { value: "All good!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    await waitFor(() => expect(submitAction).toHaveBeenCalled());

    const dataArg = submitAction.mock.calls[0][0];
    expect(dataArg).toEqual({
      itemId: "42",
      stars: "5",
      comments: "All good!",
    });
  });

  it("navigates back when Cancel is clicked", () => {
    renderWithProviders(
      <ReviewForm
        initialContents={{}}
        submitAction={submitAction}
        hideItemId={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("uses default buttonLabel = 'Create' when not provided", () => {
    renderWithProviders(
      <ReviewForm initialContents={{}} submitAction={submitAction} />,
    );

    const button = screen.getByRole("button", { name: /create/i });
    expect(button).toBeInTheDocument();
  });

  it("shows Menu Item ID input by default when hideItemId not passed", () => {
    renderWithProviders(
      <ReviewForm initialContents={{}} submitAction={submitAction} />,
    );

    expect(screen.getByLabelText(/Menu Item ID/i)).toBeInTheDocument();
  });

  it("pre-fills form fields from initialContents", () => {
    renderWithProviders(
      <ReviewForm
        initialContents={{
          itemId: "99",
          stars: "3",
          comments: "Pretty decent",
        }}
        submitAction={submitAction}
      />,
    );

    expect(screen.getByLabelText(/Menu Item ID/i)).toHaveValue(99);
    expect(screen.getByLabelText(/Stars/i)).toHaveValue(3);
    expect(screen.getByLabelText(/Comments/i)).toHaveValue("Pretty decent");
  });

  it("shows error if item ID is 0, negative, or non-integer", async () => {
    renderWithProviders(
      <ReviewForm submitAction={jest.fn()} hideItemId={false} />,
    );
    const input = screen.getByLabelText(/Menu Item ID/i);

    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(await screen.findByText(/positive integer/)).toBeVisible();

    fireEvent.change(input, { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(await screen.findByText(/positive integer/)).toBeVisible();

    fireEvent.change(input, { target: { value: "4.5" } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(await screen.findByText(/positive integer/)).toBeVisible();
  });

  it("renders the stars input using label", () => {
    renderWithProviders(
      <ReviewForm initialContents={{}} submitAction={jest.fn()} />,
    );
    expect(screen.getByLabelText(/Stars/i)).toBeInTheDocument();
  });

  it("renders the comments textarea using label", () => {
    renderWithProviders(
      <ReviewForm initialContents={{}} submitAction={jest.fn()} />,
    );
    expect(screen.getByLabelText(/Comments/i)).toBeInTheDocument();
  });
});
