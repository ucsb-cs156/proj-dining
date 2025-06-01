import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ReviewsPage from "main/pages/Reviews/ReviewsPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("ReviewsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "Reviewstable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderWithRoute = (itemid) => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/reviews/${itemid}`]}>
          <Routes>
            <Route path="/reviews/:itemid" element={<ReviewsPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders reviews filtered by itemid", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/reviews/all").reply(200, ReviewFixtures.threeReviews);

    renderWithRoute("7");

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`),
      ).toHaveTextContent("7");
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-1-col-item.id`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend is unavailable", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/reviews/all").timeout();
    const restoreConsole = mockConsole();

    renderWithRoute("7");

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/reviews/all",
    );
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-item.id`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table if no reviews match the itemid", async () => {
    axiosMock.onGet("/api/reviews/all").reply(200, ReviewFixtures.threeReviews);

    renderWithRoute(999);

    await waitFor(() => {
      expect(screen.getByText("Reviews for Menu Item 999")).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId("Reviewstable-cell-row-0-col-item.id"),
    ).not.toBeInTheDocument();
  });

  test("handles undefined reviews safely", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/reviews/all").reply(200, null); // Simulates undefined reviews

    renderWithRoute("7");

    await waitFor(() => {
      expect(screen.getByText("Reviews for Menu Item 7")).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId("Reviewstable-cell-row-0-col-item.id"),
    ).not.toBeInTheDocument();
  });

  test("renders correct filtered review content", async () => {
    setupUserOnly();
    axiosMock.onGet("/api/reviews/all").reply(200, ReviewFixtures.threeReviews);

    renderWithRoute("7");

    await waitFor(() => {
      expect(screen.getByText("Reviews for Menu Item 7")).toBeInTheDocument();
    });
  });
});
