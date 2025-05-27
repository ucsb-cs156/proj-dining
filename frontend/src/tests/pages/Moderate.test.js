// src/tests/pages/Moderate.test.js

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
import { useBackend } from "main/utils/useBackend";
import { toast } from "react-toastify";
import usersFixtures from "fixtures/usersFixtures";

// 1. Mock useBackend so our alias list comes from fixtures
jest.mock("main/utils/useBackend", () => ({
  useBackend: jest.fn(),
}));

// 2. Mock toast so we can assert on success/error calls
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ModeratePage enhanced tests", () => {
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

    // Always return our three‐user fixture for the alias table
    useBackend.mockReturnValue({
      data: usersFixtures.threeUsers,
      error: null,
      status: "success",
    });
  });

  test("renders correctly for admin user", async () => {
    // Stub out currentUser and systemInfo endpoints
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    // Should see the page heading / placeholder text
    await screen.findByText("Moderation Page");
    expect(
      screen.getByText(
        "This page is accessible only to admins and moderators. (Placeholder)",
      ),
    ).toBeInTheDocument();
  });

  test("triggers toast.success when clicking approve & reject", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });
    axiosMock.onPut("/api/currentUser/updateAliasModeration").reply(200);

    renderPage();

    // Approve
    const approveCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Approve",
    );
    const approveButton = within(approveCell).getByRole("button", {
      name: "Approve",
    });
    fireEvent.click(approveButton);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining(
          `Alias "${usersFixtures.threeUsers[0].proposedAlias}"`,
        ),
      ),
    );

    // Reject
    const rejectCell = screen.getByTestId("AliasTable-cell-row-0-col-Reject");
    const rejectButton = within(rejectCell).getByRole("button", {
      name: "Reject",
    });
    fireEvent.click(rejectButton);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining(
          `Alias "${usersFixtures.threeUsers[0].proposedAlias}"`,
        ),
      ),
    );
  });

  test("shows toast.error when approve fails", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    const errorMessage = "Mocked approve error";
    jest.spyOn(axios, "put").mockRejectedValueOnce(new Error(errorMessage));

    renderPage();

    const approveCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Approve",
    );
    const approveButton = within(approveCell).getByRole("button", {
      name: "Approve",
    });
    fireEvent.click(approveButton);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error approving alias: ${errorMessage}`),
      ),
    );
  });

  test("shows toast.error when reject fails", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    const errorMessage = "Mocked reject error";
    jest.spyOn(axios, "put").mockRejectedValueOnce(new Error(errorMessage));

    renderPage();

    const rejectCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Reject",
    );
    const rejectButton = within(rejectCell).getByRole("button", {
      name: "Reject",
    });
    fireEvent.click(rejectButton);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error rejecting alias: ${errorMessage}`),
      ),
    );
  });

  test("redirects non-admin/non-moderator user", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 2, email: "user@ucsb.edu", admin: false, moderator: false },
      roles: [{ authority: "ROLE_USER" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
  });

  test("redirects when currentUser is null or loggedIn is falsy", async () => {
    // case: API returns null
    axiosMock.onGet("/api/currentUser").reply(200, null);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );

    // case: loggedIn undefined/false
    axiosMock.onGet("/api/currentUser").reply(200, { loggedIn: false });
    renderPage();
    await waitFor(() =>
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument(),
    );
  });

  test("approve calls axios.put with correct params and toast.success with full message", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });
    // spy on axios.put so we can inspect its args
    const putSpy = jest.spyOn(axios, "put").mockResolvedValueOnce({});

    renderPage();

    const cell = await screen.findByTestId("AliasTable-cell-row-0-col-Approve");
    fireEvent.click(within(cell).getByRole("button", { name: "Approve" }));

    // 1) verify the exact call shape…
    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith(
        "/api/currentUser/updateAliasModeration",
        null,
        { params: { id: usersFixtures.threeUsers[0].id, approved: true } },
      );
    });

    // 2) …and that your success‐toast includes both alias AND ID
    expect(toast.success).toHaveBeenCalledWith(
      `Alias "${usersFixtures.threeUsers[0].proposedAlias}" for ID ${usersFixtures.threeUsers[0].id} approved!`,
    );

    putSpy.mockRestore();
  });

  test("reject calls axios.put with correct params and toast.success with full message", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    const putSpy = jest.spyOn(axios, "put").mockResolvedValueOnce({});

    renderPage();

    const cell = await screen.findByTestId("AliasTable-cell-row-0-col-Reject");
    fireEvent.click(within(cell).getByRole("button", { name: "Reject" }));

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith(
        "/api/currentUser/updateAliasModeration",
        null,
        { params: { id: usersFixtures.threeUsers[0].id, approved: false } },
      );
    });

    expect(toast.success).toHaveBeenCalledWith(
      `Alias "${usersFixtures.threeUsers[0].proposedAlias}" for ID ${usersFixtures.threeUsers[0].id} rejected!`,
    );

    putSpy.mockRestore();
  });

  test("fallback error path shows `Unknown error` when err.message is falsy", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    jest.spyOn(axios, "put").mockRejectedValueOnce(new Error());

    renderPage();

    const cell = await screen.findByTestId("AliasTable-cell-row-0-col-Approve");
    fireEvent.click(within(cell).getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Error approving alias: Unknown error",
      );
    });
  });
  test("fallback reject shows Unknown error when err.message is empty", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    jest.spyOn(axios, "put").mockRejectedValueOnce(new Error());

    renderPage();

    const cell = await screen.findByTestId("AliasTable-cell-row-0-col-Reject");
    fireEvent.click(within(cell).getByRole("button", { name: "Reject" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Error rejecting alias: Unknown error",
      );
    });
  });

  test("renders no alias rows when backend returns null data", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    useBackend.mockReturnValueOnce({
      data: null,
      error: null,
      status: "success",
    });

    renderPage();

    await waitFor(() => {
      expect(screen.queryByTestId("AliasTable-row-0")).not.toBeInTheDocument();
    });
  });
  test("hooks into backend with the correct endpoint and options", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    await screen.findByText("Moderation Page");

    expect(useBackend).toHaveBeenCalledWith(
      ["/api/admin/usersWithProposedAlias"],
      { method: "GET", url: "/api/admin/usersWithProposedAlias" },
    );
  });

  //stub currentUser
  test("renders page for moderator user", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 2, admin: false, moderator: true },
      roles: [{ authority: "ROLE_MODERATOR" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    await screen.findByText("Moderation Page");
  });
});
