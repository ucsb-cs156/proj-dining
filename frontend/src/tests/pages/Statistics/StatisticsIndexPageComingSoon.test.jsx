import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { afterEach, vi } from "vitest";

import StatisticsIndexPage from "main/pages/Statistics/StatisticsIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

// Mock the statistics constants so that one page is "coming soon";
// currently every real STATISTICS_PAGES entry has comingSoon: false,
// so this covers the disabled-button branch of StatisticsIndexPage.
vi.mock("main/pages/Statistics/statisticsConstants", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    STATISTICS_PAGES: [
      {
        title: "Future Statistic",
        description: "A statistic that is not implemented yet.",
        to: "/statistics/future",
        testid: "StatisticsIndexPage-future",
        comingSoon: true,
      },
    ],
  };
});

describe("StatisticsIndexPage coming soon tests", () => {
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

  test("renders a disabled Coming Soon button for a page with comingSoon: true", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StatisticsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Review Statistics")).toBeInTheDocument();

    const control = screen.getByTestId("StatisticsIndexPage-future");
    expect(control).toBeDisabled();
    expect(control).toHaveTextContent("Coming Soon");
    expect(control).not.toHaveAttribute("href");
    expect(screen.getByText("Future Statistic")).toBeInTheDocument();
    expect(
      screen.getByText("A statistic that is not implemented yet."),
    ).toBeInTheDocument();
  });
});
