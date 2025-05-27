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
  let putSpy;

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

    useBackend.mockReturnValue({
      data: usersFixtures.threeUsers,
      error: null,
      status: "success",
    });

    putSpy = jest.spyOn(axios, "put").mockResolvedValue({});
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

  test("approve triggers correct axios call and success toast", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    const approveCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Approve",
    );
    const approveButton = within(approveCell).getByRole("button", {
      name: "Approve",
    });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith(
        "/api/currentUser/updateAliasModeration",
        null,
        { params: { id: usersFixtures.threeUsers[0].id, approved: true } },
      );
      expect(toast.success).toHaveBeenCalledWith(
        `Alias "${usersFixtures.threeUsers[0].proposedAlias}" for ID ${usersFixtures.threeUsers[0].id} approved!`,
      );
    });
  });

  test("approve triggers error toast when axios.put fails", async () => {
    putSpy.mockRejectedValue(new Error("Network error"));
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

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
        expect.stringContaining("Error approving alias"),
      ),
    );
  });

  test("reject triggers correct axios call and success toast", async () => {
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

    renderPage();

    const rejectCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Reject",
    );
    const rejectButton = within(rejectCell).getByRole("button", {
      name: "Reject",
    });
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(putSpy).toHaveBeenCalledWith(
        "/api/currentUser/updateAliasModeration",
        null,
        { params: { id: usersFixtures.threeUsers[0].id, approved: false } },
      );
      expect(toast.success).toHaveBeenCalledWith(
        `Alias "${usersFixtures.threeUsers[0].proposedAlias}" for ID ${usersFixtures.threeUsers[0].id} rejected!`,
      );
    });
  });

  test("reject triggers error toast when axios.put fails", async () => {
    putSpy.mockRejectedValue(new Error("Network error"));
    axiosMock.onGet("/api/currentUser").reply(200, {
      user: { id: 1, email: "admin@ucsb.edu", admin: true },
      roles: [{ authority: "ROLE_ADMIN" }],
      loggedIn: true,
    });
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, { springH2ConsoleEnabled: false });

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
        expect.stringContaining("Error rejecting alias"),
      ),
    );
  });
});
