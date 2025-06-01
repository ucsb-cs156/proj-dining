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
import ModeratePage from "main/pages/ModeratePage";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import usersFixtures from "fixtures/usersFixtures";
import { toast } from "react-toastify";

jest.mock("main/layouts/BasicLayout/BasicLayout", () => {
  return ({ children }) => <div data-testid="basic-layout">{children}</div>;
});

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
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderPage = () => {
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ModeratePage />
      </MemoryRouter>
    </QueryClientProvider>
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
      user.root.rolesList.includes(role)
    );
  });

  test("useBackend is called with correct queryKey and axiosParameters", () => {
    renderPage();
    expect(useBackend).toHaveBeenCalledWith(
      ["/api/admin/usersWithProposedAlias"],
      { method: "GET", url: "/api/admin/usersWithProposedAlias" }
    );
  });

  test("renders alias awaiting approval", async () => {
    renderPage();
    expect(await screen.findByText("Ali1")).toBeInTheDocument();
  });

  test("shows 'No aliases awaiting approval' when backend returns empty array", async () => {
    useBackend.mockReturnValueOnce({ data: [], status: "success" });
    renderPage();

    expect(await screen.findByTestId("AliasTable-empty")).toBeInTheDocument();
    expect(
      screen.getByText("No aliases awaiting approval")
    ).toBeInTheDocument();
  });

  test("shows 'No aliases awaiting approval' when backend returns null", async () => {
    useBackend.mockReturnValueOnce({ data: null, status: "success" });
    renderPage();

    expect(await screen.findByTestId("AliasTable-empty")).toBeInTheDocument();
    expect(
      screen.getByText("No aliases awaiting approval")
    ).toBeInTheDocument();
  });

  test("renders for moderator user (not admin)", async () => {
    useCurrentUser.mockReturnValueOnce({
      data: { loggedIn: true, root: { rolesList: ["ROLE_MODERATOR"] } },
    });
    hasRole.mockImplementation((user, role) =>
      user.root.rolesList.includes(role)
    );

    renderPage();
    expect(await screen.findByText("Moderation Page")).toBeInTheDocument();
  });

  test("redirects unauthorized users", async () => {
    useCurrentUser.mockReturnValueOnce({
      data: { loggedIn: true, root: { rolesList: ["ROLE_USER"] } },
    });
    hasRole.mockReturnValue(false);

    renderPage();
    await waitFor(() => {
      expect(
        screen.queryByText("Moderation Page")
      ).not.toBeInTheDocument();
    });
  });

  test("approveMutation.mutate receives correct axios params object", async () => {
    renderPage();

    const calls = useBackendMutation.mock.calls;
    const objectToAxiosParamsApprove = calls[0][0];

    const approveCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Approve"
    );
    const approveButton = within(approveCell).getByRole("button", {
      name: /approve/i,
    });
    fireEvent.click(approveButton);

    const paramsApprove = objectToAxiosParamsApprove(
      usersFixtures.threeUsers[0]
    );
    expect(paramsApprove).toEqual({
      url: "/api/currentUser/updateAliasModeration",
      method: "PUT",
      params: { id: usersFixtures.threeUsers[0].id, approved: true },
    });

    expect(mutateMock).toHaveBeenCalledWith(usersFixtures.threeUsers[0]);
  });

  test("rejectMutation.mutate receives correct axios params object", async () => {
    renderPage();

    const calls = useBackendMutation.mock.calls;
    const objectToAxiosParamsReject = calls[1][0];

    const rejectCell = await screen.findByTestId(
      "AliasTable-cell-row-0-col-Reject"
    );
    const rejectButton = within(rejectCell).getByRole("button", {
      name: /reject/i,
    });
    fireEvent.click(rejectButton);

    const paramsReject = objectToAxiosParamsReject(
      usersFixtures.threeUsers[0]
    );
    expect(paramsReject).toEqual({
      url: "/api/currentUser/updateAliasModeration",
      method: "PUT",
      params: { id: usersFixtures.threeUsers[0].id, approved: false },
    });

    expect(mutateMock).toHaveBeenCalledWith(usersFixtures.threeUsers[0]);
  });

  test("displays toast.success on approve success", () => {
    useBackendMutation.mockImplementation((fn, key, options) => ({
      mutate: () => options.onSuccess({}, usersFixtures.threeUsers[0]),
    }));

    renderPage();
    const approveCell = screen.getByTestId("AliasTable-cell-row-0-col-Approve");
    const approveButton = within(approveCell).getByRole("button", {
      name: /approve/i,
    });
    fireEvent.click(approveButton);

    expect(toast.success).toHaveBeenCalledWith(
      'Alias "Ali1" for ID 1 approved!'
    );
  });

  test("displays toast.error on approve error", () => {
    useBackendMutation.mockImplementation((fn, key, options) => ({
      mutate: () => options.onError(new Error("Some approve error")),
    }));

    renderPage();
    const approveCell = screen.getByTestId("AliasTable-cell-row-0-col-Approve");
    const approveButton = within(approveCell).getByRole("button", {
      name: /approve/i,
    });
    fireEvent.click(approveButton);

    expect(toast.error).toHaveBeenCalledWith(
      "Error approving alias: Some approve error"
    );
  });

  test("displays toast.success on reject success", () => {
    useBackendMutation.mockImplementation((fn, key, options) => ({
      mutate: () => options.onSuccess({}, usersFixtures.threeUsers[0]),
    }));

    renderPage();
    const rejectCell = screen.getByTestId("AliasTable-cell-row-0-col-Reject");
    const rejectButton = within(rejectCell).getByRole("button", {
      name: /reject/i,
    });
    fireEvent.click(rejectButton);

    expect(toast.success).toHaveBeenCalledWith(
      'Alias "Ali1" for ID 1 rejected!'
    );
  });

  test("displays toast.error on reject error", () => {
    useBackendMutation.mockImplementation((fn, key, options) => ({
      mutate: () => options.onError(new Error("Some reject error")),
    }));

    renderPage();
    const rejectCell = screen.getByTestId("AliasTable-cell-row-0-col-Reject");
    const rejectButton = within(rejectCell).getByRole("button", {
      name: /reject/i,
    });
    fireEvent.click(rejectButton);

    expect(toast.error).toHaveBeenCalledWith(
      "Error rejecting alias: Some reject error"
    );
  });

  test("useBackendMutation is called with correct query key (should not be [] or [''])", () => {
    renderPage();

    const calls = useBackendMutation.mock.calls;
    expect(calls.length).toBe(2);

    const approveQueryKey = calls[0][1];
    expect(approveQueryKey).toEqual(["/api/admin/usersWithProposedAlias"]);

    const rejectQueryKey = calls[1][1];
    expect(rejectQueryKey).toEqual(["/api/admin/usersWithProposedAlias"]);
  });

  test("displays 'Unknown error' when approve error has no message", () => {
    useBackendMutation.mockImplementation((fn, key, options) => ({
      mutate: () => options.onError(new Error()),
    }));

    renderPage();
    const approveCell = screen.getByTestId("AliasTable-cell-row-0-col-Approve");
    const approveButton = within(approveCell).getByRole("button", {
      name: /approve/i,
    });
    fireEvent.click(approveButton);

    expect(toast.error).toHaveBeenCalledWith(
      "Error approving alias: Unknown error"
    );
  });

  test("displays 'Unknown error' when reject error has no message", () => {
    useBackendMutation.mockImplementation((fn, key, options) => ({
      mutate: () => options.onError(new Error()),
    }));

    renderPage();
    const rejectCell = screen.getByTestId("AliasTable-cell-row-0-col-Reject");
    const rejectButton = within(rejectCell).getByRole("button", {
      name: /reject/i,
    });
    fireEvent.click(rejectButton);

    expect(toast.error).toHaveBeenCalledWith(
      "Error rejecting alias: Unknown error"
    );
  });
});
