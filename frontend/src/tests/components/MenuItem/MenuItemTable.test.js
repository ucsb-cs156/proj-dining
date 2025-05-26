import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import MenuItemTable from "../../../main/components/MenuItem/MenuItemTable";
import { menuItemFixtures } from "../../../fixtures/menuItemFixtures";
import AxiosMockAdapter from "axios-mock-adapter";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import {
  apiCurrentUserFixtures,
  currentUserFixtures,
} from "../../../fixtures/currentUserFixtures";
import { systemInfoFixtures } from "../../../fixtures/systemInfoFixtures";

// ✅ Mock useNavigate from react-router-dom
const mockedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("MenuItemTable Tests", () => {
  let axiosMock;

  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    axiosMock.reset();
    mockedNavigate.mockClear();
  });

  test("Headers appear and empty table renders correctly without buttons", async () => {
    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={[]}
          currentUser={currentUserFixtures.notLoggedIn}
        />
        ,
      </MemoryRouter>,
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

  test("Renders 5 Menu Items correctly without buttons", async () => {
    let fiveMenuItems = menuItemFixtures.fiveMenuItems;
    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={fiveMenuItems}
          currentUser={currentUserFixtures.notLoggedIn}
        />
        ,
      </MemoryRouter>,
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

  test("Review Item button navigates to the correct post review page", async () => {
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
        ,
      </MemoryRouter>,
    );

    const button = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-Review Item-button",
    );
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn-warning");

    fireEvent.click(button);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/reviews/post/1");
    });

    let allButton = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-All Reviews-button",
    );
    expect(allButton).toBeInTheDocument();
    expect(allButton).toHaveClass("btn-warning");

    fireEvent.click(allButton);
    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/reviews/1"),
    );
  });
});
