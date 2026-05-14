import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";

const queryClient = new QueryClient();

const renderWithQueryClient = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
};

describe("UserTable tests", () => {
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
    ];
    const testId = "UsersTable";

    expectedHeaders.forEach((headerText) => {
      const headers = screen.getAllByText(headerText);
      expect(headers.length).toBeGreaterThan(0);
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
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
});