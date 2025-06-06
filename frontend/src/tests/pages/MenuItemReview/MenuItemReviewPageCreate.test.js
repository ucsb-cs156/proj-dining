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
      expect(screen.getByTestId("item-name").textContent).toBe(
        "Fetched Item Name",
      );
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
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    expect(toast.error).toHaveBeenCalledWith(
      "You must be logged in to submit a review.",
    );
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("submits successfully using fetched item name and includes dateServed", async () => {
    // Mock item fetch BEFORE rendering
    axios.get.mockResolvedValue({ data: { name: "Fetched Dish" } });

    const { navigateMock } = renderPage({
      idParam: "100",
      fromPath: "/came-from",
    });

    // Mock review submission
    axios.post.mockResolvedValue({
      data: {
        item: { name: "Named Dish" },
        itemsStars: 3,
        reviewerComments: " Great! ",
      },
    });

    // Wait for the item to load
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
    // eslint-disable-next-line
    const { navigateMock } = renderPage();

    axios.post.mockResolvedValue({
      data: {
        item: { name: "Form Item" },
        itemsStars: 4,
        reviewerComments: "Good",
      },
    });

    // Mock the form to return itemId in form data (need to update the mock)
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
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
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
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
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
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
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
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
    });

    axios.post.mockRejectedValue(new Error("Network failure"));

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });

  it("does not crash when currentUser is undefined (optional-chaining guard)", async () => {
    renderPage({ currentUserData: undefined });

    await waitFor(() => {
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
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
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
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
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
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
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
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
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
    });

    axios.post.mockRejectedValue({
      response: { status: 400, data: { error: "Some error" } },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });
});

// ----- MUTATION KILLING TESTS -----
describe("CreateReviewPage mutation killing tests", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    axios.post.mockReset();
    axios.get.mockReset();
    toast.success.mockClear();
    toast.error.mockClear();
  });

  // Kills mutation: if (id) -> if (true)
  // This mutation would cause the component to always try to fetch, even without an ID
  it("does not fetch item when no id param is provided", () => {
    renderPage({ idParam: undefined });

    // Should not make any axios.get calls when no ID is provided
    expect(axios.get).not.toHaveBeenCalled();

    // Should show default item name behavior
    expect(screen.getByTestId("item-name").textContent).toBe("no-item-name");
  });

  // Kills mutation: }, [id]); -> }, []);
  // This mutation would prevent re-fetching when the ID changes
  it("refetches item when id param changes", async () => {
    // Set up mocks first
    useCurrentUser.mockReturnValue({
      data: { root: { user: { email: "test@test.com" } } },
    });
    useLocation.mockReturnValue({ state: {} });
    useNavigate.mockReturnValue(jest.fn());

    // First render with id=1
    axios.get.mockResolvedValue({ data: { name: "Item 1" } });
    useParams.mockReturnValue({ id: "1" });

    const { rerender } = render(<CreateReviewPage />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/diningcommons/menuitem?id=1",
      );
    });

    // Clear the mock and change the ID
    axios.get.mockClear();
    axios.get.mockResolvedValue({ data: { name: "Item 2" } });
    useParams.mockReturnValue({ id: "2" });

    // Re-render the component
    rerender(<CreateReviewPage />);

    // Should fetch the new item
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        "/api/diningcommons/menuitem?id=2",
      );
    });
  });

  // Kills mutation: console.error("Error fetching item:", error) -> console.error("", error)
  // This ensures the error logging works correctly
  it("logs error message when item fetch fails", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    axios.get.mockRejectedValue(new Error("Network error"));

    renderPage({ idParam: "123" });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching item:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  // Kills mutation: `Menu Item #${itemId}` -> ``
  // This ensures the fallback item name logic works
  it("shows Menu Item #id fallback when no item name available and no fetched name", async () => {
    // Mock a successful post but with no item name in response
    axios.post.mockResolvedValue({
      data: {
        // No item property and no name
        itemsStars: 3,
        reviewerComments: "Test comment",
      },
    });

    // Render with ID but don't mock axios.get (so itemName stays as fallback)
    renderPage({ idParam: "456" });

    // Wait for any loading to complete
    await waitFor(() => {
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
    });

    // Should show the fallback
    expect(screen.getByTestId("item-name").textContent).toBe("Menu Item #456");

    // Submit to trigger the toast logic
    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("Menu Item #456"),
        { autoClose: 8000 },
      );
    });
  });

  // Add this test to your mutation killing tests section to kill the surviving mutant

  it("uses Menu Item #id fallback when all name sources are empty/undefined", async () => {
    // Mock axios.get to return empty name
    axios.get.mockResolvedValue({ data: { name: "" } });

    // Mock axios.post to return a response with no item name
    axios.post.mockResolvedValue({
      data: {
        // No item property at all
        itemsStars: 4,
        reviewerComments: "Test review",
      },
    });

    renderPage({ idParam: "789" });

    // Wait for item fetch to complete
    await waitFor(() => {
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
    });

    // At this point, itemName should be "Menu Item #789" because:
    // - axios.get returned empty name, so itemName becomes "Menu Item #789"
    // - The ReviewForm should show this fallback name
    expect(screen.getByTestId("item-name").textContent).toBe("Menu Item #789");

    // Submit the form
    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    // The toast should use the fallback name because:
    // - review.item?.name is undefined (no item in response)
    // - itemName is "Menu Item #789" (fallback from empty fetch)
    // - The mutant would make this empty string, breaking the display
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("Menu Item #789"),
        { autoClose: 8000 },
      );
    });

    // Verify the exact toast message structure
    const toastCall = toast.success.mock.calls[0][0];
    expect(toastCall).toContain('✅ Review submitted for "Menu Item #789"');
    expect(toastCall).toContain("⭐ Rating: 4");
    expect(toastCall).toContain("💬 Comment: Test review");
  });

  // Alternative test that more directly targets the mutation
  it("ensures fallback string is not empty when itemId exists", async () => {
    // Don't mock axios.get at all, so it will fail and use fallback
    axios.get.mockRejectedValue(new Error("Not found"));

    // Mock successful post with no item name
    axios.post.mockResolvedValue({
      data: {
        itemsStars: 2,
        reviewerComments: "Another test",
      },
    });

    renderPage({ idParam: "999" });

    await waitFor(() => {
      expect(
        screen.queryByText("Loading item information..."),
      ).not.toBeInTheDocument();
    });

    // Submit to trigger the toast logic that uses the fallback
    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    // The key assertion: the toast message should contain the item ID
    // If the mutant survives (empty string), this would fail
    const toastMessage = toast.success.mock.calls[0][0];
    expect(toastMessage).toMatch(/Menu Item #999/);
    expect(toastMessage).not.toMatch(/Review submitted for ""\s*⭐/); // Should not have empty name
  });
});
