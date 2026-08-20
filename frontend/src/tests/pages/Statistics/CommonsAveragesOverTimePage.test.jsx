import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import CommonsAveragesOverTimePage from "main/pages/Statistics/CommonsAveragesOverTimePage";
import * as useBackendModule from "main/utils/useBackend";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { statisticsFixtures } from "fixtures/statisticsFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

describe("CommonsAveragesOverTimePage tests", () => {
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

  test("renders the table with rows", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/commons/averages/overtime")
      .reply(200, statisticsFixtures.commonsOverTime);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsAveragesOverTimePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Dining Commons Averages Over Time"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "CommonsAveragesOverTimePage-table-cell-row-0-col-period",
        ),
      ).toHaveTextContent("2025-03");
    });
  });

  test("useBackend is called with correct cache query key, axios params, and initial data", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/commons/averages/overtime")
      .reply(200, statisticsFixtures.commonsOverTime);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsAveragesOverTimePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Dining Commons Averages Over Time");

    expect(useBackendSpy).toHaveBeenCalledWith(
      ["/api/statistics/commons/averages/overtime"],
      {
        method: "GET",
        url: "/api/statistics/commons/averages/overtime",
      },
      [],
    );
  });

  test("renders empty message when there are no rows", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/statistics/commons/averages/overtime").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsAveragesOverTimePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("CommonsAveragesOverTimePage-empty"),
    ).toHaveTextContent("No reviews available yet.");
  });
});
