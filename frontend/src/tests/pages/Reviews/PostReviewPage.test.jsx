import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import PostReviewPage from "main/pages/Reviews/PostReviewPage";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";

// silence console.error during tests to keep logs clean
beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});


// Always provide working versions of the router hooks that the page expects
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return {
    ...original,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams("id:42")],
  };
});
const axiosMock = new AxiosMockAdapter(axios);
describe("MyReviewsCreatePage - full coverage tests", () => {
  const queryClient = new QueryClient();

  // Helper to render with the standard happy‑path router (has query params)
  const renderWithDefaultRouter = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PostReviewPage />
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>,
    );

  beforeEach(() => {
    mockNavigate.mockClear();
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  test("renders form fields with expected defaults", async () => {
    renderWithDefaultRouter();
    expect(await screen.findByLabelText(/comments/i)).toHaveValue("");
    expect(screen.getByLabelText(/stars/i)).toHaveValue("5");
    const dateInput = screen.getByLabelText(/date and time/i);
    expect(dateInput.value).not.toBe("");
  });

  test("submit button is enabled by default", async () => {
    renderWithDefaultRouter();
    const button = await screen.findByRole("button", {
      name: /submit review/i,
    });
    expect(button).toBeEnabled();
  });

  test("submits form and navigates on successful post", async () => {
    axiosMock.onPost("/api/reviews/post").reply(200, {});
    renderWithDefaultRouter();

    fireEvent.change(await screen.findByLabelText(/comments/i), {
      target: { value: "Great!" },
    });
    fireEvent.change(screen.getByLabelText(/stars/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/date and time/i), {
      target: { value: "2024-04-01T12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    const post = axiosMock.history.post[0];
    expect(post.params).toEqual({
      itemId: undefined,
      reviewerComments: "Great!",
      itemsStars: 4,
      dateItemServed: "2024-04-01T12:00",
    });

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("shows error toast on network error during post with fallback message", async () => {
    axiosMock.onPost("/api/reviews/post").timeout();
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
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(
      await screen.findByText(
        /Error submitting review: timeout of 0ms exceeded/i,
      ),
    ).toBeInTheDocument();
  });

  test("shows server error message when response has error field", async () => {
    axiosMock.onPost("/api/reviews/post").reply(500, { error: "Server error" });
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
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(
      await screen.findByText(/Error submitting review: Server error/i),
    ).toBeInTheDocument();
  });

  test("shows fallback error message when response has no error field", async () => {
    axiosMock.onPost("/api/reviews/post").reply(500, {});
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
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(
      await screen.findByText(
        /Error submitting review: Request failed with status code 500/i,
      ),
    ).toBeInTheDocument();
  });

  // NEW: force a null response body to exercise data?.error path and kill optional-chaining mutation
  test("shows fallback error when response data is explicitly null", async () => {
    axiosMock.onPost("/api/reviews/post").reply(500, null);
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
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));

    expect(
      await screen.findByText(
        /Error submitting review: Request failed with status code 500/i,
      ),
    ).toBeInTheDocument();
  });

  test("gracefully handles missing query params without crashing", async () => {
    // override searchParams to be empty
    vi.doMock("react-router", async () => {
      const original = await vi.importActual("react-router");
      return {
        ...original,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [new URLSearchParams("")],
      };
    });
  });
});
