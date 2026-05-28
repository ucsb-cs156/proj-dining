import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MenuItemTable from "main/components/MenuItem/MenuItemTable";
import { menuItemFixtures } from "fixtures/menuItemFixtures";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { vi } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

describe("MenuItemTable Tests", () => {
  afterEach(() => {
    mockedNavigate.mockClear();
  });

  test("Headers appear and empty table renders correctly without buttons", async () => {
    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={[]}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("MenuItemTable-header-name")).toHaveTextContent(
      "Item Name",
    );
    expect(
      screen.getByTestId("MenuItemTable-header-station"),
    ).toHaveTextContent("Station");
    expect(
      screen.getByTestId("MenuItemTable-header-averageRating"),
    ).toHaveTextContent("Average Rating");
    expect(
      screen.queryByTestId("MenuItemTable-row-cell-0-col-name"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("MenuItemTable-row-cell-0-col-station"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("MenuItemTable-cell-row-0-col-Review Item-button"),
    ).not.toBeInTheDocument();
  });

  test("Renders 5 Menu Items Correctly with ratings", async () => {
    const fiveMenuItems = menuItemFixtures.fiveMenuItems;
    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={fiveMenuItems}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("4.5");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-1-col-averageRating"),
    ).toHaveTextContent("No ratings");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-2-col-averageRating"),
    ).toHaveTextContent("3.5");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-3-col-averageRating"),
    ).toHaveTextContent("5.0");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-4-col-averageRating"),
    ).toHaveTextContent("No ratings");

    for (let i = 0; i < fiveMenuItems.length; i++) {
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-name`),
      ).toHaveTextContent(fiveMenuItems[i].name);
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-station`),
      ).toHaveTextContent(fiveMenuItems[i].station);
    }
  });

  test("calculateAverageRating formats reviewScore with one decimal", () => {
    const items = [
      {
        id: 10,
        name: "Precise Item",
        station: "Station Math",
        reviewScore: 4.45,
      },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={items}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("4.5");
  });

  test("calculateAverageRating shows 'No ratings' when reviewScore is missing", () => {
    const items = [
      {
        id: 11,
        name: "No Ratings Item",
        station: "Station X",
        reviewScore: null,
      },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={items}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("No ratings");
  });

  test("Navigation uses correct menu item id", async () => {
    const items = [
      {
        id: 42,
        name: "Test Item",
        station: "Test Station",
        reviewScore: 4.0,
      },
      {
        id: 43,
        name: "Test Item 2",
        station: "Test Station",
        reviewScore: 3.5,
      },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={items}
          currentUser={currentUserFixtures.userOnly}
        />
      </MemoryRouter>,
    );

    const reviewItemButton = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-Review Item-button",
    );
    const firstItemButton = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-All Reviews-button",
    );
    const secondItemButton = screen.getByTestId(
      "MenuItemTable-cell-row-1-col-All Reviews-button",
    );

    fireEvent.click(reviewItemButton);
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/reviews/post/42"),
    );

    fireEvent.click(firstItemButton);
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/reviews/42"),
    );

    fireEvent.click(secondItemButton);
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/reviews/43"),
    );
  });

  test("does not show buttons when user is not logged in", () => {
    const items = [
      { id: 1, name: "Item A", station: "Station A", reviewScore: 3.2 },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={items}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("MenuItemTable-cell-row-0-col-Review Item-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("MenuItemTable-cell-row-0-col-All Reviews-button"),
    ).not.toBeInTheDocument();
  });

  test("shows buttons when user is logged in", () => {
    const items = [
      { id: 1, name: "Item A", station: "Station A", reviewScore: 3.2 },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={items}
          currentUser={currentUserFixtures.userOnly}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-Review Item-button"),
    ).toHaveClass("btn-warning");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-All Reviews-button"),
    ).toBeInTheDocument();
  });
});
