import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import WorstItemsPage from "main/pages/Statistics/WorstItemsPage";
import { PERIOD_OPTIONS } from "main/pages/Statistics/statisticsConstants";
import * as useBackendModule from "main/utils/useBackend";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { statisticsFixtures } from "fixtures/statisticsFixtures";
import mockConsole from "tests/testutils/mockConsole";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

describe("WorstItemsPage tests", () => {
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
      .onGet("/api/statistics/items/worst", { params: { period: "ALL" } })
      .reply(200, statisticsFixtures.threeWorstItems);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WorstItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Worst Rated Items")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByTestId("WorstItemsPage-table-cell-row-0-col-itemName"),
      ).toHaveTextContent("Mystery Meat");
    });
  });

  test("refetches with the new period when the dropdown changes", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/items/worst", { params: { period: "ALL" } })
      .reply(200, statisticsFixtures.threeWorstItems);
    axiosMock
      .onGet("/api/statistics/items/worst", { params: { period: "6M" } })
      .reply(200, [statisticsFixtures.threeWorstItems[0]]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WorstItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("WorstItemsPage-table-cell-row-0-col-itemName");

    const select = screen.getByTestId("WorstItemsPage-period-select");
    fireEvent.change(select, { target: { value: "6M" } });
    expect(select).toHaveValue("6M");

    await waitFor(() => {
      const callsForSixMonths = axiosMock.history.get.filter(
        (c) =>
          c.url === "/api/statistics/items/worst" &&
          c.params &&
          c.params.period === "6M",
      );
      expect(callsForSixMonths.length).toBeGreaterThanOrEqual(1);
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId("WorstItemsPage-table-cell-row-1-col-itemName"),
      ).not.toBeInTheDocument();
    });
  });

  test("renders empty message when there are no items", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/items/worst", { params: { period: "ALL" } })
      .reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WorstItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByTestId("WorstItemsPage-empty")).toHaveTextContent(
      "No reviews available for this period yet.",
    );
  });

  test("renders an option for each shared period", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/items/worst", { params: { period: "ALL" } })
      .reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WorstItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    for (const opt of PERIOD_OPTIONS) {
      const option = await screen.findByTestId(
        `WorstItemsPage-period-option-${opt.value}`,
      );
      expect(option).toHaveTextContent(opt.label);
      expect(option).toHaveValue(opt.value);
    }
  });

  test("useBackend is called with correct cache query key, axios params, and initial data", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/items/worst", { params: { period: "ALL" } })
      .reply(200, statisticsFixtures.threeWorstItems);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WorstItemsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Worst Rated Items");

    expect(useBackendSpy).toHaveBeenCalledWith(
      ["/api/statistics/items/worst", "ALL"],
      {
        method: "GET",
        url: "/api/statistics/items/worst",
        params: { period: "ALL" },
      },
      [],
    );
  });

  test("surfaces backend errors", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/statistics/items/worst").timeout();

    const restoreConsole = mockConsole();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <WorstItemsPage />
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
      "Error communicating with backend via GET on /api/statistics/items/worst",
    );
    restoreConsole();
  });
});
