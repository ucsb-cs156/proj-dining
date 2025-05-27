import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import Moderate from "main/pages/Moderate";
import { useBackend } from "main/utils/useBackend";
import { toast } from "react-toastify";

jest.mock("main/utils/useBackend");
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("Moderate Page Advanced Tests", () => {
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
    queryClient.clear();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });
  });

  test("renders correctly for admin user", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });

    useBackend.mockReturnValue({
      data: [{ id: 1, proposedAlias: "Alias1" }],
      status: "success",
      error: null,
      isLoading: false,
    });

    renderPage();
    await screen.findByText("Moderation Page");
    expect(
      screen.getByText(
        "This page is accessible only to admins and moderators. (Placeholder)",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Alias1")).toBeInTheDocument();
  });

  test("renders correctly for moderator user", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 2, email: "mod@ucsb.edu", admin: false, moderator: true },
      roles: [{ authority: "ROLE_MODERATOR" }],
      loggedIn: true,
    });

    useBackend.mockReturnValue({
      data: [{ id: 2, proposedAlias: "Alias2" }],
      status: "success",
      error: null,
      isLoading: false,
    });

    renderPage();
    await screen.findByText("Moderation Page");
    expect(screen.getByText("Alias2")).toBeInTheDocument();
  });

  test("redirects non-admin/moderator user to homepage", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 3, email: "user@ucsb.edu", admin: false, moderator: false },
      roles: [{ authority: "ROLE_USER" }],
      loggedIn: true,
    });

    renderPage();
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
  });

  test("redirects to homepage if currentUser is undefined", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, null);

    renderPage();
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
  });

  test("redirects to homepage if currentUser.loggedIn is false", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, { loggedIn: false });

    renderPage();
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
  });

  test("renders empty alias table when useBackend returns empty array", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });

    useBackend.mockReturnValue({
      data: [],
      status: "success",
      error: null,
      isLoading: false,
    });

    renderPage();
    const emptyMessage = await screen.findByTestId("AliasTable-empty");
    expect(emptyMessage).toHaveTextContent("No aliases awaiting approval");
  });

  test("renders empty alias table when useBackend returns undefined", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });

    useBackend.mockReturnValue({
      data: undefined,
      status: "success",
      error: null,
      isLoading: false,
    });

    renderPage();
    const emptyMessage = await screen.findByTestId("AliasTable-empty");
    expect(emptyMessage).toHaveTextContent("No aliases awaiting approval");
  });
});
