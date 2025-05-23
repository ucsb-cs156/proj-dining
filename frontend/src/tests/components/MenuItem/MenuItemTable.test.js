import {
  fireEvent,
  render,
  waitFor,
  screen,
  within,
} from "@testing-library/react";
import MenuItemTable from "../../../main/components/MenuItem/MenuItemTable";
import { menuItemFixtures } from "../../../fixtures/menuItemFixtures";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  apiCurrentUserFixtures,
  currentUserFixtures,
} from "../../../fixtures/currentUserFixtures";
import { systemInfoFixtures } from "../../../fixtures/systemInfoFixtures";
import { MemoryRouter } from "react-router-dom";

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
    expect(screen.getByTestId("MenuItemTable-header-id")).toHaveTextContent(
      "Reviews",
    );
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
  test("Renders 5 Menu Items Correctly and Reviews link is correct", async () => {
    let fiveMenuItems = menuItemFixtures.fiveMenuItems;
    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={fiveMenuItems}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );

    for (let i = 0; i < fiveMenuItems.length; i++) {
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-name`),
      ).toHaveTextContent(fiveMenuItems[i].name);
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-station`),
      ).toHaveTextContent(fiveMenuItems[i].station);
      const reviewsCell = screen.getByTestId(
        `MenuItemTable-cell-row-${i}-col-id`,
      );
      const link = within(reviewsCell).getByRole("link", { name: "Reviews" });
      expect(link).toHaveTextContent("Reviews");
      expect(link).toHaveAttribute("href", `/reviews/${fiveMenuItems[i].id}`);
      expect(
        screen.queryByTestId("MenuItemTable-cell-row-0-col-Review Item-button"),
      ).not.toBeInTheDocument();
    }
  });

  test("Review Item button appears for ROLE_USER and alert works", async () => {
    const mockAlert = jest.spyOn(window, "alert").mockImplementation(() => {});
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={menuItemFixtures.oneMenuItem}
          currentUser={currentUserFixtures.userOnly}
        />
      </MemoryRouter>,
    );
    let button = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-Review Item-button",
    );
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn-warning");
    expect(button).toHaveTextContent("Review Item");
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockAlert).toBeCalledTimes(1);
    });
    expect(mockAlert).toBeCalledWith("Reviews coming soon!");
  });

  test("Review Item button does not appear for non-ROLE_USER", async () => {
    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={menuItemFixtures.oneMenuItem}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );
    expect(
      screen.queryByTestId("MenuItemTable-cell-row-0-col-Review Item-button"),
    ).not.toBeInTheDocument();
  });
});
