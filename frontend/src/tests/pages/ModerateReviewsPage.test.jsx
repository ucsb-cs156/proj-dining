import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import ModerateReviews from "main/pages/ModerateReviewsPage";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
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

describe("ModerateReviews Page Tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "Reviewstable";
  const aliasTestId = "Aliasapprovaltable";

  beforeEach(() => {
    mockToast.mockClear();
  });

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
    axiosMock
      .onGet("/api/admin/users/needsmoderation")
      .reply(200, AliasFixtures.threeAliases);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
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
    expect(
      screen.getByTestId(`${aliasTestId}-cell-row-0-col-proposedAlias`),
    ).toHaveTextContent("vnarasiman");
    expect(
      screen.getByTestId(`${aliasTestId}-cell-row-0-col-Approve-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${aliasTestId}-cell-row-0-col-Reject-button`),
    ).toBeInTheDocument();
  });

  test("renders reviews with approve/reject buttons for admin", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);
    axiosMock
      .onGet("/api/admin/users/needsmoderation")
      .reply(200, AliasFixtures.threeAliases);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
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
    expect(
      screen.getByTestId(`${aliasTestId}-cell-row-0-col-Approve-button`),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId(`${aliasTestId}-cell-row-0-col-Reject-button`),
    ).toBeInTheDocument();
  });

  test("handles error when backend is unavailable for moderator", async () => {
    setupModerator();
    const queryClient = new QueryClient();
    axiosMock.onGet("/api/reviews/needsmoderation").timeout();
    axiosMock
      .onGet("/api/admin/users/needsmoderation")
      .reply(200, AliasFixtures.threeAliases);
    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/reviews/needsmoderation",
    );
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
    axiosMock
      .onGet("/api/admin/users/needsmoderation")
      .reply(200, AliasFixtures.threeAliases);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-item.id`),
      ).toHaveTextContent("7");
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Approve-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Reject-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${aliasTestId}-cell-row-0-col-Approve-button`),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${aliasTestId}-cell-row-0-col-Reject-button`),
    ).not.toBeInTheDocument();
  });

  test("approve alias button calls mutation and shows success", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);
    axiosMock
      .onGet("/api/admin/users/needsmoderation")
      .reply(200, AliasFixtures.threeAliases);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${aliasTestId}-cell-row-0-col-Approve-button`),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByTestId(`${aliasTestId}-cell-row-0-col-Approve-button`),
    );

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
      expect(mockToast).toHaveBeenCalledWith("Moderation success");
    });
  });

  test("reject alias button calls mutation and shows success", async () => {
    setupAdmin();
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/reviews/needsmoderation")
      .reply(200, ReviewFixtures.threeReviews);
    axiosMock
      .onGet("/api/admin/users/needsmoderation")
      .reply(200, AliasFixtures.threeAliases);
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ModerateReviews />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${aliasTestId}-cell-row-0-col-Reject-button`),
      ).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByTestId(`${aliasTestId}-cell-row-0-col-Reject-button`),
    );

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
      expect(mockToast).toHaveBeenCalledWith("Moderation success");
    });
  });
});
