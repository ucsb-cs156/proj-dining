import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import Moderate from "main/pages/Moderate";

describe("ModeratePage tests", () => {
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
  });

  test("renders correctly for admin user", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    // Single assertion inside waitFor
    await screen.findByText("Moderation Page");
    // Additional assertion outside waitFor
    expect(
      screen.getByText("This page is accessible only to admins. (Placeholder)"),
    ).toBeInTheDocument();
  });

  test("redirects non-admin user to homepage", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 2, email: "user@ucsb.edu", admin: false },
      roles: [{ authority: "ROLE_USER" }],
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    // Single assertion inside waitFor
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
    // Additional assertion outside waitFor
    expect(
      screen.queryByText(
        "This page is accessible only to admins. (Placeholder)",
      ),
    ).not.toBeInTheDocument();
  });

  test("redirects to homepage if currentUser is undefined", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, null);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    // Single assertion inside waitFor
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
    // Additional assertion outside waitFor
    expect(
      screen.queryByText(
        "This page is accessible only to admins. (Placeholder)",
      ),
    ).not.toBeInTheDocument();
  });

  test("redirects to homepage if currentUser.loggedIn is undefined", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, { loggedIn: undefined, root: null });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    // Single assertion inside waitFor
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
    // Additional assertion outside waitFor
    expect(
      screen.queryByText(
        "This page is accessible only to admins. (Placeholder)",
      ),
    ).not.toBeInTheDocument();
  });

  test("handles case where currentUser is null and skips hasRole", async () => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, { loggedIn: false, root: null });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    // Single assertion inside waitFor
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
    // Additional assertion outside waitFor
    expect(
      screen.queryByText(
        "This page is accessible only to admins. (Placeholder)",
      ),
    ).not.toBeInTheDocument();
  });
});
