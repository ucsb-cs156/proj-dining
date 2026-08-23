import { render, screen } from "@testing-library/react";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";

describe("UserTable tests", () => {
  test("renders without crashing for empty table", () => {
    render(<UsersTable users={[]} />);
  });

  test("renders without crashing for three users", () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);
  });

  test("Has the expected colum headers and content", () => {
    render(<UsersTable users={usersFixtures.threeUsers} />);

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

  test("Status column appends approval date only for approved users with a valid date", () => {
    render(
      <UsersTable
        users={[
          { id: 1, status: "APPROVED", dateApproved: "2024-10-31" },
          { id: 2, status: "APPROVED", dateApproved: null },
          { id: 3, status: "REJECTED", dateApproved: "2024-11-01" },
          { id: 4, status: "AWAITING_REVIEW", dateApproved: null },
          { id: 5, status: "APPROVED", dateApproved: "not-a-date" },
          { id: 6, status: "APPROVED", dateApproved: "2024-02-31" },
          { id: 7, status: "APPROVED", dateApproved: "0000-01-01" },
          { id: 8, status: "APPROVED", dateApproved: "x2024-10-31" },
          { id: 9, status: "APPROVED", dateApproved: "2024-10-31x" },
          { id: 10, status: "APPROVED", dateApproved: "notadate" },
          { id: 11, status: "APPROVED", dateApproved: "2024-aa-31" },
        ]}
      />,
    );

    expect(screen.getByText("Approved on 10/31/2024")).toBeInTheDocument();
    expect(screen.getAllByText("APPROVED")).toHaveLength(8);
    expect(screen.getByText("REJECTED")).toBeInTheDocument();
    expect(screen.getByText("AWAITING_REVIEW")).toBeInTheDocument();
  });
});
