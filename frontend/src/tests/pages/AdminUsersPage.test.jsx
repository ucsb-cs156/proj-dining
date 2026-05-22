import {
  render,
  waitFor,
  screen,
  fireEvent,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import AdminUsersPage from "main/pages/AdminUsersPage";
import usersFixtures from "fixtures/usersFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import mockConsole from "tests/testutils/mockConsole";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";

vi.mock("react-toastify");

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
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);

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
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);

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

    // Verify the correct endpoint was called
    const apiCall = axiosMock.history.get.find(
      (call) => call.url === "/api/admin/users",
    );
    expect(apiCall).toBeDefined();
  });

  test("renders users table with data", async () => {
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/users").reply(200, usersFixtures.threeUsers);

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

  test("toggling admin and moderator checkboxes updates the table after backend responds", async () => {
    const queryClient = new QueryClient();
    const afterAdminToggle = usersFixtures.threeUsers.map((u) =>
      u.id === 1 ? { ...u, admin: false } : u,
    );
    const afterModToggle = afterAdminToggle.map((u) =>
      u.id === 2 ? { ...u, moderator: false } : u,
    );

    axiosMock
      .onGet("/api/admin/users")
      .replyOnce(200, usersFixtures.threeUsers);
    axiosMock.onGet("/api/admin/users").replyOnce(200, afterAdminToggle);
    axiosMock.onGet("/api/admin/users").reply(200, afterModToggle);
    axiosMock.onPut("/api/admin/toggleAdmin").reply(200);
    axiosMock.onPut("/api/admin/toggleModerator").reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Users");

    // verify initial state
    const row0 = await screen.findByTestId(`${testId}-row-0`);
    expect(
      within(row0).getByRole("checkbox", { name: /admin/i }),
    ).toBeChecked();
    const row1 = await screen.findByTestId(`${testId}-row-1`);
    expect(
      within(row1).getByRole("checkbox", { name: /moderator/i }),
    ).toBeChecked();

    // toggle admin on user 1 (id=1, givenName="Phill"), wait for PUT then refetch
    fireEvent.click(within(row0).getByRole("checkbox", { name: /admin/i }));
    await waitFor(() =>
      expect(axiosMock.history.put.length).toBeGreaterThanOrEqual(1),
    );
    expect(axiosMock.history.put[0].url).toBe("/api/admin/toggleAdmin");
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
    expect(toast).toHaveBeenCalledWith("Updated admin status for user Phill");
    await waitFor(() => {
      expect(
        within(screen.getByTestId(`${testId}-row-0`)).getByRole("checkbox", {
          name: /admin/i,
        }),
      ).not.toBeChecked();
    });

    // toggle moderator on user 2 (id=2, givenName="Phillip"), wait for PUT then refetch
    fireEvent.click(
      within(screen.getByTestId(`${testId}-row-1`)).getByRole("checkbox", {
        name: /moderator/i,
      }),
    );
    await waitFor(() =>
      expect(axiosMock.history.put.length).toBeGreaterThanOrEqual(2),
    );
    expect(axiosMock.history.put[1].url).toBe("/api/admin/toggleModerator");
    expect(axiosMock.history.put[1].params).toEqual({ id: 2 });
    expect(toast).toHaveBeenCalledWith(
      "Updated moderator status for user Phillip",
    );
    await waitFor(() => {
      expect(
        within(screen.getByTestId(`${testId}-row-1`)).getByRole("checkbox", {
          name: /moderator/i,
        }),
      ).not.toBeChecked();
    });
  });
});
