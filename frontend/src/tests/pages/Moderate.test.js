import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import Moderate from "main/pages/Moderate";
import usersFixtures from "fixtures/usersFixtures";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

jest.mock("main/utils/useBackend");
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Moderate Page Tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  const renderPage = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Moderate />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    useBackend.mockReturnValue({
      data: usersFixtures.threeUsers,
      error: null,
      status: "success",
    });

    useBackendMutation.mockImplementation((_, { onSuccess, onError }) => ({
      mutate: (_, __) =>
        onError(new Error("Request failed with status code 500")),
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    queryClient.clear();
  });

  test("renders correctly for admin user", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    await screen.findByRole("heading", { level: 2, name: "Moderation Page" });
    expect(

      screen.getByTestId("AliasTable-header-proposedAlias"),

      screen.getByText(
        "This page is accessible only to admins and moderators. (Placeholder)",
      ),
    ).toBeInTheDocument();
  });

  test("renders correctly for moderator user", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: {
        id: 1,
        email: "moderator@ucsb.edu",
        admin: false,
        moderator: true,
      },
      roles: [{ authority: "ROLE_MODERATOR" }],
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    // Single assertion inside waitFor
    await screen.findByText("Moderation Page");
    // Additional assertion outside waitFor
    expect(
      screen.getByText(
        "This page is accessible only to admins and moderators. (Placeholder)",
      ),

    ).toBeInTheDocument();
    expect(screen.getByTestId("AliasTable-header-approve")).toBeInTheDocument();
    expect(screen.getByTestId("AliasTable-header-reject")).toBeInTheDocument();
  });

  test("redirects non-admin and non-moderator user to homepage", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 2, email: "user@ucsb.edu", admin: false, moderator: false },
      roles: [{ authority: "ROLE_USER" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { level: 2, name: "Moderation Page" }),
      ).not.toBeInTheDocument();
    });


    // Single assertion inside waitFor
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
    // Additional assertion outside waitFor
    expect(
      screen.queryByText(
        "This page is accessible only to admins and moderators. (Placeholder)",
      ),
    ).not.toBeInTheDocument();

  });

  test("redirects if currentUser data missing or not logged in", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, { loggedIn: false });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { level: 2, name: "Moderation Page" }),
      ).not.toBeInTheDocument();
    });


    // Single assertion inside waitFor
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
    // Additional assertion outside waitFor
    expect(
      screen.queryByText(
        "This page is accessible only to admins and moderators. (Placeholder)",
      ),
    ).not.toBeInTheDocument();

  });

  test("displays alias proposals from useBackend", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    const rows = await screen.findAllByTestId(/AliasTable-row-/);
    expect(rows).toHaveLength(usersFixtures.threeUsers.length);
    usersFixtures.threeUsers.forEach((alias, idx) => {
      expect(
        within(rows[idx]).getByText(
          alias.proposedAlias || "(No proposed alias)",
        ),
      ).toBeInTheDocument();
    });
  });

  test("useBackend called with correct arguments", () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    expect(useBackend).toHaveBeenCalledWith(
      ["/api/admin/usersWithProposedAlias"],
      { method: "GET", url: "/api/admin/usersWithProposedAlias" },
      [],
    );

    // Additional assertion outside waitFor
    expect(
      screen.queryByText(
        "This page is accessible only to admins and moderators. (Placeholder)",
      ),
    ).not.toBeInTheDocument();
  });

  test("shows error toast when rejecting alias fails", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    const cell = await screen.findByTestId("AliasTable-cell-row-0-col-reject");
    const button = within(cell).getByRole("button", { name: "Reject" });
    fireEvent.click(button);
    expect(toast.error).toHaveBeenCalledWith(
      "Error rejecting alias: Request failed with status code 500",
    );

    // Additional assertion outside waitFor
    expect(
      screen.queryByText(
        "This page is accessible only to admins and moderators. (Placeholder)",
      ),
    ).not.toBeInTheDocument();
  });
});
