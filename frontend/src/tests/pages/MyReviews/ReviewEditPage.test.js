import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ReviewEditPage from "main/pages/MyReviews/ReviewEditPage";
import { MemoryRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ReviewEditPage", () => {
  let axiosMock;
  const review = {
    id: 42,
    itemStars: 3,
    reviewerComments: "Good food!",
    dateItemServed: "2025-05-24T12:00:00",
  };

  function setupMocks(getReview = review, putSuccess = true) {
    axiosMock.onGet(/\/api\/reviews\/get.*/).reply(200, getReview);
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "test@ucsb.edu" },
      roles: [{ authority: "ROLE_USER" }],
    });
    axiosMock.onGet("/api/systemInfo").reply(200, { showingNeither: true });
    if (putSuccess) {
      axiosMock.onPut("/api/reviews/reviewer").reply(200);
    } else {
      axiosMock.onPut("/api/reviews/reviewer").reply(400);
    }
  }

  function renderWithProviders(route = "/myreviews/edit/42") {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/myreviews/edit/:id" element={<ReviewEditPage />} />
            <Route path="/myreviews" element={<div>My Reviews Page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    const { toast } = require("react-toastify");
    toast.success.mockClear();
    toast.error.mockClear();
  });

  afterEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  test("renders and pre-fills form", async () => {
    setupMocks();
    renderWithProviders();
    expect(await screen.findByDisplayValue("3")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Good food!")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025-05-24T12:00")).toBeInTheDocument();
  });

  test("submits edit and navigates", async () => {
    setupMocks();
    renderWithProviders();
    await screen.findByDisplayValue("3");
    fireEvent.change(screen.getByLabelText(/Score/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/Comments/i), {
      target: { value: "Updated comment" },
    });
    fireEvent.click(screen.getByText("Save"));
    await screen.findByText("My Reviews Page");
    const { toast } = require("react-toastify");
    expect(toast.success).toHaveBeenCalledWith("Review updated");
  });

  test("shows error toast on failed edit", async () => {
    setupMocks(review, false);
    renderWithProviders();
    await screen.findByDisplayValue("3");
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      const { toast } = require("react-toastify");
      expect(toast.error).toHaveBeenCalled();
    });
  });

  test("sends correct PUT payload on edit", async () => {
    axiosMock.onGet(/\/api\/reviews\/get.*/).reply(200, {
      id: 42,
      itemStars: 3,
      reviewerComments: "Good food!",
      dateItemServed: "2025-05-24T12:00:00",
    });
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "test@ucsb.edu" },
      roles: [{ authority: "ROLE_USER" }],
    });
    axiosMock.onGet("/api/systemInfo").reply(200, { showingNeither: true });
    axiosMock.onPut("/api/reviews/reviewer").reply(200);
    renderWithProviders("/myreviews/edit/202");
    await screen.findByDisplayValue("3");
    fireEvent.change(screen.getByLabelText(/Score/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/Comments/i), {
      target: { value: "Updated comment" },
    });
    fireEvent.click(screen.getByText("Save"));
    await screen.findByText("My Reviews Page");
    expect(axiosMock.history.put[0].data).toContain('"itemStars":4');
    expect(axiosMock.history.put[0].data).toContain(
      '"reviewerComments":"Updated comment"',
    );
    expect(axiosMock.history.put[0].data).toContain('"dateItemServed":');
  });

  test("shows 'Review not found' on error", async () => {
    axiosMock.onGet(/\/api\/reviews\/get.*/).reply(404);
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "test@ucsb.edu" },
      roles: [{ authority: "ROLE_USER" }],
    });
    axiosMock.onGet("/api/systemInfo").reply(200, { showingNeither: true });
    renderWithProviders();
    expect(await screen.findByText(/Review not found/)).toBeInTheDocument();
  });

  test("form uses default values when review fields are missing", async () => {
    axiosMock.onGet(/\/api\/reviews\/get.*/).reply(200, { id: 99 });
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "test@ucsb.edu" },
      roles: [{ authority: "ROLE_USER" }],
    });
    axiosMock.onGet("/api/systemInfo").reply(200, { showingNeither: true });
    renderWithProviders();
    expect(await screen.findByLabelText(/Score/i)).toHaveValue(0);
    expect(screen.getByLabelText(/Comments/i)).toHaveValue("");
    expect(screen.getByLabelText(/Date Served/i)).toHaveValue("");
  });

  test("submits edit with missing dateItemServed and PUT is made", async () => {
    axiosMock.onGet(/\/api\/reviews\/get.*/).reply(200, {
      id: 101,
      itemStars: 2,
      reviewerComments: "Missing date",
    });
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "test@ucsb.edu" },
      roles: [{ authority: "ROLE_USER" }],
    });
    axiosMock.onGet("/api/systemInfo").reply(200, { showingNeither: true });
    axiosMock.onPut("/api/reviews/reviewer").reply(200);
    renderWithProviders("/myreviews/edit/101");
    const dateInput = await screen.findByLabelText(/Date Served/i);
    expect(dateInput.value).toBe("");
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
  });

  test("dateItemServed undefined results in empty field", async () => {
    axiosMock.onGet(/\/api\/reviews\/get.*/).reply(200, {
      id: 404,
      itemStars: 2,
      reviewerComments: "No date field",
      dateItemServed: undefined,
    });
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "test@ucsb.edu" },
      roles: [{ authority: "ROLE_USER" }],
    });
    axiosMock.onGet("/api/systemInfo").reply(200, { showingNeither: true });
    renderWithProviders("/myreviews/edit/404");
    const dateInput = await screen.findByLabelText(/Date Served/i);
    expect(dateInput.value).toBe("");
  });

  test("PUT request includes correct params (id)", async () => {
    axiosMock.onGet(/\/api\/reviews\/get.*/).reply(200, {
      id: 202,
      itemStars: 5,
      reviewerComments: "Params test",
      dateItemServed: "2025-05-24T12:00:00",
    });
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "test@ucsb.edu" },
      roles: [{ authority: "ROLE_USER" }],
    });
    axiosMock.onGet("/api/systemInfo").reply(200, { showingNeither: true });
    axiosMock.onPut("/api/reviews/reviewer").reply(200);
    renderWithProviders("/myreviews/edit/202");
    await screen.findByDisplayValue("5");
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() =>
      axiosMock.history.put.some(
        (req) => req.params && req.params.id === "202",
      ),
    );
    const putReq = axiosMock.history.put.find(
      (req) => req.params && req.params.id === "202",
    );
    expect(putReq).toBeDefined();
    expect(putReq.params).toEqual({ id: "202" });
  });

  test("shows correct error toast message on failed PUT", async () => {
    axiosMock.onGet(/\/api\/reviews\/get.*/).reply(200, {
      id: 303,
      itemStars: 1,
      reviewerComments: "Error toast",
      dateItemServed: "2025-05-24T12:00:00",
    });
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "test@ucsb.edu" },
      roles: [{ authority: "ROLE_USER" }],
    });
    axiosMock.onGet("/api/systemInfo").reply(200, { showingNeither: true });
    axiosMock.onPut("/api/reviews/reviewer").reply(500);
    renderWithProviders("/myreviews/edit/202");
    await screen.findByDisplayValue("1");
    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      const { toast } = require("react-toastify");
      expect(toast.error).toHaveBeenCalledWith("Failed to update review");
    });
  });
});
