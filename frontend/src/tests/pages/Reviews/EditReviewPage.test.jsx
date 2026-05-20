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
  const queryClient = new QueryClient();

  beforeEach(() => {
    mockNavigate.mockClear();
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderPage() {
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

  test("seeds the review form and submits updates", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock
      .onPut("/api/reviews/reviewer")
      .reply(200, ReviewFixtures.oneReview);

    renderPage();

    expect(await screen.findByLabelText(/comments/i)).toHaveValue(
      ReviewFixtures.oneReview.reviewerComments,
    );
    expect(screen.getByLabelText(/stars/i)).toHaveValue(
      String(ReviewFixtures.oneReview.itemsStars),
    );
    expect(screen.getByLabelText(/date and time/i)).toHaveValue(
      ReviewFixtures.oneReview.dateItemServed.slice(0, 16),
    );

    fireEvent.change(screen.getByLabelText(/comments/i), {
      target: { value: "updated comment" },
    });
    fireEvent.change(screen.getByLabelText(/stars/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "2024-05-01T10:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update review/i }));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    const put = axiosMock.history.put[0];
    expect(put.params).toEqual({ id: "1" });
    expect(JSON.parse(put.data)).toEqual({
      itemStars: 5,
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

    fireEvent.click(
      await screen.findByRole("button", { name: /update review/i }),
    );

    expect(
      await screen.findByText(/Error updating review: Server error/i),
    ).toBeInTheDocument();
  });

  test("shows an error toast when update fails with a network error (no response)", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock.onPut("/api/reviews/reviewer").networkErrorOnce();

    renderPage();

    fireEvent.click(
      await screen.findByRole("button", { name: /update review/i }),
    );

    expect(
      await screen.findByText(/Error updating review: Network Error/i),
    ).toBeInTheDocument();
  });
});
