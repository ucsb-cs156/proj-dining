import { render, screen } from "@testing-library/react";
import usersFixtures from "fixtures/usersFixtures";
import UsersTable from "main/components/Users/UsersTable";
import { within } from "storybook/test";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const renderWithProviders = (ui) => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("UserTable tests", () => {
  test("renders without crashing for empty table", () => {
    renderWithProviders(<UsersTable users={[]} />);
  });

  test("renders without crashing for three users", () => {
    renderWithProviders(<UsersTable users={usersFixtures.threeUsers} />);
  });

  test("Has the expected colum headers and content", () => {
    renderWithProviders(<UsersTable users={usersFixtures.threeUsers} />);

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
      "Status",
    ];
    const testId = "UsersTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    // row 0
    const row0 = screen.getByTestId(`${testId}-row-0`);
    expect(
      within(row0).getByRole("checkbox", { name: /admin/i }),
    ).toBeChecked();
    expect(
      within(row0).getByRole("checkbox", { name: /moderator/i }),
    ).not.toBeChecked();

    // row 1
    const row1 = screen.getByTestId(`${testId}-row-1`);
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      within(row1).getByRole("checkbox", { name: /admin/i }),
    ).not.toBeChecked();
    expect(
      within(row1).getByRole("checkbox", { name: /moderator/i }),
    ).toBeChecked();
  });

  test("Status column appends approval date only for approved users with a valid date", () => {
    renderWithProviders(
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

  test("Roles are correctly set on loading the table", () => {
    renderWithProviders(<UsersTable users={usersFixtures.threeUsers} />);

    const row1 = screen.getByTestId("UsersTable-row-0");
    const row2 = screen.getByTestId("UsersTable-row-1");
    const row3 = screen.getByTestId("UsersTable-row-2");

    expect(
      within(row1).getByRole("checkbox", { name: /admin/i }),
    ).toBeChecked();
    expect(
      within(row1).getByRole("checkbox", { name: /moderator/i }),
    ).not.toBeChecked();
    expect(
      within(row2).getByRole("checkbox", { name: /admin/i }),
    ).not.toBeChecked();
    expect(
      within(row2).getByRole("checkbox", { name: /moderator/i }),
    ).toBeChecked();

    expect(
      within(row3).getByRole("checkbox", { name: /admin/i }),
    ).not.toBeChecked();
    expect(
      within(row3).getByRole("checkbox", { name: /moderator/i }),
    ).not.toBeChecked();
  });
});
