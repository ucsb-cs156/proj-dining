import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import CommonsMealAveragesSection from "main/components/Statistics/CommonsMealAveragesSection";
import * as useBackendModule from "main/utils/useBackend";
import { statisticsFixtures } from "fixtures/statisticsFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

describe("CommonsMealAveragesSection tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  afterEach(() => {
    useBackendSpy.mockClear();
  });

  test("renders the table for the supplied dining commons code", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/commons/carrillo/meals/averages")
      .reply(200, statisticsFixtures.mealAverages);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsMealAveragesSection code="carrillo" />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(
          "CommonsMealAveragesSection-table-cell-row-0-col-mealCode",
        ),
      ).toHaveTextContent("breakfast");
    });
  });

  test("useBackend is called with correct cache key, axios params, and initial data", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/commons/carrillo/meals/averages")
      .reply(200, statisticsFixtures.mealAverages);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsMealAveragesSection code="carrillo" />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(useBackendSpy).toHaveBeenCalledWith(
        ["/api/statistics/commons/carrillo/meals/averages"],
        {
          method: "GET",
          url: "/api/statistics/commons/carrillo/meals/averages",
        },
        [],
      );
    });
  });

  test("fetches a different URL when the code prop changes", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/commons/ortega/meals/averages")
      .reply(200, statisticsFixtures.ortegaMealAverages);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsMealAveragesSection code="ortega" />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(useBackendSpy).toHaveBeenCalledWith(
        ["/api/statistics/commons/ortega/meals/averages"],
        {
          method: "GET",
          url: "/api/statistics/commons/ortega/meals/averages",
        },
        [],
      );
    });

    expect(
      await screen.findByTestId(
        "CommonsMealAveragesSection-table-cell-row-0-col-mealCode",
      ),
    ).toHaveTextContent("brunch");
  });

  test("renders the empty-state message when there are no meal averages", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/statistics/commons/carrillo/meals/averages")
      .reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsMealAveragesSection code="carrillo" />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("CommonsMealAveragesSection-empty"),
    ).toHaveTextContent("No reviews available yet.");
  });
});
