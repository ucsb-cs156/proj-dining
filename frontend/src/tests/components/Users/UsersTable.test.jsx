import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";
import { toast } from "react-toastify";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";

vi.mock("react-toastify", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    toast: vi.fn(),
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
      "Toggle Admin",
      "Toggle Moderator",
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
      "toggle-admin",
      "toggle-moderator",
    ];
    const testId = "UsersTable";

    expectedHeaders.forEach((headerText) => {
      const headers = screen.getAllByText(headerText);
      expect(headers.length).toBeGreaterThan(0);
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

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-toggle-admin-button"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-toggle-moderator-button"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-toggle-admin-button"),
    ).toHaveTextContent("Toggle Admin");

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-toggle-moderator-button"),
    ).toHaveTextContent("Toggle Moderator");
  });

  test("Status column appends approval date only for approved users with a valid date", () => {
    renderWithQueryClient(
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

  test("Clicking Toggle Admin calls the toggleAdmin endpoint", async () => {
    const { queryClient } = renderWithQueryClient(
      <UsersTable users={usersFixtures.threeUsers} />,
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

    expect(invalidateQueriesSpy).toHaveBeenCalledWith(["/api/admin/users"]);
  });

  test("Clicking Toggle Moderator calls the toggleModerator endpoint", async () => {
    const { queryClient } = renderWithQueryClient(
      <UsersTable users={usersFixtures.threeUsers} />,
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

    expect(invalidateQueriesSpy).toHaveBeenCalledWith(["/api/admin/users"]);
  });
});
