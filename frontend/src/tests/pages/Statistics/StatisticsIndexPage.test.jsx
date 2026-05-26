import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { afterEach } from "vitest";

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

  afterEach(() => {
    axiosMock.reset();
  });

  test("renders enabled View links and disabled Coming Soon buttons", async () => {
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
      const control = screen.getByTestId(page.testid);
      if (page.comingSoon !== false) {
        expect(control).toBeDisabled();
        expect(control).toHaveTextContent("Coming Soon");
      } else {
        expect(control).toHaveAttribute("href", page.to);
        expect(control).toHaveTextContent("View");
      }
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

  test("exposes the expected comingSoon flags", () => {
    expect(STATISTICS_PAGES.map((p) => p.comingSoon)).toEqual([
      false,
      false,
      true,
      true,
      false,
    ]);
  });

  test("renders View links for implemented statistics cards", async () => {
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
      screen.getByTestId("StatisticsIndexPage-commons-meals"),
    ).toHaveAttribute("href", "/statistics/commons/meals");
  });

  test("renders Coming Soon buttons for not-yet-implemented cards", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StatisticsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    for (const testid of [
      "StatisticsIndexPage-commons-averages",
      "StatisticsIndexPage-commons-overtime",
    ]) {
      const button = await screen.findByTestId(testid);
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent("Coming Soon");
    }
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
