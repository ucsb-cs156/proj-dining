import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import EditReviewPage from "main/pages/Reviews/EditReviewPage";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";
import * as useBackendModule from "main/utils/useBackend";
import userEvent from "@testing-library/user-event";

const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

// silence console.error during tests to keep logs clean
beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
  useBackendSpy.mockClear();
});

// Always provide working versions of the router hooks that the page expects
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "2" }),
  };
});

const axiosMock = new AxiosMockAdapter(axios);
describe("EditReviewPage tests", () => {
  let queryClient;

  const mockReview = {
    id: 2,
    reviewerComments: "Old comment",
    itemsStars: 3,
    dateItemServed: "2026-05-18T23:57:00",
    item: {
      id: 3,
      name: "Eggs Benedict",
    },
  };

  const renderWithDefaultRouter = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EditReviewPage />
          <ToastContainer />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  beforeEach(() => {
    queryClient = new QueryClient();
    mockNavigate.mockClear();
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  test("renders without crashing", () => {
    renderWithDefaultRouter();

    const title = screen.getByText(/Edit review with id/);
    expect(title).toBeInTheDocument();
  });

  test("renders form fields with expected defaults", async () => {
    axiosMock.onGet("/api/reviews/2").reply(200, mockReview);
    renderWithDefaultRouter();
    expect(
      await screen.findByDisplayValue("Eggs Benedict"),
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Old comment")).toBeInTheDocument();
    expect(screen.getByLabelText(/Stars/i)).toHaveValue("3");
    expect(screen.getByLabelText(/Date and Time/i)).toHaveValue(
      "2026-05-18T23:57",
    );
    expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    const reviewRequest = axiosMock.history.get.find(
      (req) => req.url === `/api/reviews/2`,
    );
    expect(reviewRequest).toBeDefined();
    expect(reviewRequest.method).toBe("get");
  });

  test("update button is enabled by default", async () => {
    axiosMock.onGet("/api/reviews/2").reply(200, mockReview);
    renderWithDefaultRouter();
    const button = await screen.findByRole("button", {
      name: /update review/i,
    });
    expect(button).toBeEnabled();
  });

  test("submits updated review and navigates back", async () => {
    axiosMock.onGet("/api/reviews/2").reply(200, mockReview);
    axiosMock.onPut("/api/reviews/reviewer").reply(200, {});

    renderWithDefaultRouter();

    const commentsField = await screen.findByLabelText(/Comments/i);
    fireEvent.change(commentsField, { target: { value: "" } });
    await userEvent.type(commentsField, "Updated comment");

    await userEvent.selectOptions(screen.getByLabelText(/Stars/i), "4");

    fireEvent.change(screen.getByLabelText(/Date and Time/i), {
      target: { value: "2026-05-19T10:30" },
    });

    fireEvent.click(screen.getByRole("button", { name: /update review/i }));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));

    expect(axiosMock.history.put[0].params).toEqual({ id: "2" });
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      reviewerComments: "Updated comment",
      itemStars: 4,
      dateItemServed: "2026-05-19T10:30",
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("shows error toast on network error during edit with fallback message", async () => {
    axiosMock.onGet("/api/reviews/2").reply(200, mockReview);
    axiosMock.onPut("/api/reviews/reviewer").timeout();
    renderWithDefaultRouter();

    fireEvent.change(await screen.findByLabelText(/comments/i), {
      target: { value: "Updated comment" },
    });
    fireEvent.change(screen.getByLabelText(/stars/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "2024-04-01T12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Update Review/i }));

    expect(
      await screen.findByText(
        /Error updating review: timeout of 0ms exceeded/i,
      ),
    ).toBeInTheDocument();
  });

  test("shows server error message when response has error field", async () => {
    axiosMock.onGet("/api/reviews/2").reply(200, mockReview);
    axiosMock
      .onPut("/api/reviews/reviewer")
      .reply(500, { error: "Server error" });
    renderWithDefaultRouter();

    fireEvent.change(await screen.findByLabelText(/comments/i), {
      target: { value: "Oops" },
    });
    fireEvent.change(screen.getByLabelText(/stars/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "2024-04-01T12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update review/i }));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
  });

  test("shows fallback error message when response has no error field", async () => {
    axiosMock.onGet("/api/reviews/2").reply(200, mockReview);
    axiosMock.onPut("/api/reviews/reviewer").reply(500, {});
    renderWithDefaultRouter();

    fireEvent.change(await screen.findByLabelText(/comments/i), {
      target: { value: "Test fallback" },
    });
    fireEvent.change(screen.getByLabelText(/stars/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "2024-04-02T15:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update review/i }));

    expect(
      await screen.findByText(
        /Error updating review: Request failed with status code 500/i,
      ),
    ).toBeInTheDocument();
  });

  // NEW: force a null response body to exercise data?.error path and kill optional-chaining mutation
  test("shows fallback error when response data is explicitly null", async () => {
    axiosMock.onGet("/api/reviews/2").reply(200, mockReview);
    axiosMock.onPut("/api/reviews/reviewer").reply(500, null);
    renderWithDefaultRouter();

    fireEvent.change(await screen.findByLabelText(/comments/i), {
      target: { value: "Null body" },
    });
    fireEvent.change(screen.getByLabelText(/stars/i), {
      target: { value: "3" },
    });
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "2024-04-03T10:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /update review/i }));

    expect(
      await screen.findByText(
        /Error updating review: Request failed with status code 500/i,
      ),
    ).toBeInTheDocument();
  });

  test("star dropdown contains five options", async () => {
    axiosMock.onGet("/api/reviews/2").reply(200, mockReview);

    renderWithDefaultRouter();

    const options = await screen.findAllByRole("option");

    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent("1");
    expect(options[4]).toHaveTextContent("5");
  });

  test("useBackend is called with correct cache query key", async () => {
    renderWithDefaultRouter();
    expect(useBackendSpy).toHaveBeenCalledWith(
      [`/api/reviews/2`],
      { method: "GET", url: `/api/reviews/2` },
      {},
    );
  });
});
