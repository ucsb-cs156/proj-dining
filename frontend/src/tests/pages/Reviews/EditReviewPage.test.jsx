import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import EditReviewPage from "main/pages/Reviews/EditReviewPage";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

const mockToast = vi.fn();
const mockToastError = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: Object.assign((x) => mockToast(x), {
      error: (x) => mockToastError(x),
    }),
  };
});

describe("EditReviewPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const renderWithRoute = (id = 1) => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/reviews/edit/${id}`]}>
          <Routes>
            <Route path="/reviews/edit/:id" element={<EditReviewPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    mockNavigate.mockClear();
    mockToast.mockClear();
    mockToastError.mockClear();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("loads the review into the edit form", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);

    renderWithRoute(1);

    expect(screen.getByText("Loading review...")).toBeInTheDocument();
    expect(await screen.findByText("Edit Review")).toBeInTheDocument();
    const itemName = await screen.findByLabelText("Item Name");
    expect(itemName).toHaveValue("Make Your Own Waffle (v)");
    expect(itemName).toBeDisabled();
    expect(screen.getByLabelText("Comments")).toHaveValue("good food");
    expect(screen.getByLabelText("Stars (1 to 5)")).toHaveValue("4");
    expect(screen.getByLabelText("Date and Time Item was Served")).toHaveValue(
      "2022-01-02T12:00",
    );
  });

  test("shows a loading message before the review finishes loading", () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);

    renderWithRoute(1);

    expect(screen.getByText("Loading review...")).toBeInTheDocument();
    expect(screen.queryByLabelText("Comments")).not.toBeInTheDocument();
  });

  test("submits edited review and navigates back on success", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock.onPut("/api/reviews/reviewer").reply(200, {
      ...ReviewFixtures.oneReview,
      reviewerComments: "Updated comments",
      itemsStars: 5,
      dateItemServed: "2024-04-01T12:00",
    });

    renderWithRoute(1);

    const commentsField = await screen.findByLabelText("Comments");
    await waitFor(() => expect(commentsField).toHaveValue("good food"));

    fireEvent.change(commentsField, {
      target: { value: "Updated comments" },
    });
    fireEvent.change(screen.getByLabelText("Stars (1 to 5)"), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText("Date and Time Item was Served"), {
      target: { value: "2024-04-01T12:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Update Review" }));

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].params).toEqual({ id: "1" });
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      itemStars: 5,
      reviewerComments: "Updated comments",
      dateItemServed: "2024-04-01T12:00",
    });
    expect(mockToast).toHaveBeenCalledWith("Review 1 updated");
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("shows server error message when update fails with an error field", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock.onPut("/api/reviews/reviewer").reply(400, {
      error: "Items stars must be between 1 and 5.",
    });

    renderWithRoute(1);

    fireEvent.click(
      await screen.findByRole("button", { name: "Update Review" }),
    );

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith(
        "Error updating review: Items stars must be between 1 and 5.",
      ),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows fallback error message when update fails without an error field", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock.onPut("/api/reviews/reviewer").reply(500, {});

    renderWithRoute(1);

    fireEvent.click(
      await screen.findByRole("button", { name: "Update Review" }),
    );

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith(
        "Error updating review: Request failed with status code 500",
      ),
    );
  });

  test("shows fallback error message when update fails without a response", async () => {
    axiosMock.onGet("/api/reviews/1").reply(200, ReviewFixtures.oneReview);
    axiosMock.onPut("/api/reviews/reviewer").networkError();

    renderWithRoute(1);

    fireEvent.click(
      await screen.findByRole("button", { name: "Update Review" }),
    );

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith(
        "Error updating review: Network Error",
      ),
    );
  });
});
