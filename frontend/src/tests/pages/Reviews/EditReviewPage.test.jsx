import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router";
import EditReviewPage from "main/pages/Reviews/EditReviewPage";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { vi } from "vitest";
import * as useBackendModule from "main/utils/useBackend";

const mockNavigate = vi.fn();

vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

const axiosMock = new AxiosMockAdapter(axios);

describe("EditReviewPage tests", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderPage() {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EditReviewPage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );
  }

  test("renders the review in edit mode", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);

    renderPage();

    expect(screen.getByText(/Edit review with id 1/)).toBeInTheDocument();
    expect(await screen.findByLabelText(/item name/i)).toHaveValue(
      ReviewFixtures.oneReview.item.name,
    );
  });

  test("seeds the review form and submits update", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock
      .onPut("/api/reviews/reviewer")
      .reply(200, ReviewFixtures.oneReview);

    renderPage();

    expect(
      await screen.findByTestId(/ReviewForm-review-item-name/),
    ).toHaveValue(ReviewFixtures.oneReview.item.name);
    expect(screen.getByTestId(/ReviewForm-review-comments/)).toHaveValue(
      "good food",
    );
    expect(screen.getByTestId(/ReviewForm-review-stars/)).toHaveValue("4");
    expect(screen.getByTestId(/ReviewForm-review-date/)).toHaveValue(
      ReviewFixtures.oneReview.dateItemServed.slice(0, 16),
    );

    fireEvent.change(screen.getByTestId(/ReviewForm-review-comments/), {
      target: { value: "updated comment" },
    });
    fireEvent.change(screen.getByTestId(/ReviewForm-review-stars/), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByTestId(/ReviewForm-review-date/), {
      target: { value: "2024-05-01T10:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    const put = axiosMock.history.put[0];
    expect(put.params).toEqual({ id: "1" });
    expect(JSON.parse(put.data)).toEqual({
      itemStars: 4,
      reviewerComments: "updated comment",
      dateItemServed: "2024-05-01T10:00",
    });

    expect(
      await screen.findByText(/Review updated for Make Your Own Waffle \(v\)/i),
    ).toBeInTheDocument();

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("shows an error message when the review cannot be loaded", () => {
    vi.spyOn(useBackendModule, "useBackend").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderPage();

    expect(screen.getByText(/Unable to load review/i)).toBeInTheDocument();
  });

  test("shows loading when review is undefined and not loading", () => {
    vi.spyOn(useBackendModule, "useBackend").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    renderPage();

    expect(screen.getByText(/Loading review.../i)).toBeInTheDocument();
  });

  test("shows an error toast when update fails", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock
      .onPut("/api/reviews/reviewer")
      .reply(500, { error: "Server error" });

    renderPage();

    fireEvent.change(await screen.findByTestId(/ReviewForm-review-date/), {
      target: { value: "2024-05-01T10:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(
      await screen.findByText(/Error updating review: Server error/i),
    ).toBeInTheDocument();
  });

  test("shows an error toast when update fails with response but no data", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock.onPut("/api/reviews/reviewer").reply(500);

    renderPage();

    fireEvent.change(await screen.findByTestId(/ReviewForm-review-date/), {
      target: { value: "2024-05-01T10:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(
      await screen.findByText(
        /Error updating review: Request failed with status code 500/i,
      ),
    ).toBeInTheDocument();
  });

  test("shows an error toast when update fails with a network error (no response)", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock.onPut("/api/reviews/reviewer").networkErrorOnce();

    renderPage();

    fireEvent.change(await screen.findByTestId(/ReviewForm-review-date/), {
      target: { value: "2024-05-01T10:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(
      await screen.findByText(/Error updating review: Network Error/i),
    ).toBeInTheDocument();
  });

  test("updates initial form values with previous submission", async () => {
    const { rerender } = render(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <EditReviewPage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    vi.spyOn(useBackendModule, "useBackend").mockReturnValue({
      data: {
        ...ReviewFixtures.oneReview,
        reviewerComments: "first comment",
        itemsStars: 2,
        dateItemServed: "2024-01-01T12:34",
      },
      isLoading: false,
      isError: false,
    });

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <EditReviewPage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("ReviewForm-review-comments")).toHaveValue(
      "first comment",
    );

    expect(screen.getByTestId("ReviewForm-review-stars")).toHaveValue("2");

    expect(screen.getByTestId("ReviewForm-review-date")).toHaveValue(
      "2024-01-01T12:34",
    );

    vi.spyOn(useBackendModule, "useBackend").mockReturnValue({
      data: {
        ...ReviewFixtures.oneReview,
        reviewerComments: "updated comment",
        itemsStars: 5,
        dateItemServed: "2025-05-05T09:45",
      },
      isLoading: false,
      isError: false,
    });

    rerender(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <EditReviewPage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("ReviewForm-review-comments")).toHaveValue(
      "updated comment",
    );

    expect(screen.getByTestId("ReviewForm-review-stars")).toHaveValue("5");

    expect(screen.getByTestId("ReviewForm-review-date")).toHaveValue(
      "2025-05-05T09:45",
    );
  });
});
