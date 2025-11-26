import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import ReviewsPage from "main/pages/Reviews/ReviewsPage";
import { vi } from "vitest";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { useBackend } from "main/utils/useBackend";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

// Spy-style mock: we wrap the real useBackend so axios tests still work
vi.mock("main/utils/useBackend", async () => {
  const actual = await vi.importActual("main/utils/useBackend");
  return {
    __esModule: true,
    ...actual,
    useBackend: vi.fn(actual.useBackend),
  };
});

const mockedUseBackend = useBackend;

const axiosMock = new AxiosMockAdapter(axios);
describe("ReviewsPage tests", () => {
  const testId = "Reviewstable";

  const setupUserOnly = () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
  };

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    vi.clearAllMocks();
  });

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

  test("renders empty table when backend is unavailable", async () => {
    const itemid = "7";
    setupUserOnly();
    axiosMock.onGet(`/api/reviews/approved/forItem/${itemid}`).timeout();

    renderWithRoute(itemid);

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-item.id`),
    ).not.toBeInTheDocument();
  });

  test("renders table when backend is available", async () => {
    const itemid = "7";
    setupUserOnly();
    axiosMock
      .onGet(`/api/reviews/approved/forItem/${itemid}`)
      .reply(200, ReviewFixtures.threeReviews);

    renderWithRoute(itemid);

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`),
      ).toBeInTheDocument();
    });
  });

  // NEW: kills the Stryker mutant that changes method: "GET" -> ""
  test("calls useBackend with GET method and correct URL", async () => {
    const itemid = "7";
    setupUserOnly();
    axiosMock.onGet(`/api/reviews/approved/forItem/${itemid}`).reply(200, []);

    renderWithRoute(itemid);

    await waitFor(() => {
      expect(mockedUseBackend).toHaveBeenCalled();
    });

    const url = `/api/reviews/approved/forItem/${itemid}`;
    expect(mockedUseBackend).toHaveBeenCalledWith(
      [`/api/reviews/approved/forItem/${itemid}`],
      { method: "GET", url },
      [],
    );
  });
});
