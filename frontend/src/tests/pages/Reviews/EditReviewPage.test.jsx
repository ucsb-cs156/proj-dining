import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import EditReviewPage from "main/pages/Reviews/EditReviewPage";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";

beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

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

const existingReview = {
  id: 1,
  item: { name: "Pasta" },
  reviewerComments: "Very good",
  itemsStars: 4,
  dateItemServed: "2024-04-01T12:00:00",
};

describe("EditReviewPage tests", () => {
  const renderPage = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <EditReviewPage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  test("renders form pre-populated with existing review data", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, existingReview);
    renderPage();

    expect(await screen.findByLabelText(/comments/i)).toHaveValue("Very good");
    expect(screen.getByLabelText(/stars/i)).toHaveValue("4");
  });

  test("item name field is disabled", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, existingReview);
    renderPage();

    const itemName = await screen.findByLabelText(/item name/i);
    expect(itemName).toBeDisabled();
  });

  test("submit button says Update Review", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, existingReview);
    renderPage();

    expect(
      await screen.findByRole("button", { name: /update review/i }),
    ).toBeInTheDocument();
  });

  test("fetches review data from correct endpoint", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, existingReview);
    renderPage();

    await waitFor(() =>
      expect(
        axiosMock.history.get.some((r) => r.url === "/api/reviews/1"),
      ).toBe(true),
    );
  });

  test("submits updated review and navigates to /myreviews", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, existingReview);
    axiosMock.onPut("/api/reviews/reviewer").reply(200, {});
    renderPage();

    fireEvent.change(await screen.findByLabelText(/comments/i), {
      target: { value: "Updated comment" },
    });
    fireEvent.change(screen.getByLabelText(/stars/i), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update review/i }));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));

    expect(await screen.findByText("Review updated!")).toBeInTheDocument(); // add here

    expect(axiosMock.history.put[0].params).toEqual({ id: "1" });

    const putBody = JSON.parse(axiosMock.history.put[0].data);
    expect(putBody).toEqual({
      reviewerComments: "Updated comment",
      itemStars: 5,
      dateItemServed: expect.any(String),
    });

    expect(mockNavigate).toHaveBeenCalledWith("/myreviews");
  });

  test("shows error when comments exceed 255 characters", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, existingReview);
    renderPage();

    fireEvent.change(await screen.findByLabelText(/comments/i), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(screen.getByRole("button", { name: /update review/i }));

    expect(
      await screen.findByText(/max length 255 characters/i),
    ).toBeInTheDocument();
  });

  test("shows error when date is not provided", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, existingReview);
    renderPage();

    fireEvent.change(await screen.findByLabelText(/date and time/i), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update review/i }));

    expect(await screen.findByText(/date is required/i)).toBeInTheDocument();
  });

  test("handles review with no item gracefully", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, {
      ...existingReview,
      item: null,
    });
    renderPage();

    const itemName = await screen.findByLabelText(/item name/i);
    expect(itemName).toHaveValue("");
  });

  test("date field is pre-populated with sliced date", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, {
      ...existingReview,
      dateItemServed: "2024-04-01T12:00:00.000Z",
    });
    renderPage();

    const dateField = await screen.findByLabelText(/date and time/i);
    expect(dateField).toHaveValue("2024-04-01T12:00");
  });
});
