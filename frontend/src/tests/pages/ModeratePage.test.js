import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
jest.mock("main/layouts/BasicLayout/BasicLayout", () => {
  return ({ children, ...props }) => {
    return <div data-testid="basic-layout">{children}</div>;
  };
});
import ModeratePage from "main/pages/ModeratePage";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import usersFixtures from "fixtures/usersFixtures";
import { toast } from "react-toastify";

jest.mock("main/utils/useBackend", () => ({
  useBackend: jest.fn(),
  useBackendMutation: jest.fn(),
}));

jest.mock("main/utils/currentUser", () => ({
  useCurrentUser: jest.fn(),
  hasRole: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderPage = () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModeratePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("ModeratePage", () => {
  const mutateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useBackend.mockReturnValue({
      data: [usersFixtures.threeUsers[0]],
      status: "success",
    });

    useBackendMutation.mockReturnValue({ mutate: mutateMock });

    useCurrentUser.mockReturnValue({
      data: { loggedIn: true, root: { rolesList: ["ROLE_ADMIN"] } },
    });

    hasRole.mockImplementation((user, role) =>
      user.root.rolesList.includes(role),
    );
  });

  test("renders alias awaiting approval", async () => {
    renderPage();
    expect(await screen.findByText("Ali1")).toBeInTheDocument();
  });

  test("approves alias successfully", async () => {
    renderPage();
    const approveCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Approve",
    );
    fireEvent.click(within(approveCell).getByRole("button"));
    expect(mutateMock).toHaveBeenCalledWith(usersFixtures.threeUsers[0]);
  });

  test("rejects alias successfully", async () => {
    renderPage();
    const rejectCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Reject",
    );
    fireEvent.click(within(rejectCell).getByRole("button"));
    expect(mutateMock).toHaveBeenCalledWith(usersFixtures.threeUsers[0]);
  });

  test("displays toast on approve success", () => {
    useBackendMutation.mockImplementation(
      (objectToAxiosParams, queryKey, options) => ({
        mutate: () => options.onSuccess({}, usersFixtures.threeUsers[0]),
      }),
    );

    renderPage();

    fireEvent.click(
      screen
        .getByTestId("AliasTable-cell-row-0-col-Approve")
        .querySelector("button"),
    );

    expect(toast.success).toHaveBeenCalledWith(
      'Alias "Ali1" for ID 1 approved!',
    );
  });

  test("displays toast on reject error", () => {
    useBackendMutation.mockImplementation(
      (objectToAxiosParams, queryKey, options) => ({
        mutate: () => options.onError(new Error("Network error")),
      }),
    );

    renderPage();

    fireEvent.click(
      screen
        .getByTestId("AliasTable-cell-row-0-col-Reject")
        .querySelector("button"),
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Error rejecting alias: Network error",
    );
  });

  test("redirects unauthorized users", async () => {
    useCurrentUser.mockReturnValueOnce({
      data: { loggedIn: true, root: { rolesList: ["ROLE_USER"] } },
    });
    hasRole.mockReturnValue(false);

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText("Moderation Page")).not.toBeInTheDocument();
    });
  });
});
