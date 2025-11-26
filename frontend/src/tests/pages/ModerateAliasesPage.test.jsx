import { render, waitFor, screen, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import ModerateAliases from "main/pages/ModerateAliasesPage";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { AliasFixtures } from "fixtures/aliasFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("ModerateAliases Page Tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    mockToast.mockClear();
  });

  const testId = "Aliasapprovaltable";

  const setupModerator = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.moderatorUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdmin = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("renders aliases with approve/reject buttons for moderators", async () => {
    setupModerator();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, AliasFixtures.threeAliases);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliases />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-proposedAlias`),
      ).toHaveTextContent("vnarasiman");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Reject-button`),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
    );
    await userEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Reject-button`),
    );
  });

  test("renders aliases with approve/reject buttons for admin", async () => {
    setupAdmin();

    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, AliasFixtures.threeAliases);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliases />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-proposedAlias`),
      ).toHaveTextContent("vnarasiman");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Reject-button`),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
    );
    await userEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Reject-button`),
    );
  });

  test("handles error when backend is unavailable for moderator", async () => {
    setupModerator();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/usersWithProposedAlias").timeout();
    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliases />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/admin/usersWithProposedAlias",
    );
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-proposedAlias`),
    ).not.toBeInTheDocument();
  });

  test("does NOT render approve/reject buttons for regular user", async () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, AliasFixtures.threeAliases);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliases />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId(`${testId}-header-proposedAlias`),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Approve-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Reject-button`),
    ).not.toBeInTheDocument();
  });

  test("approve button calls mutation and shows success for correct data", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, AliasFixtures.threeAliases);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliases />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
      ).toBeInTheDocument();
    });

    await act(async () => {
      userEvent.click(
        screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
      expect(mockToast).toHaveBeenCalledWith("Moderation success");
    });
  });

  test("reject button calls mutation and shows success for correct data", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, AliasFixtures.threeAliases);

    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliases />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-Reject-button`),
      ).toBeInTheDocument();
    });

    await act(async () => {
      userEvent.click(
        screen.getByTestId(`${testId}-cell-row-0-col-Reject-button`),
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
      expect(mockToast).toHaveBeenCalledWith("Moderation success");
    });
  });
});
