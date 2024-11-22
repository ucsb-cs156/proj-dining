import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { menuItemFixtures } from "fixtures/menuItemFixtures";
import MenuItemsTable from "main/components/MenuItems/MenuItemsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemsTable
            menuItems={menuItemFixtures.threeMenuItems}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "DiningCommonsCode",
      "Meal",
      "ItemName",
      "Station",
    ];
    const expectedFields = [
      "id",
      "diningCommonsCode",
      "meal",
      "itemName",
      "station",
    ];
    const testId = "MenuItemsTable";

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
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    const reviewButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Review this item-button`,
    );
    expect(reviewButton).toBeInTheDocument();
    expect(reviewButton).toHaveClass("btn-primary");
  });

  test("Review this item button brings up a window.alert('Feature coming soon!') message", async () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemsTable
            menuItems={menuItemFixtures.threeMenuItems}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`MenuItemsTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const reviewButton = screen.getByTestId(
      `MenuItemsTable-cell-row-0-col-Review this item-button`,
    );
    expect(reviewButton).toBeInTheDocument();

    const alertMock = jest.spyOn(window, "alert").mockImplementation();
    fireEvent.click(reviewButton);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Feature coming soon!"),
    );
    expect(alertMock).toHaveBeenCalledTimes(1);
  });
});
