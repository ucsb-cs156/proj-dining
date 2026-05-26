import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import AdminUsersPage from "main/pages/AdminUsersPage";
import usersFixtures from "fixtures/usersFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import mockConsole from "tests/testutils/mockConsole";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("AdminUsersPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "UsersTable";

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

  test("renders without crashing on three users", async () => {
    const queryClient = new QueryClient();

    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Users");
  });

  test("renders empty table when backend unavailable", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/admin/users",
    );
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("fetches users from correct API endpoint", async () => {
    const queryClient = new QueryClient();

    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Users");

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(3);
    });

    const apiCall = axiosMock.history.get.find(
      (call) => call.url === "/api/admin/users",
    );

    expect(apiCall).toBeDefined();
    expect(apiCall.params).toEqual({
      page: 0,
      size: 50,
      sort: "id",
    });
  });

  test("renders users table with data", async () => {
    const queryClient = new QueryClient();

    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 1,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Users");

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });
  });

  test("pagination changes backend page correctly", async () => {
    const queryClient = new QueryClient();

    axiosMock.onGet("/api/admin/users").reply((config) => {
      if (config.params.page === 0) {
        return [
          200,
          {
            content: [usersFixtures.threeUsers[0]],
            totalPages: 2,
          },
        ];
      }

      return [
        200,
        {
          content: [usersFixtures.threeUsers[1]],
          totalPages: 2,
        },
      ];
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Users");

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    fireEvent.click(screen.getByText("2"));

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const secondPageCall = axiosMock.history.get.find(
      (call) => call.url === "/api/admin/users" && call.params?.page === 1,
    );

    expect(secondPageCall).toBeDefined();
  });
});
