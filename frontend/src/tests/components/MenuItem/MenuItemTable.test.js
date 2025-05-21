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
      screen.getByTestId("MenuItemTable-header-averageRating"),
    ).toHaveTextContent("Average Rating");
    expect(
      screen.queryByTestId("MenuItemTable-row-cell-0-col-name"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("MenuItemTable-row-cell-0-col-station"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("MenuItemTable-row-cell-0-col-averageRating"),
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
});
