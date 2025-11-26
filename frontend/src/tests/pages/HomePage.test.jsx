import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HomePage from "main/pages/HomePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import * as ReactQuery from "react-query";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import mockConsole from "tests/testutils/mockConsole";

describe("HomePage tests", () => {
  let axiosMock;
  let queryClient;
  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient();
  });
  beforeEach(() => {
    axiosMock.reset();
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
    const dateInput = screen.getByLabelText("Select Date:");
    expect(dateInput).toHaveValue("2025-03-11");
    fireEvent.change(dateInput, { target: { value: "2025-08-16" } });
    for (let i = 0; i < diningCommonsFixtures.fourCommons.length; i++) {
      expect(
        screen.getByTestId(`DiningCommonsTable-cell-row-${i}-col-code`),
      ).toHaveTextContent(diningCommonsFixtures.fourCommons[i].code);
      expect(
        screen.getByText(diningCommonsFixtures.fourCommons[i].code),
      ).toHaveAttribute(
        "href",
        `/diningcommons/2025-08-16/${diningCommonsFixtures.fourCommons[i].code}`,
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

describe("HomePage meals offered today tests", () => {
  let axiosMock;
  let queryClient;

  const mealsOffered = {
    carrillo: [
      { name: "Breakfast", code: "breakfast" },
      { name: "Lunch", code: "lunch" },
      { name: "Dinner", code: "dinner" },
    ],
    "de-la-guerra": [
      { name: "Breakfast", code: "breakfast" },
      { name: "Lunch", code: "lunch" },
      { name: "Dinner", code: "dinner" },
    ],
    ortega: [],
    portola: [
      { name: "Lunch", code: "lunch" },
      { name: "Dinner", code: "dinner" },
    ],
  };

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
    axiosMock.onGet("/api/dining/all").reply(200, []);
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);

    const date = "2025-03-11";
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(date));

    diningCommonsFixtures.fourCommons.forEach((d) => {
      axiosMock
        .onGet(`/api/diningcommons/${date}/${d.code}`)
        .reply(200, mealsOffered[d.code]);
    });
  });
  afterEach(() => {
    axiosMock.reset();
    queryClient.clear();
    vi.useRealTimers();
  });

  test("Handles empty data array", async () => {
    axiosMock.onGet("/api/dining/all").reply(200, []);
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("DiningCommonsTable-cell-row-0-col-code"),
      ).not.toBeInTheDocument();
    });
  });

  test("Handles null data array", async () => {
    axiosMock.onGet("/api/dining/all").reply(200, null);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("DiningCommonsTable-cell-row-0-col-code"),
      ).not.toBeInTheDocument();
    });
  });

  test("Handles undefined mealsOfferedToday", async () => {
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      diningCommonsFixtures.fourCommons.forEach((d, i) => {
        const row = screen.getByTestId(
          `DiningCommonsTable-cell-row-${i}-col-mealsOfferedToday`,
        );
        expect(row).toHaveTextContent("No meals offered today");
      });
    });
  });

  test("Query key must be 'meals'", async () => {
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);

    const date = "2025-03-11";
    diningCommonsFixtures.fourCommons.forEach((d) => {
      axiosMock.onGet(`/api/diningcommons/${date}/${d.code}`).reply(200, []);
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");

    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    const mealQueries = queries.filter((q) => q.queryKey[0] === "meals");

    expect(mealQueries.length).toBeGreaterThan(0);

    const emptyKeyQueries = queries.filter(
      (q) => Array.isArray(q.queryKey) && q.queryKey[0] === "",
    );
    expect(emptyKeyQueries.length).toBe(0);
  });

  test("Renders correctly with mealsOfferedToday", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");

    await waitFor(() => {
      for (let i = 0; i < diningCommonsFixtures.fourCommons.length; i++) {
        const row = screen.getByTestId(
          `DiningCommonsTable-cell-row-${i}-col-mealsOfferedToday`,
        );
        const expectedMeals =
          mealsOffered[diningCommonsFixtures.fourCommons[i].code];
        if (expectedMeals.length > 0) {
          expectedMeals.forEach((meal) => {
            expect(row).toHaveTextContent(meal.name);
          });
        } else {
          expect(row).toHaveTextContent("No meals offered today");
        }
      }
    });
  });

  test("Optional chaining handles sparse arrays where element is missing", async () => {
    axiosMock
      .onGet("/api/dining/all")
      .reply(200, diningCommonsFixtures.fourCommons);

    const date = "2025-03-11";
    diningCommonsFixtures.fourCommons.forEach((d) => {
      axiosMock.onGet(`/api/diningcommons/${date}/${d.code}`).reply(200, []);
    });

    const originalUseQueries = ReactQuery.useQueries;
    const spy = vi
      .spyOn(ReactQuery, "useQueries")
      .mockImplementation((queries) => {
        const results = originalUseQueries(queries);
        const sparseResults = [...results];
        sparseResults[1] = undefined;
        return sparseResults;
      });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");

    await waitFor(() => {
      const row = screen.getByTestId(
        "DiningCommonsTable-cell-row-1-col-mealsOfferedToday",
      );
      expect(row).toHaveTextContent("No meals offered today");
    });

    spy.mockRestore();
  });

  test("fetches dining commons from correct endpoint", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");

    // Verify the API was called with the correct URL
    const apiCalls = axiosMock.history.get.filter(
      (call) => call.url === "/api/dining/all",
    );
    expect(apiCalls.length).toBeGreaterThanOrEqual(1);
  });

  test("fetches meals for each dining commons when data is an array", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");

    await waitFor(() => {
      // Verify meal endpoints were called for each dining commons
      const mealCalls = axiosMock.history.get.filter((call) =>
        call.url.includes("/api/diningcommons/2025-03-11/"),
      );
      expect(mealCalls.length).toBe(diningCommonsFixtures.fourCommons.length);
    });
  });

  test("does not fetch meals when data is not an array", async () => {
    axiosMock.reset();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock.onGet("/api/dining/all").reply(200, null);

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

    const mealCalls = axiosMock.history.get.filter((call) =>
      call.url.includes("/api/diningcommons/"),
    );
    expect(mealCalls.length).toBe(0);

    expect(
      screen.queryByTestId("DiningCommonsTable-cell-row-0-col-code"),
    ).not.toBeInTheDocument();
  });
});
