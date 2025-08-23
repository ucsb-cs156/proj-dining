import { render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import Moderate from "main/pages/ModeratePage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ReviewFixtures } from "fixtures/reviewFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

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
});
