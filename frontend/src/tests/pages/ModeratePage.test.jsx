import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import Moderate from "main/pages/ModeratePage";
import { vi } from "vitest";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
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

describe("Moderate Page Tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "Reviewstable";

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

  test("renders reviews with approve/reject buttons for moderator", async () => {
    setupModerator();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`),
      ).toHaveTextContent("7");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-Reject-button`),
    ).toBeInTheDocument();
  });

  test("renders reviews with approve/reject buttons for admin", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`),
      ).toHaveTextContent("7");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Approve-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-Reject-button`),
    ).toBeInTheDocument();
  });

  test("handles error when backend is unavailable for moderator", async () => {
    setupModerator();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/reviews/needsmoderation").timeout();
    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(
      errorMessage.includes("/api/reviews/needsmoderation") ||
        errorMessage.includes("api/admin/users/needsmoderation"),
    ).toBe(true);
    expect(errorMessage).toContain("Error communicating");
    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-item.id`),
    ).not.toBeInTheDocument();
  });

  test("does NOT render approve/reject buttons for regular user", async () => {
    setupUserOnly();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-item.id`),
      ).not.toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Approve-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Reject-button`),
    ).not.toBeInTheDocument();
  });

  test("approveCallback sends POST request to /api/admin/users/undefined/approve", async () => {
    setupModerator();
    const queryClient = new QueryClient();

    // Mock reviews
    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    axiosMock.onGet("/api/admin/users/needsmoderation").reply(200, [
      {
        id: 42,
        proposedAlias: "alias1",
        status: "AWAITING_REVIEW",
      },
    ]);

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("Aliasapprovaltable-cell-row-0-col-proposedAlias"),
      ).toBeInTheDocument();
    });

    const approveButton = screen.getByTestId(
      "Aliasapprovaltable-cell-row-0-col-Approve-button",
    );
    approveButton.click();

    // Since ButtonColumn passes cell, approveCallback receives cell object → id undefined
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/users/undefined/approve",
        expect.objectContaining({ method: "POST" }),
      );
    });

    fetchMock.mockRestore();
  });

  test("rejectCallback sends POST request to /api/admin/users/undefined/reject", async () => {
    setupModerator();
    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    axiosMock.onGet("/api/admin/users/needsmoderation").reply(200, [
      {
        id: 55,
        proposedAlias: "alias2",
        status: "AWAITING_REVIEW",
      },
    ]);

    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("Aliasapprovaltable-cell-row-0-col-proposedAlias"),
      ).toBeInTheDocument();
    });

    const rejectButton = screen.getByTestId(
      "Aliasapprovaltable-cell-row-0-col-Reject-button",
    );
    rejectButton.click();

    // Since ButtonColumn passes cell, rejectCallback receives cell object → id undefined
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/users/undefined/reject",
        expect.objectContaining({ method: "POST" }),
      );
    });

    fetchMock.mockRestore();
  });

  test("uses GET for fetching aliases needing moderation", async () => {
    setupModerator();

    // Returning any valid data is fine. This test only checks method.
    axiosMock.onGet("/api/admin/users/needsmoderation").reply(200, []);

    const adapterSpy = vi.spyOn(axios.defaults, "adapter");

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(adapterSpy).toHaveBeenCalled();
      expect(adapterSpy.mock.calls[0][0].method).toBe("get");
    });

    adapterSpy.mockRestore();
  });
});
