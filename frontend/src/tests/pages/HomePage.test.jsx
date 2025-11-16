import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "main/pages/HomePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import mockConsole from "tests/testutils/mockConsole";

import userEvent from "@testing-library/user-event";

//
// 1. Normal HomePage tests
//
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

    const date = new Date("2025-03-11");
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(date);
  });

  afterEach(() => {
    axiosMock.reset();
    queryClient.clear();
    vi.useRealTimers();
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

//
// 2. HomePage with no backend
//
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

//
// 3. Date selector tests (including style checks to kill mutants)
//
describe("HomePage date selector tests", () => {
  let axiosMock;
  let queryClient;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);

    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2025-03-11"));
  });

  afterEach(() => {
    axiosMock.reset();
    queryClient.clear();
    vi.useRealTimers();
  });

  test("Date input renders and defaults to today's mocked date", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const dateInput = await screen.findByLabelText(/select date/i);
    expect(dateInput).toBeInTheDocument();
    expect(dateInput.value).toBe("2025-03-11");
  });

  test("Changing date updates links in DiningCommonsTable", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");

    const dateInput = screen.getByLabelText(/select date/i);

    await userEvent.clear(dateInput);
    await userEvent.type(dateInput, "2025-04-01");

    expect(dateInput.value).toBe("2025-04-01");

    for (let i = 0; i < diningCommonsFixtures.fourCommons.length; i++) {
      const code = diningCommonsFixtures.fourCommons[i].code;

      expect(screen.getByText(code)).toHaveAttribute(
        "href",
        `/diningcommons/2025-04-01/${code}`,
      );
    }
  });

  test("Date selector container has correct margin-bottom style", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");

    const dateInput = screen.getByLabelText(/select date/i);
    const container = dateInput.closest("div");

    expect(container).not.toBeNull();
    expect(container).toHaveStyle("margin-bottom: 1rem");
  });

  test("Date selector label has correct margin-right style", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");

    const label = screen.getByText(/select date:/i);
    expect(label).toHaveStyle("margin-right: 0.5rem");
  });
});
