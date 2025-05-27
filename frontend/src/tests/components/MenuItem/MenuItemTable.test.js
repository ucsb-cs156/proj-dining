// src/tests/components/MenuItem/MenuItemTable.test.js

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemTable from "main/components/MenuItem/MenuItemTable";
import { menuItemFixtures } from "../../../fixtures/menuItemFixtures";
import {
  apiCurrentUserFixtures,
  currentUserFixtures,
} from "../../../fixtures/currentUserFixtures";
import { systemInfoFixtures } from "../../../fixtures/systemInfoFixtures";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";

// mock react-router-dom hooks
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...original,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/previous-page" }),
  };
});

describe("MenuItemTable Tests", () => {
  let axiosMock;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    mockNavigate.mockReset();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  test("Headers appear and empty table renders correctly without buttons", () => {
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
      screen.queryByTestId("MenuItemTable-cell-row-0-col-name"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("MenuItemTable-cell-row-0-col-station"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("MenuItemTable-cell-row-0-col-Review Item-button"),
    ).not.toBeInTheDocument();
  });

  test("Renders 5 Menu Items correctly without buttons for anon user", () => {
    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={menuItemFixtures.fiveMenuItems}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );

    menuItemFixtures.fiveMenuItems.forEach((item, i) => {
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-name`),
      ).toHaveTextContent(item.name);
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-station`),
      ).toHaveTextContent(item.station);
    });
    expect(
      screen.queryByTestId("MenuItemTable-cell-row-0-col-Review Item-button"),
    ).not.toBeInTheDocument();
  });

  test("Average Review column renders correct values", () => {
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
      <MemoryRouter>
        <MenuItemTable
          menuItems={items}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );

    // Header
    expect(
      screen.getByTestId("MenuItemTable-header-averageReview"),
    ).toHaveTextContent("Average Review");

    // Pizza: (4+5+3)/3 = 4.0
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("4.0 ⭐");

    // Pasta: no reviews
    expect(
      screen.getByTestId("MenuItemTable-cell-row-1-col-averageReview"),
    ).toHaveTextContent("🤷‍♂️ No Rating");

    // Salad: 2/1 = 2.0
    expect(
      screen.getByTestId("MenuItemTable-cell-row-2-col-averageReview"),
    ).toHaveTextContent("2.0 ⭐");
  });

  test("Average Review handles non-array reviews (Array.isArray false branch)", () => {
    const items = [
      {
        id: 1,
        name: "Mystery Dish",
        station: "Station X",
        reviews: null, // not an array
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
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("🤷‍♂️ No Rating");
  });

  test("Average Review filters out non-numeric stars (isNaN branch)", () => {
    const items = [
      {
        id: 1,
        name: "Quirky Dish",
        station: "Station Y",
        reviews: [
          { itemsStars: "not-a-number" }, // map → null
          { itemsStars: 3 }, // valid
          { itemsStars: "5" }, // valid
        ],
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

    // Only 3 and 5 count → (3+5)/2 = 4.0
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("4.0 ⭐");
  });

  test("Review Item button navigates to create page with correct id and state", async () => {
    // Set up auth calls so that hasRole returns true
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

    const itemId = menuItemFixtures.oneMenuItem[0].id;
    const btn = await screen.findByTestId(
      "MenuItemTable-cell-row-0-col-Review Item-button",
    );
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass("btn-warning");

    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/reviews/create/${itemId}`, {
        state: { from: "/previous-page" },
      });
    });
  });

  test("Rating filter requires ALL conditions to be met (AND vs OR mutation test)", () => {
    // Create items with reviews that would behave differently with && vs ||
    const items = [
      {
        id: 1,
        name: "Item 1",
        station: "Station 1",
        reviews: [
          { itemsStars: null }, // Should be filtered out with either && or ||
          { itemsStars: 0 }, // Should be filtered out with && but kept with ||
          { itemsStars: 6 }, // Should be filtered out with && but kept with ||
          { itemsStars: 3 }, // Valid with either && or ||
        ],
      },
      {
        id: 2,
        name: "Item 2",
        station: "Station 2",
        reviews: [
          { itemsStars: 0 }, // Invalid rating
          { itemsStars: 6 }, // Invalid rating
        ],
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

    // With && (correct): only 3 is valid, so avg = 3.0
    // With || (mutation): 0, 6, and 3 would be valid, so avg would be 3.0
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("3.0 ⭐");

    // With && (correct): No valid ratings, should show "No Rating"
    // With || (mutation): 0 and 6 would be valid, would show some average
    expect(
      screen.getByTestId("MenuItemTable-cell-row-1-col-averageReview"),
    ).toHaveTextContent("🤷‍♂️ No Rating");
  });

  test("Reduce function correctly adds ratings (+ vs - mutation test)", () => {
    // Create items with specific ratings to detect addition vs subtraction
    const items = [
      {
        id: 1,
        name: "Addition Test",
        station: "Math Station",
        reviews: [{ itemsStars: 3 }, { itemsStars: 3 }],
      },
      {
        id: 2,
        name: "Negative Test",
        station: "Math Station",
        reviews: [{ itemsStars: 5 }, { itemsStars: 5 }],
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

    // If using + (correct): (3+3)/2 = 3.0
    // If using - (mutation): (0-3-3)/2 = -3.0 (which would render differently)
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("3.0 ⭐");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).not.toHaveTextContent("-");

    // If using + (correct): (5+5)/2 = 5.0
    // If using - (mutation): (0-5-5)/2 = -5.0 (which would render differently)
    expect(
      screen.getByTestId("MenuItemTable-cell-row-1-col-averageReview"),
    ).toHaveTextContent("5.0 ⭐");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-1-col-averageReview"),
    ).not.toHaveTextContent("-");
  });

  // This test specifically covers the edge case where the reduce sum starts at 0
  test("Reduce function works correctly with initial value of 0", () => {
    // Test with a single rating to ensure the initial value works correctly
    const items = [
      {
        id: 1,
        name: "Single Rating",
        station: "Edge Case Station",
        reviews: [{ itemsStars: 4 }],
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

    // If using + with initial 0: (0+4)/1 = 4.0
    // If using - with initial 0: (0-4)/1 = -4.0
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("4.0 ⭐");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).not.toHaveTextContent("-4.0");
  });

  it("includes 1-star ratings in average", () => {
    const items = [
      {
        id: 1,
        name: "One Star Dish",
        station: "Station X",
        reviews: [
          { itemsStars: 1 }, // crucial value
          { itemsStars: 5 },
        ],
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

    // Average of 1 and 5 = 3.0
    expect(screen.getByText(/3.0 ⭐/)).toBeInTheDocument();
  });

  it("renders 'No Rating' when reviews is not an array", () => {
    const items = [
      {
        id: 1,
        name: "Corrupted Data Dish",
        station: "Station Z",
        reviews: ["this is not an array"], // triggers fallback
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

    // If the fallback is correctly [], it should say "No Rating"
    expect(screen.getByText(/🤷‍♂️ No Rating/)).toBeInTheDocument();

    // If Stryker mutates fallback to ["Stryker was here"], it would likely display something else — fail the test
    expect(screen.queryByText(/Stryker/)).not.toBeInTheDocument();
  });
});
