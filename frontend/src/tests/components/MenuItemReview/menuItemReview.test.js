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

  it("renders a disabled id field when initialContents.id is provided", () => {
    renderWithProviders(
      <ReviewForm
        initialContents={{ id: "ABC123" }}
        submitAction={submitAction}
        itemName="Test Pizza"
      />,
    );
    const idInput = screen.getByDisplayValue("ABC123");
    expect(idInput).toBeDisabled();
  });

  it("renders disabled item name field with provided itemName", () => {
    renderWithProviders(
      <ReviewForm
        initialContents={{}}
        submitAction={submitAction}
        itemName="Margherita Pizza"
      />,
    );
    const itemNameInput = screen.getByDisplayValue("Margherita Pizza");
    expect(itemNameInput).toBeDisabled();
  });

  it("shows 'required' errors and prevents submit when required fields empty", async () => {
    renderWithProviders(
      <ReviewForm 
        submitAction={submitAction} 
        itemName="Test Item"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(await screen.findByText(/Stars is required/)).toBeVisible();
    expect(await screen.findByText(/Date and time served is required/)).toBeVisible();
    expect(submitAction).not.toHaveBeenCalled();
  });

  it("validates stars: below 1, above 5, non-integer", async () => {
    renderWithProviders(
      <ReviewForm 
        submitAction={submitAction} 
        itemName="Test Item"
      />,
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
      <ReviewForm 
        submitAction={submitAction} 
        itemName="Test Item"
      />,
    );
    const comments = screen.getByLabelText(/Comments/i);
    fireEvent.change(comments, { target: { value: "x".repeat(256) } });
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(
      await screen.findByText(/Max length is 255 characters/),
    ).toBeVisible();
    expect(submitAction).not.toHaveBeenCalled();
  });

  it("validates dateServed is required", async () => {
    renderWithProviders(
      <ReviewForm 
        submitAction={submitAction} 
        itemName="Test Item"
      />,
    );
    
    // Fill only stars to test dateServed validation
    fireEvent.change(screen.getByLabelText(/Stars/i), {
      target: { value: "4" },
    });
    
    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    expect(
      await screen.findByText(/Date and time served is required/),
    ).toBeVisible();
    expect(submitAction).not.toHaveBeenCalled();
  });

  it("submits successfully with valid inputs", async () => {
    renderWithProviders(
      <ReviewForm 
        submitAction={submitAction} 
        itemName="Test Pizza"
      />,
    );

    fireEvent.change(screen.getByLabelText(/Stars/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/Comments/i), {
      target: { value: "All good!" },
    });
    fireEvent.change(screen.getByLabelText(/Date & Time Served/i), {
      target: { value: "2023-12-25T18:30" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    await waitFor(() => expect(submitAction).toHaveBeenCalled());

    const dataArg = submitAction.mock.calls[0][0];
    expect(dataArg).toEqual({
      stars: "5",
      comments: "All good!",
      dateServed: "2023-12-25T18:30",
    });
  });

  it("submits successfully with empty comments (optional field)", async () => {
    renderWithProviders(
      <ReviewForm 
        submitAction={submitAction} 
        itemName="Test Pizza"
      />,
    );

    fireEvent.change(screen.getByLabelText(/Stars/i), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText(/Date & Time Served/i), {
      target: { value: "2023-12-25T18:30" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));
    await waitFor(() => expect(submitAction).toHaveBeenCalled());

    const dataArg = submitAction.mock.calls[0][0];
    expect(dataArg).toEqual({
      stars: "3",
      comments: "",
      dateServed: "2023-12-25T18:30",
    });
  });

  it("navigates back when Cancel is clicked", () => {
    renderWithProviders(
      <ReviewForm
        initialContents={{}}
        submitAction={submitAction}
        itemName="Test Item"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("uses default buttonLabel = 'Create' when not provided", () => {
    renderWithProviders(
      <ReviewForm 
        initialContents={{}} 
        submitAction={submitAction} 
        itemName="Test Item"
      />,
    );

    const button = screen.getByRole("button", { name: /create/i });
    expect(button).toBeInTheDocument();
  });

  it("uses custom buttonLabel when provided", () => {
    renderWithProviders(
      <ReviewForm 
        initialContents={{}} 
        submitAction={submitAction} 
        itemName="Test Item"
        buttonLabel="Update Review"
      />,
    );

    const button = screen.getByRole("button", { name: /update review/i });
    expect(button).toBeInTheDocument();
  });

  it("pre-fills form fields from initialContents", () => {
    renderWithProviders(
      <ReviewForm
        initialContents={{
          stars: "3",
          comments: "Pretty decent",
          dateServed: "2023-12-25T18:30",
        }}
        submitAction={submitAction}
        itemName="Test Pizza"
      />,
    );

    expect(screen.getByLabelText(/Stars/i)).toHaveValue(3);
    expect(screen.getByLabelText(/Comments/i)).toHaveValue("Pretty decent");
    expect(screen.getByLabelText(/Date & Time Served/i)).toHaveValue("2023-12-25T18:30");
  });

  it("renders all required form elements", () => {
    renderWithProviders(
      <ReviewForm 
        initialContents={{}} 
        submitAction={submitAction} 
        itemName="Test Item"
      />,
    );
    
    expect(screen.getByLabelText(/Item Being Reviewed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stars/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comments/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date & Time Served/i)).toBeInTheDocument();
  });

  it("renders the stars input using label", () => {
    renderWithProviders(
      <ReviewForm 
        initialContents={{}} 
        submitAction={jest.fn()} 
        itemName="Test Item"
      />,
    );
    expect(screen.getByLabelText(/Stars/i)).toBeInTheDocument();
  });

  it("renders the comments textarea using label", () => {
    renderWithProviders(
      <ReviewForm 
        initialContents={{}} 
        submitAction={jest.fn()} 
        itemName="Test Item"
      />,
    );
    expect(screen.getByLabelText(/Comments/i)).toBeInTheDocument();
  });

  it("renders datetime input using label", () => {
    renderWithProviders(
      <ReviewForm 
        initialContents={{}} 
        submitAction={jest.fn()} 
        itemName="Test Item"
      />,
    );
    expect(screen.getByLabelText(/Date & Time Served/i)).toBeInTheDocument();
  });

  it("handles missing itemName prop gracefully", () => {
    renderWithProviders(
      <ReviewForm 
        initialContents={{}} 
        submitAction={jest.fn()}
      />,
    );
    
    const itemField = screen.getByLabelText(/Item Being Reviewed/i);
    expect(itemField).toHaveValue("");
    expect(itemField).toBeDisabled();
  });
});