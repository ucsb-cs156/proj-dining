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

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

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
    // const restoreConsole = mockConsole();

    // SPY ON THE ADAPTER, NOT axios.request
    const adapterSpy = vi.spyOn(axios.defaults, "adapter");

    renderWithRoute(itemid);

    await waitFor(() => {
      expect(adapterSpy).toHaveBeenCalled();
      expect(adapterSpy.mock.calls[0][0].method).toBe("get"); // MUTATION KILLER
    });

    // await waitFor(() => {
    //   expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    // });

    // await waitFor(() => {
    //   // axios.request must have been called
    //   expect(axiosSpy).toHaveBeenCalled();

    //   // The method must be GET — this kills the mutant
    //   expect(axiosSpy.mock.calls[0][0].method).toBe("get");
    // });

    await waitFor(() => {
      // Table should remain empty
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-item.id`)
      ).not.toBeInTheDocument();
    });

    // expect(
    //   screen.queryByTestId(`${testId}-cell-row-0-col-item.id`),
    // ).not.toBeInTheDocument();
  });

  test("renders table when backend is available", async () => {
    const itemid = "7";
    setupUserOnly();
    const adapterSpy = vi.spyOn(axios.defaults, "adapter");
    axiosMock
      .onGet(`/api/reviews/approved/forItem/${itemid}`)
      .reply(200, ReviewFixtures.threeReviews);

    renderWithRoute(itemid);

    // await waitFor(() => {
    //   expect(
    //     screen.getByTestId(`${testId}-cell-row-0-col-item.id`),
    //   ).toBeInTheDocument();
    // });
    await waitFor(() => {
      expect(adapterSpy).toHaveBeenCalled();
      expect(adapterSpy.mock.calls[0][0].method).toBe("get"); // MUTATION KILLER
    });

    await waitFor(() => {
      // Table should show data
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`)
      ).toBeInTheDocument();
    });
  });
});
