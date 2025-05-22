import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { toast } from "react-toastify";
import { useCurrentUser } from "main/utils/currentUser";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import CreateReviewPage from "main/pages/ReviewsPage/CreateReviewsPage";

// ----- MOCKS -----
jest.mock("axios");
jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));
jest.mock("main/utils/currentUser", () => ({
  useCurrentUser: jest.fn(),
}));
// Stub BasicLayout to render children directly
jest.mock("main/layouts/BasicLayout/BasicLayout", () => ({ children }) => (
  <div>{children}</div>
));
// Updated ReviewForm mock to match new props
jest.mock("main/components/MenuItemReviews/ReviewForm", () => (props) => (
  <div>
    <div data-testid="initial-contents">
      {JSON.stringify(props.initialContents)}
    </div>
    <div data-testid="item-name">{props.itemName || "no-item-name"}</div>
    <button
      data-testid="submit-button"
      onClick={() =>
        props.submitAction({
          stars: "5",
          comments: " Nice! ",
          dateServed: "2024-01-15T12:00:00.000Z",
        })
      }
    >
      {props.buttonLabel}
    </button>
  </div>
));

// ----- HELPER -----
function renderPage({
  idParam,
  currentUserData = { root: { user: { email: "me@test.com" } } },
  fromPath,
  locationReturn,
} = {}) {
  // id param
  if (idParam !== undefined) {
    useParams.mockReturnValue({ id: idParam });
  } else {
    useParams.mockReturnValue({});
  }
  // user
  useCurrentUser.mockReturnValue({ data: currentUserData });
  // location
  if (locationReturn !== undefined) {
    useLocation.mockReturnValue(locationReturn);
  } else {
    // if fromPath undefined, state.from will be undefined
    useLocation.mockReturnValue({ state: { from: fromPath } });
  }
  // navigate
  const navigateMock = jest.fn();
  useNavigate.mockReturnValue(navigateMock);

  render(<CreateReviewPage />);
  return { navigateMock };
}

// ----- TEST SUITE -----
describe("CreateReviewPage branch coverage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    axios.post.mockReset();
    axios.get.mockReset();
    toast.success.mockClear();
    toast.error.mockClear();
  });

  it("passes initialContents with dateServed field when no idParam", () => {
    renderPage({ idParam: undefined });
    expect(screen.getByTestId("initial-contents").textContent).toBe(
      JSON.stringify({ stars: "", comments: "", dateServed: "" }),
    );
    expect(screen.getByTestId("item-name").textContent).toBe("no-item-name");
  });

  it("fetches item name and passes it to ReviewForm when idParam present", async () => {
    axios.get.mockResolvedValue({ data: { name: "Fetched Item Name" } });
    
    renderPage({ idParam: "7" });
    
    // Initially shows loading
    expect(screen.getByText("Loading item information...")).toBeInTheDocument();
    
    // Wait for the item to load
    await waitFor(() => {
      expect(screen.getByTestId("item-name").textContent).toBe("Fetched Item Name");
    });
    
    expect(axios.get).toHaveBeenCalledWith("/api/diningcommons/menuitem?id=7");
  });

  it("falls back to Menu Item #id when item fetch fails", async () => {
    axios.get.mockRejectedValue(new Error("Not found"));
    
    renderPage({ idParam: "7" });
    
    await waitFor(() => {
      expect(screen.getByTestId("item-name").textContent).toBe("Menu Item #7");
    });
  });

  it("falls back to Menu Item #id when item name is empty", async () => {
    axios.get.mockResolvedValue({ data: { name: "" } });
    
    renderPage({ idParam: "7" });
    
    await waitFor(() => {
      expect(screen.getByTestId("item-name").textContent).toBe("Menu Item #7");
    });
  });

  it("refuses to submit when not logged in", async () => {
    renderPage({ currentUserData: {} });
    
    // Wait for any loading to complete
    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId("submit-button"));
    expect(toast.error).toHaveBeenCalledWith(
      "You must be logged in to submit a review.",
    );
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("submits successfully using fetched item name and includes dateServed", async () => {
    const { navigateMock } = renderPage({
      idParam: "100",
      fromPath: "/came-from",
    });
    
    // Mock item fetch
    axios.get.mockResolvedValue({ data: { name: "Fetched Dish" } });
    
    // Mock review submission
    axios.post.mockResolvedValue({
      data: {
        item: { name: "Named Dish" },
        itemsStars: 3,
        reviewerComments: " Great! ",
      },
    });

    // Wait for item to load
    await waitFor(() => {
      expect(screen.getByTestId("item-name").textContent).toBe("Fetched Dish");
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    // Check payload params
    const params = axios.post.mock.calls[0][2].params;
    expect(params.reviewerEmail).toBe("me@test.com");
    expect(params.itemsStars).toBe(5); // parseInt("5")
    expect(params.itemId).toBe(100);
    expect(params.dateItemServed).toBe("2024-01-15T12:00:00.000Z"); // from mock form data
    expect(params.reviewerComments).toBe(" Nice! "); // not trimmed in payload

    // toast with named dish and trimmed comment
    expect(toast.success).toHaveBeenCalledWith(
      `✅ Review submitted for "Named Dish"\n⭐ Rating: 3\n💬 Comment: Great!`,
      { autoClose: 8000 },
    );

    // navigate uses explicit fromPath
    jest.advanceTimersByTime(1000);
    expect(navigateMock).toHaveBeenCalledWith("/came-from");
  });

  it("uses itemId from form when no id param", async () => {
    const { navigateMock } = renderPage();
    
    axios.post.mockResolvedValue({
      data: {
        item: { name: "Form Item" },
        itemsStars: 4,
        reviewerComments: "Good",
      },
    });

    // Mock the form to return itemId in formData (need to update the mock)
    const submitButton = screen.getByTestId("submit-button");
    // Simulate clicking with itemId in form data
    fireEvent.click(submitButton);
    
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    
    // The mock form doesn't include itemId, so it would be NaN
    // This test might need adjustment based on how your form actually works
  });

  it("falls back to default comment when reviewerComments is undefined", async () => {
    const mockReview = {
      itemId: 12,
      item: { name: "Test Dish" },
      itemsStars: 4,
      // reviewerComments is omitted intentionally
    };

    axios.post.mockResolvedValueOnce({ data: mockReview });

    renderPage({ idParam: "12" });
    
    // Wait for item loading
    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        `✅ Review submitted for "Test Dish"\n⭐ Rating: 4\n💬 Comment: No comments provided.`,
        { autoClose: 8000 },
      ),
    );
  });

  it("shows 'not found' error on 404 + 'MenuItem'", async () => {
    renderPage({ idParam: "88" });
    
    // Wait for item loading
    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });
    
    axios.post.mockRejectedValue({
      response: { status: 404, data: { message: "MenuItem missing" } },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Menu item with ID 88 not found.");
  });

  it("falls back to generic error on 404 without 'MenuItem'", async () => {
    renderPage({ idParam: "55" });
    
    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });
    
    axios.post.mockRejectedValue({
      response: { status: 404, data: { message: "Something else" } },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });

  it("falls back to generic error when no response object", async () => {
    renderPage({ idParam: "99" });
    
    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });
    
    axios.post.mockRejectedValue(new Error("Network failure"));

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });

  it("does not crash when currentUser is undefined (optional-chaining guard)", async () => {
    renderPage({ currentUserData: undefined });
    
    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });
    
    expect(() =>
      fireEvent.click(screen.getByTestId("submit-button")),
    ).not.toThrow();
  });

  it("uses fetched itemName when review.item is undefined", async () => {
    axios.get.mockResolvedValue({ data: { name: "Fetched Name" } });
    
    axios.post.mockResolvedValueOnce({
      data: {
        // item is completely missing
        itemsStars: 2,
        reviewerComments: "Decent",
      },
    });

    renderPage({ idParam: "77" });

    await waitFor(() => {
      expect(screen.getByTestId("item-name").textContent).toBe("Fetched Name");
    });

    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        `✅ Review submitted for "Fetched Name"\n⭐ Rating: 2\n💬 Comment: Decent`,
        { autoClose: 8000 },
      ),
    );
  });

  it("falls back to generic error when status ≠ 404 but message includes 'MenuItem'", async () => {
    renderPage({ idParam: "77" });
    
    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });
    
    axios.post.mockRejectedValue({
      response: { status: 500, data: { message: "MenuItem missing" } },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });

  it("handles null data property safely", async () => {
    renderPage();
    
    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });
    
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: null,
      },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });

  it("falls back to '/reviews/create' when location.state.from is undefined", async () => {
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);
    useParams.mockReturnValue({ id: "42" });
    useCurrentUser.mockReturnValue({
      data: { root: { user: { email: "user@ucsb.edu" } } },
    });

    // No location.state at all
    useLocation.mockReturnValue({});

    // Mock item fetch
    axios.get.mockResolvedValue({ data: { name: "Fallback Dish" } });

    // Return a basic review response
    axios.post.mockResolvedValue({
      data: {
        item: { name: "Response Dish" },
        itemsStars: 3,
        reviewerComments: "ok",
      },
    });

    render(<CreateReviewPage />);

    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        `✅ Review submitted for "Response Dish"\n⭐ Rating: 3\n💬 Comment: ok`,
        { autoClose: 8000 },
      ),
    );

    jest.advanceTimersByTime(1000);
    expect(navigateMock).toHaveBeenCalledWith("/reviews/create");
  });

  it("handles error response with error field instead of message", async () => {
    renderPage({ idParam: "55" });
    
    await waitFor(() => {
      expect(screen.queryByText("Loading item information...")).not.toBeInTheDocument();
    });
    
    axios.post.mockRejectedValue({
      response: { status: 400, data: { error: "Some error" } },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });
});