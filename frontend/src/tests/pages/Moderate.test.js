import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router"; // 使用你的结构
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import Moderate from "main/pages/Moderate";
import { useBackend } from "main/utils/useBackend";
import { toast } from "react-toastify";
import usersFixtures from "fixtures/usersFixtures";

// Mock useBackend
jest.mock("main/utils/useBackend", () => ({
  useBackend: jest.fn(),
}));
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

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
    queryClient.clear();

    // 一致性mock useBackend返回数据
    useBackend.mockReturnValue({
      data: usersFixtures.threeUsers,
      error: null,
      status: "success",
    });
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
    await screen.findByText("Moderation Page");
    expect(
      screen.getByText(
        "This page is accessible only to admins and moderators. (Placeholder)",
      ),
    ).toBeInTheDocument();
  });

  test("triggers toast when clicking approve/reject", async () => {
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

    const approveCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Approve",
    );
    const approveButton = within(approveCell).getByRole("button", {
      name: "Approve",
    });
    fireEvent.click(approveButton);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());

    const rejectCell = screen.getByTestId("AliasTable-cell-row-0-col-Reject");
    const rejectButton = within(rejectCell).getByRole("button", {
      name: "Reject",
    });
    fireEvent.click(rejectButton);
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
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
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument();
    });
  });

  test("redirects when currentUser is undefined", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, null);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    await waitFor(() => {
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument();
    });
  });

  test("redirects when currentUser.loggedIn is undefined", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, { loggedIn: undefined });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    await waitFor(() => {
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument();
    });
  });

  test("handles case where currentUser is null and skips hasRole", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, { loggedIn: false });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();
    await waitFor(() => {
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument();
    });
  });
});
