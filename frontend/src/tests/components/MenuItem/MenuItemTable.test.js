import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import MenuItemTable from "../../../main/components/MenuItem/MenuItemTable";
import { menuItemFixtures } from "../../../fixtures/menuItemFixtures";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  apiCurrentUserFixtures,
  currentUserFixtures,
} from "../../../fixtures/currentUserFixtures";
import { systemInfoFixtures } from "../../../fixtures/systemInfoFixtures";

describe("MenuItemTable Tests", () => {
  let axiosMock;

  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
  });
  afterEach(() => {
    axiosMock.reset();
  });
  test("Headers appear and empty table renders correctly without buttons", async () => {
    render(
      <MenuItemTable
        menuItems={[]}
        currentUser={currentUserFixtures.notLoggedIn}
      />,
    );

    expect(screen.getByTestId("MenuItemTable-header-name")).toHaveTextContent(
      "Item Name",
    );
    expect(
      screen.getByTestId("MenuItemTable-header-station"),
    ).toHaveTextContent("Station");
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
  test("Renders 5 Menu Items Correctly correctly without buttons", async () => {
    let fiveMenuItems = menuItemFixtures.fiveMenuItems;
    render(
      <MenuItemTable
        menuItems={fiveMenuItems}
        currentUser={currentUserFixtures.notLoggedIn}
      />,
    );

    for (let i = 0; i < fiveMenuItems.length; i++) {
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-name`),
      ).toHaveTextContent(fiveMenuItems[i].name);
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-station`),
      ).toHaveTextContent(fiveMenuItems[i].station);
      expect(
        screen.queryByTestId("MenuItemTable-cell-row-0-col-Review Item-button"),
      ).not.toBeInTheDocument();
    }
  });

  test("Buttons work correctly", async () => {
    const mockAlert = jest.spyOn(window, "alert").mockImplementation(() => {});
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    render(
      <MenuItemTable
        menuItems={menuItemFixtures.oneMenuItem}
        currentUser={currentUserFixtures.userOnly}
      />,
    );
    let button = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-Review Item-button",
    );
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn-warning");

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAlert).toBeCalledTimes(1);
    });
    expect(mockAlert).toBeCalledWith("Reviews coming soon!");
  });

  test("Average Review column renders correct values", async () => {
    const items = [
      {
        id: 1,
        name: "Pizza",
        station: "Station A",
        reviews: [{ itemsStars: 4 }, { itemsStars: 5 }, { itemsStars: 3 }],
      },
      {
        id: 2,
        name: "Pasta",
        station: "Station B",
        reviews: [], // No reviews
      },
      {
        id: 3,
        name: "Salad",
        station: "Station C",
        reviews: [{ itemsStars: 2 }],
      },
    ];

    render(
      <MenuItemTable
        menuItems={items}
        currentUser={currentUserFixtures.notLoggedIn}
      />,
    );

    // Check header
    expect(
      screen.getByTestId("MenuItemTable-header-averageReview"),
    ).toHaveTextContent("Average Review");

    const pizzaCell = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-averageReview",
    );
    expect(pizzaCell).toHaveTextContent("4.0 ⭐");
    expect(pizzaCell.textContent).not.toMatch(/^\s*-/);
    const parsed = parseFloat(pizzaCell.textContent || "");
    expect(parsed).toBeCloseTo(4.0);

    // Row 1: Pasta => No reviews
    expect(
      screen.getByTestId("MenuItemTable-cell-row-1-col-averageReview"),
    ).toHaveTextContent("🤷‍♂️ No Rating");

    // Row 2: Salad => (2) / 1 = 2.0
    expect(
      screen.getByTestId("MenuItemTable-cell-row-2-col-averageReview"),
    ).toHaveTextContent("2.0 ⭐");
  });
});
