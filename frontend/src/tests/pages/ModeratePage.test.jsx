import { render, waitFor, screen, fireEvent } from "@testing-library/react";
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

  test("approveCallback sends PUT to backend with correct params", async () => {
    setupModerator();
    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    axiosMock
      .onGet("/api/admin/users/needsmoderation")
      .reply(200, [
        { id: 42, proposedAlias: "alias1", status: "AWAITING_REVIEW" },
      ]);

    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200, {});

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait until alias row appears
    await waitFor(() =>
      expect(
        screen.getByTestId("Aliasapprovaltable-cell-row-0-col-proposedAlias"),
      ).toBeInTheDocument(),
    );

    const aliasesUpdateCount = queryClient.getQueryState([
      "/api/admin/users/needsmoderation",
    ]).dataUpdateCount;

    console.log(queryClient.getQueryCache());

    const currentUserUpdateCount = queryClient.getQueryState([
      "current user",
    ]).dataUpdateCount;

    // Click approve
    const approveButton = screen.getByTestId(
      "Aliasapprovaltable-cell-row-0-col-Approve-button",
    );
    fireEvent.click(approveButton);

    // backend PUT was called
    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    expect(
      queryClient.getQueryState(["current user"]).dataUpdateCount,
    ).toBe(currentUserUpdateCount);
    expect(
      queryClient.getQueryState(["/api/admin/users/needsmoderation"]).dataUpdateCount,
    ).toBe(aliasesUpdateCount + 1);

    // Check expected params
    expect(axiosMock.history.put[0].params).toEqual({
      id: 42,
      approved: true,
      proposedAlias: "alias1",
    });

    expect(queryClient.getQueryCache().find(["/api/admin/users/needsmoderation"])).not.toBeUndefined();
  });

  test("rejectCallback sends PUT to backend with correct params", async () => {
    setupModerator();
    const queryClient = new QueryClient();

    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);

    axiosMock
      .onGet("/api/admin/users/needsmoderation")
      .reply(200, [
        { id: 55, proposedAlias: "alias2", status: "AWAITING_REVIEW" },
      ]);

    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200, {});

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait until alias row appears
    await waitFor(() =>
      expect(
        screen.getByTestId("Aliasapprovaltable-cell-row-0-col-proposedAlias"),
      ).toBeInTheDocument(),
    );

    // Click reject
    const rejectButton = screen.getByTestId(
      "Aliasapprovaltable-cell-row-0-col-Reject-button",
    );
    fireEvent.click(rejectButton);

    // backend PUT was called
    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    // Check expected params
    expect(axiosMock.history.put[0].params).toEqual({
      id: 55,
      approved: false,
      proposedAlias: "alias2",
    });

    expect(queryClient.getQueryCache().find(["/api/admin/users/needsmoderation"])).not.toBeUndefined();
  });
});
