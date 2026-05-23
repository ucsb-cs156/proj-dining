import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import StatisticsIndexPage from "main/pages/Statistics/StatisticsIndexPage";
import { STATISTICS_PAGES } from "main/pages/Statistics/statisticsConstants";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("StatisticsIndexPage tests", () => {
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

  test("renders all statistics navigation cards with links", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StatisticsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Review Statistics")).toBeInTheDocument();

    for (const page of STATISTICS_PAGES) {
      const link = screen.getByTestId(page.testid);
      expect(link).toHaveAttribute("href", page.to);
      expect(link).toHaveTextContent("View");
      expect(screen.getByText(page.title)).toBeInTheDocument();
      expect(screen.getByText(page.description)).toBeInTheDocument();
    }
  });

  test("exposes the expected list of statistics destinations", () => {
    expect(STATISTICS_PAGES.map((p) => p.to)).toEqual([
      "/statistics/items/best",
      "/statistics/items/worst",
      "/statistics/commons/averages",
      "/statistics/commons/overtime",
      "/statistics/commons/meals",
    ]);
  });

  test("exposes the expected list of test ids", () => {
    expect(STATISTICS_PAGES.map((p) => p.testid)).toEqual([
      "StatisticsIndexPage-best-items",
      "StatisticsIndexPage-worst-items",
      "StatisticsIndexPage-commons-averages",
      "StatisticsIndexPage-commons-overtime",
      "StatisticsIndexPage-commons-meals",
    ]);
  });

  test("exposes the expected card titles and descriptions", () => {
    expect(STATISTICS_PAGES.map((p) => p.title)).toEqual([
      "Best Rated Items",
      "Worst Rated Items",
      "Dining Commons Averages",
      "Dining Commons Averages Over Time",
      "Meal Averages by Dining Commons",
    ]);
    expect(STATISTICS_PAGES.map((p) => p.description)).toEqual([
      "See the highest rated menu items overall and in recent time windows.",
      "See the lowest rated menu items overall and in recent time windows.",
      "Average review score for each dining commons.",
      "Average review score for each dining commons by month.",
      "Average review score for each meal at a dining commons.",
    ]);
  });

  test("renders specific testid attributes on each card link", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StatisticsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("StatisticsIndexPage-best-items"),
    ).toHaveAttribute("href", "/statistics/items/best");
    expect(
      screen.getByTestId("StatisticsIndexPage-worst-items"),
    ).toHaveAttribute("href", "/statistics/items/worst");
    expect(
      screen.getByTestId("StatisticsIndexPage-commons-averages"),
    ).toHaveAttribute("href", "/statistics/commons/averages");
    expect(
      screen.getByTestId("StatisticsIndexPage-commons-overtime"),
    ).toHaveAttribute("href", "/statistics/commons/overtime");
    expect(
      screen.getByTestId("StatisticsIndexPage-commons-meals"),
    ).toHaveAttribute("href", "/statistics/commons/meals");
  });

  test("renders a wrapping column testid for each card", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StatisticsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId("StatisticsIndexPage-best-items-col"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("StatisticsIndexPage-worst-items-col"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("StatisticsIndexPage-commons-averages-col"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("StatisticsIndexPage-commons-overtime-col"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("StatisticsIndexPage-commons-meals-col"),
    ).toBeInTheDocument();
  });
});
