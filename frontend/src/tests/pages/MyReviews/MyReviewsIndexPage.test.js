import { render, screen, waitFor, within } from "@testing-library/react";
import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { MemoryRouter, Routes, Route } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("MyReviewsIndexPage", () => {
  let axiosMock;
  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
  });
  afterEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  const setupMocks = (reviews = ReviewFixtures.threeReviews, error = false) => {
    if (error) {
      axiosMock.onGet("/api/reviews/userReviews").networkError();
    } else {
      axiosMock.onGet("/api/reviews/userReviews").reply(200, reviews);
    }
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  function renderWithProviders(route = "/myreviews") {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/myreviews" element={<MyReviewsIndexPage />} />
            <Route
              path="/myreviews/edit/:id"
              element={<div>Edit Review</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("renders reviews table with edit and delete buttons", async () => {
    setupMocks();
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText("Delicious!")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Too salty.")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Pretty good overall.")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Edit").length).toBe(4);
    expect(screen.getAllByText("Delete").length).toBe(4);
    expect(screen.queryByText("Approve")).not.toBeInTheDocument();
    expect(screen.queryByText("Reject")).not.toBeInTheDocument();
  });

  test("renders loading state", () => {
    axiosMock.onGet("/api/reviews/userReviews").timeout();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    renderWithProviders();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  test("renders error state", async () => {
    setupMocks(undefined, true);
    renderWithProviders();
    await waitFor(() => {
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });

  test("renders empty state", async () => {
    setupMocks([]);
    renderWithProviders();
    await waitFor(() => {
      expect(screen.queryByText("Delicious!")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText("Too salty.")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.queryByText("Pretty good overall."),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText("Item ID")).toBeInTheDocument();
    expect(screen.getByText("Score")).toBeInTheDocument();
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(screen.getByText("Date Served")).toBeInTheDocument();
  });

  test("renders all columns correctly", async () => {
    setupMocks();
    renderWithProviders();
    await waitFor(() => {
      expect(screen.getByText("Item ID")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Score")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Comments")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText("Date Served")).toBeInTheDocument();
    });
  });

  test("deletes a review and updates table", async () => {
    axiosMock
      .onGet("/api/reviews/userReviews")
      .replyOnce(200, ReviewFixtures.threeReviews);
    const updatedReviews = ReviewFixtures.threeReviews.slice(1);
    axiosMock.onGet("/api/reviews/userReviews").reply(200, updatedReviews);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onDelete("/api/reviews/reviewer").reply(200);
    renderWithProviders();
    await screen.findByText("Delicious!");
    const rowDeleteButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Delete-button",
    );
    rowDeleteButton.click();
    await screen.findByTestId("delete-modal");
    const modalDeleteButton = within(
      screen.getByTestId("delete-modal"),
    ).getByText("Delete");
    modalDeleteButton.click();
    await waitFor(() =>
      expect(screen.queryByText("Delicious!")).not.toBeInTheDocument(),
    );
    const { toast } = require("react-toastify");
    expect(toast.success).toHaveBeenCalledWith("Review deleted");
    expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
  });

  test("shows error toast and keeps modal open on failed delete", async () => {
    axiosMock
      .onGet("/api/reviews/userReviews")
      .reply(200, ReviewFixtures.threeReviews);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onDelete("/api/reviews/reviewer").reply(500);
    renderWithProviders();
    await screen.findByText("Delicious!");
    const rowDeleteButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Delete-button",
    );
    rowDeleteButton.click();
    await screen.findByTestId("delete-modal");
    const modalDeleteButton = within(
      screen.getByTestId("delete-modal"),
    ).getByText("Delete");
    modalDeleteButton.click();
    await waitFor(() => {
      const { toast } = require("react-toastify");
      expect(toast.error).toHaveBeenCalledWith("Error deleting review");
    });
    expect(screen.getByTestId("delete-modal")).toBeInTheDocument();
  });

  test("navigates to edit page when Edit button is clicked", async () => {
    axiosMock
      .onGet("/api/reviews/userReviews")
      .reply(200, ReviewFixtures.threeReviews);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet(/\/api\/reviews\/get.*/).reply(200, {
      id: 7,
      itemStars: 4,
      reviewerComments: "Delicious!",
      dateItemServed: "2022-01-02T12:00:00",
    });
    renderWithProviders();
    await screen.findByText("Delicious!");
    const rowEditButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Edit-button",
    );
    rowEditButton.click();
    await screen.findByText("Edit Review");
  });

  test("closes modal and clears state when Cancel is clicked", async () => {
    axiosMock
      .onGet("/api/reviews/userReviews")
      .reply(200, ReviewFixtures.threeReviews);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    renderWithProviders();
    await screen.findByText("Delicious!");
    const rowDeleteButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Delete-button",
    );
    rowDeleteButton.click();
    await screen.findByTestId("delete-modal");
    const cancelButton = within(screen.getByTestId("delete-modal")).getByText(
      "Cancel",
    );
    cancelButton.click();
    await waitFor(() => {
      expect(screen.queryByTestId("delete-modal")).not.toBeInTheDocument();
    });
  });

  test("sends correct params to backend on delete", async () => {
    axiosMock
      .onGet("/api/reviews/userReviews")
      .replyOnce(200, ReviewFixtures.threeReviews);
    const updatedReviews = ReviewFixtures.threeReviews.slice(1);
    axiosMock.onGet("/api/reviews/userReviews").reply(200, updatedReviews);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onDelete("/api/reviews/reviewer").reply(200);
    renderWithProviders();
    await screen.findByText("Delicious!");
    const rowDeleteButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Delete-button",
    );
    rowDeleteButton.click();
    await screen.findByTestId("delete-modal");
    const modalDeleteButton = within(
      screen.getByTestId("delete-modal"),
    ).getByText("Delete");
    modalDeleteButton.click();
    await waitFor(() =>
      expect(screen.queryByText("Delicious!")).not.toBeInTheDocument(),
    );
    expect(axiosMock.history.delete[0].params).toEqual({
      id: ReviewFixtures.threeReviews[0].id,
    });
  });

  test("shows loading state on delete button while deleting", async () => {
    axiosMock
      .onGet("/api/reviews/userReviews")
      .replyOnce(200, ReviewFixtures.threeReviews);
    const updatedReviews = ReviewFixtures.threeReviews.slice(1);
    axiosMock.onGet("/api/reviews/userReviews").reply(200, updatedReviews);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onDelete("/api/reviews/reviewer").reply(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve([200]), 100);
      });
    });
    renderWithProviders();
    await screen.findByText("Delicious!");
    const rowDeleteButton = screen.getByTestId(
      "ReviewTable-cell-row-0-col-Delete-button",
    );
    rowDeleteButton.click();
    await screen.findByTestId("delete-modal");
    const modalDeleteButton = within(
      screen.getByTestId("delete-modal"),
    ).getByText("Delete");
    modalDeleteButton.click();
    await screen.findByText((text) => text.includes("Deleting"));
    await waitFor(() =>
      expect(screen.queryByText("Delicious!")).not.toBeInTheDocument(),
    );
  });
});
