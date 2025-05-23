import { render, screen, waitFor } from "@testing-library/react";
import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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

  function renderWithProviders() {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MyReviewsIndexPage />
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
});
