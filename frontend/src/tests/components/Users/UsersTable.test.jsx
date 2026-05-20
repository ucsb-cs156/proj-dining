import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";
import { toast } from "react-toastify";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";
import { useBackendMutation } from "main/utils/useBackend";

vi.mock("react-toastify", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    toast: vi.fn(),
  };
});

vi.mock("main/utils/useBackend", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useBackendMutation: vi.fn(actual.useBackendMutation),
  };
});

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (ui) => {
  const queryClient = createQueryClient();

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    ),
  };
};

describe("UserTable tests", () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    vi.clearAllMocks();
  });

  afterEach(() => {
    axiosMock.restore();
  });

  test("renders without crashing for empty table", () => {
    renderWithQueryClient(<UsersTable users={[]} />);
  });

  test("renders without crashing for three users", () => {
    renderWithQueryClient(<UsersTable users={usersFixtures.threeUsers} />);
  });

  test("Has the expected colum headers and content", () => {
    renderWithQueryClient(<UsersTable users={usersFixtures.threeUsers} />);

    const expectedHeaders = [
      "id",
      "First Name",
      "Last Name",
      "Email",
      "Admin",
      "Moderator",
      "Alias",
      "Proposed Alias",
      "Status",
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
      const header = screen.getByRole("columnheader", { name: headerText });
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const cell = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(cell).toBeInTheDocument();
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

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-moderator`),
    ).toHaveTextContent("false");
  });

  test("does not show toggle buttons by default", () => {
    renderWithQueryClient(<UsersTable users={usersFixtures.threeUsers} />);

    expect(
      screen.queryByRole("columnheader", { name: "Toggle Admin" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Toggle Moderator" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("UsersTable-cell-row-0-col-toggle-admin-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("UsersTable-cell-row-0-col-toggle-moderator-button"),
    ).not.toBeInTheDocument();
  });

  test("shows toggle columns and buttons when enabled", () => {
    renderWithQueryClient(
      <UsersTable users={usersFixtures.threeUsers} showToggleButtons={true} />,
    );

    expect(
      screen.getByRole("columnheader", { name: "Toggle Admin" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Toggle Moderator" }),
    ).toBeInTheDocument();

    const toggleAdminCell = screen.getByTestId(
      "UsersTable-cell-row-0-col-toggle-admin",
    );

    const toggleModeratorCell = screen.getByTestId(
      "UsersTable-cell-row-0-col-toggle-moderator",
    );

    expect(toggleAdminCell).toBeInTheDocument();
    expect(toggleModeratorCell).toBeInTheDocument();

    expect(
      within(toggleAdminCell).getByRole("button", { name: "Toggle Admin" }),
    ).toBeInTheDocument();

    expect(
      within(toggleModeratorCell).getByRole("button", {
        name: "Toggle Moderator",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-toggle-admin-button"),
    ).toHaveTextContent("Toggle Admin");

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-toggle-moderator-button"),
    ).toHaveTextContent("Toggle Moderator");
  });

  test("useBackendMutation is configured to refresh admin users after toggles", () => {
    renderWithQueryClient(
      <UsersTable users={usersFixtures.threeUsers} showToggleButtons={true} />,
    );

    expect(useBackendMutation).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
      ["/api/admin/users"],
    );

    expect(useBackendMutation).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      expect.objectContaining({
        onSuccess: expect.any(Function),
      }),
      ["/api/admin/users"],
    );
  });

  test("Status column appends approval date only for approved users with a valid date", () => {
    renderWithQueryClient(
      <UsersTable
        users={[
          { id: 1, status: "Approved", dateApproved: "2024-10-31" },
          { id: 2, status: "Approved", dateApproved: null },
          { id: 3, status: "Rejected", dateApproved: "2024-11-01" },
          { id: 4, status: "Awaiting Moderation", dateApproved: null },
          { id: 5, status: "Approved", dateApproved: "not-a-date" },
          { id: 6, status: "Approved", dateApproved: "2024-02-31" },
          { id: 7, status: "Approved", dateApproved: "0000-01-01" },
          { id: 8, status: "Approved", dateApproved: "x2024-10-31" },
          { id: 9, status: "Approved", dateApproved: "2024-10-31x" },
          { id: 10, status: "Approved", dateApproved: "notadate" },
          { id: 11, status: "Approved", dateApproved: "2024-aa-31" },
        ]}
      />,
    );

    expect(screen.getByText("Approved on 10/31/2024")).toBeInTheDocument();
    expect(screen.getAllByText("Approved")).toHaveLength(8);
    expect(screen.getByText("Rejected")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Moderation")).toBeInTheDocument();
  });

  test("Clicking Toggle Admin calls the toggleAdmin endpoint", async () => {
    const { queryClient } = renderWithQueryClient(
      <UsersTable users={usersFixtures.threeUsers} showToggleButtons={true} />,
    );

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    axiosMock.onPut("/api/admin/toggleAdmin").reply((config) => {
      expect(config.params).toEqual({ id: 1 });
      return [200, { ...usersFixtures.threeUsers[0], admin: false }];
    });

    fireEvent.click(
      screen.getByTestId("UsersTable-cell-row-0-col-toggle-admin-button"),
    );

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    expect(axiosMock.history.put[0].url).toBe("/api/admin/toggleAdmin");
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith("Admin status toggled");
    });

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith(["/api/admin/users"]);
    });
  });

  test("Clicking Toggle Moderator calls the toggleModerator endpoint", async () => {
    const { queryClient } = renderWithQueryClient(
      <UsersTable users={usersFixtures.threeUsers} showToggleButtons={true} />,
    );

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    axiosMock.onPut("/api/admin/toggleModerator").reply((config) => {
      expect(config.params).toEqual({ id: 1 });
      return [200, { ...usersFixtures.threeUsers[0], moderator: true }];
    });

    fireEvent.click(
      screen.getByTestId("UsersTable-cell-row-0-col-toggle-moderator-button"),
    );

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    expect(axiosMock.history.put[0].url).toBe("/api/admin/toggleModerator");
    expect(axiosMock.history.put[0].params).toEqual({ id: 1 });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith("Moderator status toggled");
    });

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith(["/api/admin/users"]);
    });
  });
});
