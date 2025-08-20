import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "main/pages/HomePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { diningCommonsFixtures } from "../../fixtures/diningCommonsFixtures";
import mockConsole from "jest-mock-console";

describe("HomePage tests", () => {
  let axiosMock;
  let queryClient;
  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient();
  });
  beforeEach(() => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);
    let date = new Date("2025-03-11");
    jest.useFakeTimers({ advanceTimers: true });
    jest.setSystemTime(date);
  });
  afterEach(() => {
    axiosMock.reset();
    queryClient.clear();
    jest.useRealTimers();
  });
  test("Renders table with 4 dining commons", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");
    for (let i = 0; i < diningCommonsFixtures.fourCommons.length; i++) {
      expect(
        screen.getByTestId(`DiningCommonsTable-cell-row-${i}-col-code`),
      ).toHaveTextContent(diningCommonsFixtures.fourCommons[i].code);
      expect(
        screen.getByText(diningCommonsFixtures.fourCommons[i].code),
      ).toHaveAttribute(
        "href",
        `/diningcommons/2025-03-11/${diningCommonsFixtures.fourCommons[i].code}`,
      );
    }
  });
});

describe("HomePage renders properly with no backend", () => {
  let axiosMock;
  const queryClient = new QueryClient();
  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
    queryClient.clear();
  });
  beforeEach(() => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/dining/all").timeout();
  });

  test("Renders without crashing with no backend", async () => {
    const restoreConsole = mockConsole();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });
    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/dining/all",
    );
    restoreConsole();
    expect(
      screen.queryByTestId("DiningCommonsTable-cell-row-0-col-code"),
    ).not.toBeInTheDocument();
  });
});
