import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import CommonsAveragesPage from "main/pages/Statistics/CommonsAveragesPage";
import * as useBackendModule from "main/utils/useBackend";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { statisticsFixtures } from "fixtures/statisticsFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

describe("CommonsAveragesPage tests", () => {
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

  test("renders the table with averages", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/commons/averages")
      .reply(200, statisticsFixtures.commonsAverages);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsAveragesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Dining Commons Averages"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "CommonsAveragesPage-table-cell-row-0-col-diningCommonsCode",
        ),
      ).toHaveTextContent("carrillo");
    });
  });

  test("useBackend is called with correct cache query key, axios params, and initial data", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/commons/averages")
      .reply(200, statisticsFixtures.commonsAverages);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsAveragesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Dining Commons Averages");

    expect(useBackendSpy).toHaveBeenCalledWith(
      ["/api/statistics/commons/averages"],
      {
        method: "GET",
        url: "/api/statistics/commons/averages",
      },
      [],
    );
  });

  test("renders empty message when there are no averages", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/statistics/commons/averages").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsAveragesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("CommonsAveragesPage-empty"),
    ).toHaveTextContent("No reviews available yet.");
  });
});
