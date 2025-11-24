import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import ModerateAliasesPage from "main/pages/ModerateAliasesPage";
import { vi } from "vitest";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import usersFixtures from "fixtures/usersFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: {
      success: (x) => mockToast(x),
      error: (x) => mockToast(x),
    },
  };
});

describe("ModerateAliasesPage Tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "AliasApprovalTable";

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

  test("renders aliases with approve/reject buttons for moderator", async () => {
    setupModerator();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, usersFixtures.threeUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliasesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-proposedAlias`),
      ).toHaveTextContent("Ali1");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Reject-button`),
    ).toBeInTheDocument();
  });

  test("renders aliases with approve/reject buttons for admin", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, usersFixtures.threeUsers);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliasesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-proposedAlias`),
      ).toHaveTextContent("Ali1");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Reject-button`),
    ).toBeInTheDocument();
  });

  test("handles error when backend is unavailable for moderator", async () => {
    setupModerator();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/usersWithProposedAlias").timeout();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliasesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    // When backend times out, should show empty state
    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-empty`)).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-proposedAlias`),
    ).not.toBeInTheDocument();
  });

  test("renders empty message when no aliases pending", async () => {
    setupModerator();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/admin/usersWithProposedAlias").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliasesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId(`${testId}-empty`)).toBeInTheDocument();
    });

    expect(
      screen.getByText("No aliases awaiting approval"),
    ).toBeInTheDocument();
  });

  test("approve button calls mutation and shows success toast", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, usersFixtures.threeUsers);
    axiosMock
      .onPut("/api/currentUser/updateAliasModeration")
      .reply(200, usersFixtures.threeUsers[0]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliasesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
      ).toBeInTheDocument();
    });

    const approveButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Approve-button`,
    );
    approveButton.click();

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    expect(axiosMock.history.put[0].params).toEqual({
      id: 1,
      approved: true,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "Alias moderation updated successfully",
      );
    });
  });

  test("reject button calls mutation and shows success toast", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/admin/usersWithProposedAlias")
      .reply(200, usersFixtures.threeUsers);
    axiosMock
      .onPut("/api/currentUser/updateAliasModeration")
      .reply(200, usersFixtures.threeUsers[0]);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateAliasesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-Reject-button`),
      ).toBeInTheDocument();
    });

    const rejectButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Reject-button`,
    );
    rejectButton.click();

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    expect(axiosMock.history.put[0].params).toEqual({
      id: 1,
      approved: false,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "Alias moderation updated successfully",
      );
    });
  });
});
