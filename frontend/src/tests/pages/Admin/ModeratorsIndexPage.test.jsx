import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ModeratorsIndexPage from "main/pages/Admin/ModeratorsIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { roleEmailFixtures } from "fixtures/roleEmailFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";
import * as useBackendModule from "main/utils/useBackend";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    toast: (x) => mockToast(x),
  };
});

const axiosMock = new AxiosMockAdapter(axios);

const useBackendSpy = vi.spyOn(useBackendModule, "useBackend");

describe("ModeratorsIndexPage tests", () => {
  const testId = "ModeratorsIndexPage";

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient();

  afterEach(() => {
    useBackendSpy.mockClear();
  });

  test("Renders with New Moderator Button", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/admin/moderators/get").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/New Moderator/)).toBeInTheDocument();
    });
    const button = screen.getByText(/New Moderator/);
    expect(button).toHaveAttribute("href", "/admin/moderators/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three items correctly", async () => {
    setupAdminUser();
    axiosMock
      .onGet("/api/admin/moderators/get")
      .reply(200, roleEmailFixtures.threeItems);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-email`),
      ).toHaveTextContent("moderator1@example.com");
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-email`),
    ).toHaveTextContent("admin1@example.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-email`),
    ).toHaveTextContent("moderator2@example.com");

    // delete button should be visible
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-delete-button`),
    ).toBeInTheDocument();
  });

  test("renders empty table when backend unavailable", async () => {
    setupAdminUser();

    axiosMock.onGet("/api/admin/moderators/get").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/admin/moderators/get",
    );
    restoreConsole();
  });

  test("what happens when you click delete", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/admin/moderators/get")
      .reply(200, roleEmailFixtures.threeItems);
    axiosMock
      .onDelete("/api/admin/moderators/delete")
      .reply(200, "first moderator deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-email`),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-email`),
    ).toHaveTextContent("moderator1@example.com");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("first moderator deleted");
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe(
      "/api/admin/moderators/delete",
    );
    expect(axiosMock.history.delete[0].params).toEqual({
      email: "moderator1@example.com",
    });
  });
  test("useBackend is called with correct cache query key", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModeratorsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(useBackendSpy).toHaveBeenCalledWith(
      [`/api/admin/moderators/get`],
      { method: "GET", url: `/api/admin/moderators/get` },
      [],
    );
  });
});
