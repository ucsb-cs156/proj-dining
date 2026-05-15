import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";
import { QueryClient, QueryClientProvider } from "react-query";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

const buildClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

// currentUser whose id matches usersFixtures.threeUsers[0].id (1)
const selfUser = { root: { user: { id: 1 } } };
// currentUser whose id doesn't match any fixture row
const otherUser = { root: { user: { id: 99 } } };

function wrap(ui, client = buildClient()) {
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("UserTable tests", () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    mockedNavigate.mockClear();
  });

  afterEach(() => {
    axiosMock.reset();
    axiosMock.restore();
  });

  test("renders without crashing for empty table", () => {
    wrap(<UsersTable users={[]} />);
  });

  test("renders without crashing for three users", () => {
    wrap(<UsersTable users={usersFixtures.threeUsers} />);
  });

  test("Has the expected column headers and content", () => {
    wrap(<UsersTable users={usersFixtures.threeUsers} />);

    const expectedHeaders = [
      "id",
      "First Name",
      "Last Name",
      "Email",
      "Admin",
      "Moderator",
      "Alias",
      "Proposed Alias",
    ];
    const expectedFields = [
      "id",
      "givenName",
      "familyName",
      "email",
      "admin",
      "moderator",
      "alias",
      "proposedAlias",
    ];
    const testId = "UsersTable";

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-admin`),
    ).toHaveTextContent("true");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-moderator`),
    ).toHaveTextContent("false");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-admin`),
    ).toHaveTextContent("false");
  });

  test("Status column appends approval date only for approved users with a valid date", () => {
    wrap(
      <UsersTable
        users={[
          { id: 1, status: "Approved", dateApproved: "2024-10-31" },
          { id: 2, status: "Approved", dateApproved: null },
          { id: 3, status: "Rejected", dateApproved: "2024-11-01" },
          { id: 4, status: "Awaiting Moderation", dateApproved: null },
        ]}
      />,
    );

    expect(screen.getByText("Approved on 10/31/2024")).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Moderation")).toBeInTheDocument();
  });

  test("Toggle role buttons do not appear when showToggleRoleButtons is false", () => {
    wrap(
      <UsersTable
        users={usersFixtures.threeUsers}
        showToggleRoleButtons={false}
      />,
    );

    expect(
      screen.queryByTestId("UsersTable-cell-row-0-col-Toggle Admin-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("UsersTable-cell-row-0-col-Toggle Moderator-button"),
    ).not.toBeInTheDocument();
  });

  test("Toggle role buttons appear when showToggleRoleButtons is true", () => {
    wrap(
      <UsersTable
        users={usersFixtures.threeUsers}
        showToggleRoleButtons={true}
      />,
    );

    const adminBtn = screen.getByTestId(
      "UsersTable-cell-row-0-col-Toggle Admin-button",
    );
    expect(adminBtn).toBeInTheDocument();
    expect(adminBtn).toHaveClass("btn-primary");
    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-Toggle Moderator-button"),
    ).toBeInTheDocument();
  });

  test("Toggle Admin on another user fires PUT directly without modal", async () => {
    axiosMock
      .onPut("/api/admin/toggleAdmin")
      .reply(200, { ...usersFixtures.threeUsers[0], admin: false });

    wrap(
      <UsersTable
        users={usersFixtures.threeUsers}
        showToggleRoleButtons={true}
        currentUser={otherUser}
      />,
    );

    fireEvent.click(
      screen.getByTestId("UsersTable-cell-row-0-col-Toggle Admin-button"),
    );

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].url).toBe("/api/admin/toggleAdmin");
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
    expect(
      screen.queryByTestId("confirm-admin-toggle-modal"),
    ).not.toBeInTheDocument();
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  test("Toggle Admin on own row shows confirmation modal", () => {
    wrap(
      <UsersTable
        users={usersFixtures.threeUsers}
        showToggleRoleButtons={true}
        currentUser={selfUser}
      />,
    );

    fireEvent.click(
      screen.getByTestId("UsersTable-cell-row-0-col-Toggle Admin-button"),
    );

    expect(
      screen.getByTestId("confirm-admin-toggle-modal"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to toggle admin status for your own account?",
      ),
    ).toBeInTheDocument();
    expect(axiosMock.history.put.length).toBe(0);
  });

  test("Confirmation modal No button closes modal without toggling", () => {
    wrap(
      <UsersTable
        users={usersFixtures.threeUsers}
        showToggleRoleButtons={true}
        currentUser={selfUser}
      />,
    );

    fireEvent.click(
      screen.getByTestId("UsersTable-cell-row-0-col-Toggle Admin-button"),
    );
    expect(
      screen.getByTestId("confirm-admin-toggle-modal"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("confirm-admin-toggle-cancel"));

    expect(
      screen.queryByTestId("confirm-admin-toggle-modal"),
    ).not.toBeInTheDocument();
    expect(axiosMock.history.put.length).toBe(0);
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  test("Confirmation modal Yes button fires PUT and navigates home", async () => {
    axiosMock
      .onPut("/api/admin/toggleAdmin")
      .reply(200, { ...usersFixtures.threeUsers[0], admin: false });

    wrap(
      <UsersTable
        users={usersFixtures.threeUsers}
        showToggleRoleButtons={true}
        currentUser={selfUser}
      />,
    );

    fireEvent.click(
      screen.getByTestId("UsersTable-cell-row-0-col-Toggle Admin-button"),
    );
    fireEvent.click(screen.getByTestId("confirm-admin-toggle-confirm"));

    expect(
      screen.queryByTestId("confirm-admin-toggle-modal"),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].url).toBe("/api/admin/toggleAdmin");
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
    expect(mockedNavigate).toHaveBeenCalledWith("/");
  });

  test("Toggle Admin with currentUser missing root fires PUT without modal", async () => {
    axiosMock
      .onPut("/api/admin/toggleAdmin")
      .reply(200, { ...usersFixtures.threeUsers[0], admin: false });

    wrap(
      <UsersTable
        users={usersFixtures.threeUsers}
        showToggleRoleButtons={true}
        currentUser={{}}
      />,
    );

    fireEvent.click(
      screen.getByTestId("UsersTable-cell-row-0-col-Toggle Admin-button"),
    );

    expect(
      screen.queryByTestId("confirm-admin-toggle-modal"),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].url).toBe("/api/admin/toggleAdmin");
  });

  test("Toggle Moderator button fires PUT to /api/admin/toggleModerator with user id", async () => {
    axiosMock
      .onPut("/api/admin/toggleModerator")
      .reply(200, { ...usersFixtures.threeUsers[0], moderator: true });

    wrap(
      <UsersTable
        users={usersFixtures.threeUsers}
        showToggleRoleButtons={true}
      />,
    );

    const btn = screen.getByTestId(
      "UsersTable-cell-row-0-col-Toggle Moderator-button",
    );
    expect(btn).toHaveClass("btn-primary");

    fireEvent.click(btn);

    await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
    expect(axiosMock.history.put[0].url).toBe("/api/admin/toggleModerator");
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
  });
});
