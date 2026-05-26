import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import CommonsMealAveragesPage from "main/pages/Statistics/CommonsMealAveragesPage";
import * as useBackendModule from "main/utils/useBackend";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import { statisticsFixtures } from "fixtures/statisticsFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

describe("CommonsMealAveragesPage tests", () => {
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

  test("renders the heading and the commons dropdown", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);
    axiosMock
      .onGet("/api/statistics/commons/carrillo/meals/averages")
      .reply(200, statisticsFixtures.mealAverages);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsMealAveragesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Meal Averages by Dining Commons"),
    ).toBeInTheDocument();

    const select = await screen.findByTestId(
      "CommonsMealAveragesPage-commons-select",
    );
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveAttribute("value", "carrillo");
    expect(options[0]).toHaveTextContent("Carrillo");
    expect(options[1]).toHaveAttribute("value", "de-la-guerra");
    expect(options[1]).toHaveTextContent("De La Guerra");
    expect(options[2]).toHaveAttribute("value", "ortega");
    expect(options[2]).toHaveTextContent("Ortega");
    expect(options[3]).toHaveAttribute("value", "portola");
    expect(options[3]).toHaveTextContent("Portola");
  });

  test("defaults to the first commons and renders its meal averages section", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);
    axiosMock
      .onGet("/api/statistics/commons/carrillo/meals/averages")
      .reply(200, statisticsFixtures.mealAverages);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsMealAveragesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const select = await screen.findByTestId(
      "CommonsMealAveragesPage-commons-select",
    );
    expect(select).toHaveValue("carrillo");

    expect(
      await screen.findByTestId(
        "CommonsMealAveragesSection-table-cell-row-0-col-mealCode",
      ),
    ).toHaveTextContent("breakfast");
  });

  test("useBackend is called with correct cache keys, axios params, and initial data for both fetches", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);
    axiosMock
      .onGet("/api/statistics/commons/carrillo/meals/averages")
      .reply(200, statisticsFixtures.mealAverages);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsMealAveragesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Meal Averages by Dining Commons");

    expect(useBackendSpy).toHaveBeenCalledWith(
      ["/api/dining/all"],
      { method: "GET", url: "/api/dining/all" },
      [],
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

  test("changing the dropdown refetches with the newly selected code", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);
    axiosMock
      .onGet("/api/statistics/commons/carrillo/meals/averages")
      .reply(200, statisticsFixtures.mealAverages);
    axiosMock
      .onGet("/api/statistics/commons/ortega/meals/averages")
      .reply(200, statisticsFixtures.ortegaMealAverages);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsMealAveragesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const select = await screen.findByTestId(
      "CommonsMealAveragesPage-commons-select",
    );
    expect(select).toHaveValue("carrillo");

    fireEvent.change(select, { target: { value: "ortega" } });

    expect(select).toHaveValue("ortega");

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

  test("does not render the dropdown or the section when the commons list is empty", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/dining/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CommonsMealAveragesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Meal Averages by Dining Commons");

    expect(
      screen.queryByTestId("CommonsMealAveragesPage-commons-select"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("CommonsMealAveragesSection-empty"),
    ).not.toBeInTheDocument();

    expect(useBackendSpy).not.toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.stringMatching(/^\/api\/statistics\/commons\/.+\/meals\/averages$/),
      ]),
      expect.any(Object),
      expect.any(Array),
    );
  });
});
