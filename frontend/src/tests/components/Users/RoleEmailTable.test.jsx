import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";
import RoleEmailTable from "main/components/Users/RoleEmailTable";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("RoleEmailTable tests", () => {
  const testIdPrefix = "RoleEmailTable";
  const deleteEndpoint = "/api/admin/delete";
  const getEndpoint = "/api/admin/all";

  const threeEmails = [
    { email: "admin1@ucsb.edu", isInAdminEmails: false },
    { email: "admin2@ucsb.edu", isInAdminEmails: false },
    { email: "superadmin@ucsb.edu", isInAdminEmails: true },
  ];

  test("renders the Email and Delete column headers and content", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <RoleEmailTable
          data={threeEmails}
          deleteEndpoint={deleteEndpoint}
          getEndpoint={getEndpoint}
          testIdPrefix={testIdPrefix}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testIdPrefix}-header-delete`),
    ).toHaveTextContent("Delete");
    expect(
      screen.getByTestId(`${testIdPrefix}-cell-row-0-col-email`),
    ).toHaveTextContent("admin1@ucsb.edu");
    expect(
      screen.queryByTestId("RoleEmailDeleteModal"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId(`${testIdPrefix}-cell-row-1-col-email`),
    ).toHaveTextContent("admin2@ucsb.edu");
    expect(
      screen.getByTestId(`${testIdPrefix}-cell-row-2-col-email`),
    ).toHaveTextContent("superadmin@ucsb.edu");
  });

  test("renders empty table when data is undefined", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <RoleEmailTable
          data={undefined}
          deleteEndpoint={deleteEndpoint}
          getEndpoint={getEndpoint}
          testIdPrefix={testIdPrefix}
        />
      </QueryClientProvider>,
    );

    expect(
      screen.queryByTestId(`${testIdPrefix}-cell-row-0-col-email`),
    ).not.toBeInTheDocument();
  });

  test("rows with isInAdminEmails=true show the cannot-delete indicator instead of a Delete button", () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <RoleEmailTable
          data={threeEmails}
          deleteEndpoint={deleteEndpoint}
          getEndpoint={getEndpoint}
          testIdPrefix={testIdPrefix}
        />
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId(`${testIdPrefix}-cell-row-2-cannot-delete`),
    ).toHaveTextContent("ADMIN_EMAILS");
    expect(
      screen.queryByTestId(`${testIdPrefix}-cell-row-2-col-delete-button`),
    ).not.toBeInTheDocument();
  });

  test("clicking Delete opens a confirmation modal; canceling does not delete", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <RoleEmailTable
          data={threeEmails}
          deleteEndpoint={deleteEndpoint}
          getEndpoint={getEndpoint}
          testIdPrefix={testIdPrefix}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(
      screen.getByTestId(`${testIdPrefix}-cell-row-0-col-delete-button`),
    );
    const modal = screen.getByTestId("RoleEmailDeleteModal");
    expect(modal).toBeInTheDocument();
    expect(within(modal).getByText("admin1@ucsb.edu")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("RoleEmailDeleteModal-cancel"));
    await waitFor(() =>
      expect(
        screen.queryByTestId("RoleEmailDeleteModal"),
      ).not.toBeInTheDocument(),
    );
  });

  test("confirming delete calls the delete endpoint with the email and shows a toast", async () => {
    const queryClient = new QueryClient();
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete(deleteEndpoint)
      .reply(200, { message: "Admin with id admin1@ucsb.edu deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <RoleEmailTable
          data={threeEmails}
          deleteEndpoint={deleteEndpoint}
          getEndpoint={getEndpoint}
          testIdPrefix={testIdPrefix}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(
      screen.getByTestId(`${testIdPrefix}-cell-row-0-col-delete-button`),
    );
    fireEvent.click(screen.getByTestId("RoleEmailDeleteModal-confirm"));

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({
      email: "admin1@ucsb.edu",
    });
    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        "Admin with id admin1@ucsb.edu deleted",
      ),
    );
  });

  test("uses a default toast message when the response has no message", async () => {
    const queryClient = new QueryClient();
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock.onDelete(deleteEndpoint).reply(200);

    render(
      <QueryClientProvider client={queryClient}>
        <RoleEmailTable
          data={threeEmails}
          deleteEndpoint={deleteEndpoint}
          getEndpoint={getEndpoint}
          testIdPrefix={testIdPrefix}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(
      screen.getByTestId(`${testIdPrefix}-cell-row-0-col-delete-button`),
    );
    fireEvent.click(screen.getByTestId("RoleEmailDeleteModal-confirm"));

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith("Deleted"));
  });
});
