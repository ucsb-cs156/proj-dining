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
// Stub ReviewForm to inspect props and drive submitAction
jest.mock("main/components/MenuItemReviews/ReviewForm", () => (props) => (
  <div>
    <div data-testid="initial-contents">
      {JSON.stringify(props.initialContents)}
    </div>
    <div data-testid="hide-item-id">{props.hideItemId ? "true" : "false"}</div>
    <button
      data-testid="submit-button"
      onClick={() =>
        props.submitAction({
          stars: "5",
          comments: " Nice! ",
          itemId: props.initialContents.itemId,
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
    toast.success.mockClear();
    toast.error.mockClear();
  });

  it("passes initialContents and shows Item ID when no idParam", () => {
    renderPage({ idParam: undefined });
    expect(screen.getByTestId("initial-contents").textContent).toBe(
      JSON.stringify({ itemId: "", stars: "", comments: "" }),
    );
    expect(screen.getByTestId("hide-item-id").textContent).toBe("false");
  });

  it("passes initialContents and hides Item ID when idParam present", () => {
    renderPage({ idParam: "7" });
    expect(screen.getByTestId("initial-contents").textContent).toBe(
      JSON.stringify({ itemId: "7", stars: "", comments: "" }),
    );
    expect(screen.getByTestId("hide-item-id").textContent).toBe("true");
  });

  it("refuses to submit when not logged in", () => {
    renderPage({ currentUserData: {} });
    fireEvent.click(screen.getByTestId("submit-button"));
    expect(toast.error).toHaveBeenCalledWith(
      "You must be logged in to submit a review.",
    );
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("submits successfully using item.name and trims comments", async () => {
    const { navigateMock } = renderPage({
      idParam: "100",
      fromPath: "/came-from",
    });
    axios.post.mockResolvedValue({
      data: {
        item: { name: "Named Dish" },
        itemsStars: 3,
        reviewerComments: " Great! ",
      },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    // payload params
    const params = axios.post.mock.calls[0][2].params;
    expect(params.reviewerEmail).toBe("me@test.com");
    expect(params.itemsStars).toBe(5); // parseInt("5")
    expect(params.itemId).toBe(100);
    expect(params.dateItemServed).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );

    // toast with named dish and trimmed comment
    expect(toast.success).toHaveBeenCalledWith(
      `✅ Review submitted for "Named Dish"\n⭐ Rating: 3\n💬 Comment: Great!`,
      { autoClose: 8000 },
    );

    // navigate uses explicit fromPath
    jest.advanceTimersByTime(1000);
    expect(navigateMock).toHaveBeenCalledWith("/came-from");
  });

  it("(1) falls back to default comment when reviewerComments is undefined (kills optional chaining mutation)", async () => {
    const mockReview = {
      itemId: 12,
      item: { name: "Test Dish" },
      itemsStars: 4,
      // reviewerComments is omitted intentionally
    };

    axios.post.mockResolvedValueOnce({ data: mockReview });

    renderPage({ idParam: "12" }); // ✅ use your real wrapper

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
    axios.post.mockRejectedValue({
      response: { status: 404, data: { message: "MenuItem missing" } },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Menu item with ID 88 not found.");
  });

  it("falls back to generic error on 404 without 'MenuItem'", async () => {
    renderPage({ idParam: "55" });
    axios.post.mockRejectedValue({
      response: { status: 404, data: { message: "Something else" } },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });

  it("falls back to generic error when no response object", async () => {
    renderPage({ idParam: "99" });
    axios.post.mockRejectedValue(new Error("Network failure"));

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });

  it("does not crash when currentUser is undefined (optional-chaining guard)", () => {
    renderPage({ currentUserData: undefined });
    expect(() =>
      fireEvent.click(screen.getByTestId("submit-button")),
    ).not.toThrow();
    // (We don’t re-check toast.error here, the other test covers that.)
  });

  it("falls back to default comment when reviewerComments is undefined (kills optional chaining mutation)", async () => {
    const mockReview = {
      itemId: 12,
      item: { name: "Test Dish" },
      itemsStars: 4,
      // reviewerComments is undefined intentially
    };

    axios.post.mockResolvedValueOnce({ data: mockReview });

    renderPage({ idParam: "12" });

    // click the mocked submit button — it triggers submitAction with stub data
    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        `✅ Review submitted for "Test Dish"\n⭐ Rating: 4\n💬 Comment: No comments provided.`,
        { autoClose: 8000 },
      ),
    );
  });

  it("falls back to 'Menu Item #...' when review.item is undefined (kills optional chaining on .item?.name)", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        // item is completely missing
        itemsStars: 2,
        reviewerComments: "Decent",
      },
    });

    renderPage({ idParam: "77" });

    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        `✅ Review submitted for "Menu Item #77"\n⭐ Rating: 2\n💬 Comment: Decent`,
        { autoClose: 8000 },
      ),
    );
  });

  it("falls back to generic error when status ≠ 404 but message includes 'MenuItem' (kills status check)", async () => {
    renderPage({ idParam: "77" });
    axios.post.mockRejectedValue({
      response: { status: 500, data: { message: "MenuItem missing" } },
    });

    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    // original code would go to generic error; mutant with `if(true && ...)` would show 'not found'
    expect(toast.error).toHaveBeenCalledWith("Error creating review.");
  });

  it("handles null data property safely", async () => {
    renderPage();
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: null, // data exists but is null
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

    // Return a basic review response
    axios.post.mockResolvedValue({
      data: {
        item: { name: "Fallback Dish" },
        itemsStars: 3,
        reviewerComments: "ok",
      },
    });

    render(<CreateReviewPage />);

    fireEvent.click(screen.getByTestId("submit-button"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        `✅ Review submitted for "Fallback Dish"\n⭐ Rating: 3\n💬 Comment: ok`,
        { autoClose: 8000 },
      ),
    );

    jest.advanceTimersByTime(1000);
    expect(navigateMock).toHaveBeenCalledWith("/reviews/create");
  });
});
