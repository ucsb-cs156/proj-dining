import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import BestItemsPage from "main/pages/Statistics/BestItemsPage";
import { PERIOD_OPTIONS } from "main/pages/Statistics/statisticsConstants";
import * as useBackendModule from "main/utils/useBackend";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { statisticsFixtures } from "fixtures/statisticsFixtures";
import mockConsole from "tests/testutils/mockConsole";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

describe("BestItemsPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterEach(() => {
    useBackendSpy.mockClear();
  });

  test("renders the table when items are returned for the default ALL period", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/items/best", { params: { period: "ALL" } })
      .reply(200, statisticsFixtures.threeBestItems);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BestItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Best Rated Items")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByTestId("BestItemsPage-table-cell-row-0-col-itemName"),
      ).toHaveTextContent("Waffle");
    });

    const select = screen.getByTestId("BestItemsPage-period-select");
    expect(select).toHaveValue("ALL");
  });

  test("refetches with the new period when the dropdown changes", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/items/best", { params: { period: "ALL" } })
      .reply(200, statisticsFixtures.threeBestItems);
    axiosMock
      .onGet("/api/statistics/items/best", { params: { period: "1W" } })
      .reply(200, [statisticsFixtures.threeBestItems[0]]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BestItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("BestItemsPage-table-cell-row-0-col-itemName");

    const select = screen.getByTestId("BestItemsPage-period-select");
    fireEvent.change(select, { target: { value: "1W" } });
    expect(select).toHaveValue("1W");

    await waitFor(() => {
      const callsForWeek = axiosMock.history.get.filter(
        (c) =>
          c.url === "/api/statistics/items/best" &&
          c.params &&
          c.params.period === "1W",
      );
      expect(callsForWeek.length).toBeGreaterThanOrEqual(1);
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId("BestItemsPage-table-cell-row-1-col-itemName"),
      ).not.toBeInTheDocument();
    });

    expect(useBackendSpy).toHaveBeenCalledWith(
      ["/api/statistics/items/best", "1W"],
      {
        method: "GET",
        url: "/api/statistics/items/best",
        params: { period: "1W" },
      },
      [],
    );
  });

  test("renders empty message when there are no items", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/items/best", { params: { period: "ALL" } })
      .reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BestItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("BestItemsPage-empty")).toHaveTextContent(
      "No reviews available for this period yet.",
    );
  });

  test("exposes the expected literal period options", () => {
    expect(PERIOD_OPTIONS).toEqual([
      { value: "ALL", label: "All time" },
      { value: "6M", label: "Last 6 months" },
      { value: "1M", label: "Last month" },
      { value: "1W", label: "Last week" },
    ]);
  });

  test("renders an option for each period", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/items/best", { params: { period: "ALL" } })
      .reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BestItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    for (const opt of PERIOD_OPTIONS) {
      const option = await screen.findByTestId(
        `BestItemsPage-period-option-${opt.value}`,
      );
      expect(option).toHaveTextContent(opt.label);
      expect(option).toHaveValue(opt.value);
    }
  });

  test("useBackend is called with correct cache query key, axios params, and initial data", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/items/best", { params: { period: "ALL" } })
      .reply(200, statisticsFixtures.threeBestItems);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BestItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Best Rated Items");

    expect(useBackendSpy).toHaveBeenCalledWith(
      ["/api/statistics/items/best", "ALL"],
      {
        method: "GET",
        url: "/api/statistics/items/best",
        params: { period: "ALL" },
      },
      [],
    );
  });

  test("surfaces backend errors", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/statistics/items/best").timeout();

    const restoreConsole = mockConsole();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BestItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/statistics/items/best",
    );
    restoreConsole();
  });
});
