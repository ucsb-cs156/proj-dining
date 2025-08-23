import { vi } from "vitest";
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
const mockedNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  ...await vi.importActual("react-router-dom"),
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

    expect(
      screen.getByTestId(`MenuItemTable-cell-row-0-col-averageRating`),
    ).toHaveTextContent("4.5");
    expect(
      screen.getByTestId(`MenuItemTable-cell-row-1-col-averageRating`),
    ).toHaveTextContent("No reviews");
    expect(
      screen.getByTestId(`MenuItemTable-cell-row-2-col-averageRating`),
    ).toHaveTextContent("3.5");
    expect(
      screen.getByTestId(`MenuItemTable-cell-row-3-col-averageRating`),
    ).toHaveTextContent("5.0");
    expect(
      screen.getByTestId(`MenuItemTable-cell-row-4-col-averageRating`),
    ).toHaveTextContent("No reviews");

    for (let i = 0; i < fiveMenuItems.length; i++) {
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-name`),
      ).toHaveTextContent(fiveMenuItems[i].name);
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-station`),
      ).toHaveTextContent(fiveMenuItems[i].station);
    }
  });

  test("calculateAverageRating handles edge cases correctly", async () => {
    const edgeCaseItems = [
      {
        id: 1,
        name: "Test Item 1",
        station: "Test Station",
        reviews: [{}, { itemsStars: null }], // Should show "No ratings"
      },
      {
        id: 2,
        name: "Test Item 2",
        station: "Test Station",
        reviews: [null, { itemsStars: 5 }], // Should still calculate average from valid rating
      },
      {
        id: 3,
        name: "Test Item 3",
        station: "Test Station",
        reviews: ["not an object", { itemsStars: 4 }], // Should handle invalid review objects
      },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={edgeCaseItems}
          currentUser={currentUserFixtures.notLoggedIn}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId(`MenuItemTable-cell-row-0-col-averageRating`),
    ).toHaveTextContent("No ratings");
    expect(
      screen.getByTestId(`MenuItemTable-cell-row-1-col-averageRating`),
    ).toHaveTextContent("5.0");
    expect(
      screen.getByTestId(`MenuItemTable-cell-row-2-col-averageRating`),
    ).toHaveTextContent("4.0");
  });

  test("Navigation uses correct menu item id", async () => {
    const items = [
      { id: 42, name: "Test Item", station: "Test Station", reviews: [] },
      { id: 43, name: "Test Item 2", station: "Test Station", reviews: [] },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable
          menuItems={items}
          currentUser={currentUserFixtures.userOnly}
        />
      </MemoryRouter>,
    );

    const firstItemButton = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-All Reviews-button",
    );
    const secondItemButton = screen.getByTestId(
      "MenuItemTable-cell-row-1-col-All Reviews-button",
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

  test("calculateAverageRating ignores non-number ratings", () => {
    const items = [
      {
        id: 1,
        name: "Mixed Reviews",
        station: "Mixed Station",
        reviews: [
          { itemsStars: 4 },
          { itemsStars: null },
          { itemsStars: "bad" },
          {}, // empty object
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

    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("4.5");
  });

  test("returns 'No ratings' if all reviews are invalid", () => {
    const items = [
      {
        id: 2,
        name: "No Ratings",
        station: "Station X",
        reviews: [{}, { itemsStars: null }, "bad"],
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

  test("calculates average rating with correct math and precision", () => {
    const items = [
      {
        id: 3,
        name: "Precise Item",
        station: "Station Math",
        reviews: [{ itemsStars: 5 }, { itemsStars: 4 }, { itemsStars: 3 }],
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

    // (5 + 4 + 3) / 3 = 4.0
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("4.0");
  });

  test("does not show buttons when user is not logged in", () => {
    const items = [
      { id: 1, name: "Item A", station: "Station A", reviews: [] },
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

  test("returns 'No reviews' when reviews is not an array", () => {
    const items = [
      {
        id: 1,
        name: "Invalid Reviews",
        station: "Station A",
        reviews: "not an array",
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
    ).toHaveTextContent("No reviews");
  });

  test("ignores non-object entries in reviews array", () => {
    const items = [
      {
        id: 2,
        name: "Non-Object Reviews",
        station: "Station B",
        reviews: [null, 123, "bad", { itemsStars: 5 }],
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
    ).toHaveTextContent("5.0");
  });

  test("calculates average rating correctly using addition", () => {
    const items = [
      {
        id: 3,
        name: "Addition Check",
        station: "Station C",
        reviews: [{ itemsStars: 2 }, { itemsStars: 4 }],
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
    ).toHaveTextContent("3.0");
  });

  // Additional test cases to kill the survived mutants

  test("calculateAverageRating handles truthy non-object values in reviews", () => {
    const items = [
      {
        id: 1,
        name: "Test Item",
        station: "Test Station",
        reviews: [
          { itemsStars: 4 },
          true, // truthy but not an object
          1, // truthy but not an object
          "string", // truthy but not an object
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

    // Should only use the valid object reviews: (4 + 5) / 2 = 4.5
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("4.5");
  });

  test("calculateAverageRating performs correct arithmetic operation", () => {
    const items = [
      {
        id: 1,
        name: "Arithmetic Test",
        station: "Math Station",
        reviews: [{ itemsStars: 10 }, { itemsStars: 5 }],
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

    // If using addition: (10 + 5) / 2 = 7.5
    // If using subtraction: (10 - 5) / 2 = 2.5
    // This test will fail if subtraction is used instead of addition
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("7.5");
  });

  // Additional test cases to kill the survived mutants

  // Test case 1: Kill the ArithmeticOperator mutant by ensuring no zero ratings
  test("calculateAverageRating arithmetic with non-zero values", () => {
    const items = [
      {
        id: 1,
        name: "Non-Zero Test",
        station: "Test Station",
        reviews: [
          { itemsStars: 1 }, // Single non-zero value
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

    // Addition: 1/1 = 1.0
    // Subtraction: (0-1)/1 = -1.0 (would display as "-1.0")
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("1.0");
  });

  // Test case 2: Another arithmetic test with guaranteed positive result
  test("calculateAverageRating correctly adds multiple positive ratings", () => {
    const items = [
      {
        id: 1,
        name: "Multiple Positive",
        station: "Test Station",
        reviews: [{ itemsStars: 3 }, { itemsStars: 4 }, { itemsStars: 5 }],
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

    // Addition: (3 + 4 + 5)/3 = 4.0
    // Subtraction: ((3 - 4) - 5)/3 = -2.0
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("4.0");
  });

  // Test case 3: Kill ConditionalExpression mutant with edge case object
  // We need an object that would pass the mutant filter but fail the original
  // This is tricky because of JavaScript's property access behavior...
  test("calculateAverageRating handles Date objects in reviews", () => {
    const dateObj = new Date();
    dateObj.itemsStars = 4.5; // Add itemsStars property to Date object

    const items = [
      {
        id: 1,
        name: "Date Object Test",
        station: "Test Station",
        reviews: [
          { itemsStars: 2 },
          dateObj, // Date is typeof "object" and has itemsStars as number
          { itemsStars: 6 },
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

    // Both original and mutant would include the Date object
    // Original: (2 + 4.5 + 6)/3 = 4.2
    // Mutant: same result
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("4.2");
  });

  // Test case 4: Force a specific scenario for ConditionalExpression
  // Try to create a case where object type checking matters
  test("calculateAverageRating properly validates object types", () => {
    // Create a function that has itemsStars property
    const func = function () {
      return "test";
    };
    func.itemsStars = 3.5;

    const items = [
      {
        id: 1,
        name: "Function Property Test",
        station: "Test Station",
        reviews: [
          { itemsStars: 4 },
          func, // Function with itemsStars property (typeof "function", not "object")
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

    // Original filter: r && typeof r === "object" && typeof r.itemsStars === "number"
    // Would exclude function: (4 + 5)/2 = 4.5

    // Mutant filter: r && true && typeof r.itemsStars === "number"
    // Would include function: (4 + 3.5 + 5)/3 = 4.2

    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("4.5"); // Should exclude the function
  });

  // Test case 5: Test with RegExp object (also typeof "object")
  test("calculateAverageRating handles RegExp objects correctly", () => {
    const regexObj = /test/;
    regexObj.itemsStars = 2.5;

    const items = [
      {
        id: 1,
        name: "RegExp Test",
        station: "Test Station",
        reviews: [
          { itemsStars: 3 },
          regexObj, // RegExp is typeof "object" and has itemsStars
          { itemsStars: 4 },
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

    // Both filters should include RegExp (it is typeof "object")
    // (3 + 2.5 + 4)/3 = 3.2
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("3.2");
  });

  // Test case 6: Most critical - ensure non-zero ratings to kill arithmetic mutant
  test("calculateAverageRating with single positive rating shows positive result", () => {
    const items = [
      {
        id: 1,
        name: "Single Positive Rating",
        station: "Test Station",
        reviews: [{ itemsStars: 7 }],
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

    // Addition: 7/1 = 7.0
    // Subtraction: (0-7)/1 = -7.0
    // The key is that the display would show "-7.0" for subtraction
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("7.0");

    // Also ensure it doesn't contain negative sign
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).not.toHaveTextContent("-");
  });

  // Test case 7: Verify the calculation never produces negative averages
  test("calculateAverageRating always produces positive averages from positive ratings", () => {
    const items = [
      {
        id: 1,
        name: "Always Positive Test",
        station: "Test Station",
        reviews: [{ itemsStars: 2 }, { itemsStars: 3 }],
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

    // Addition: (2 + 3)/2 = 2.5
    // Subtraction: (2 - 3)/2 = -0.5
    const avgElement = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-averageRating",
    );
    expect(avgElement).toHaveTextContent("2.5");

    // Verify no negative sign appears
    expect(avgElement.textContent).not.toMatch(/-/);
  });

  test("calculateAverageRating handles function values in reviews array", () => {
    const items = [
      {
        id: 1,
        name: "Function Test",
        station: "Test Station",
        reviews: [
          { itemsStars: 3 },
          function () {
            return "I'm a function";
          }, // truthy but not an object
          { itemsStars: 4 },
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

    // Should only use valid object reviews: (3 + 4) / 2 = 3.5
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("3.5");
  });

  test("calculateAverageRating handles array values in reviews array", () => {
    const items = [
      {
        id: 1,
        name: "Array Test",
        station: "Test Station",
        reviews: [
          { itemsStars: 2 },
          [1, 2, 3], // truthy but wrong type of object (array)
          { itemsStars: 6 },
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

    // Should only use valid object reviews: (2 + 6) / 2 = 4.0
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("4.0");
  });

  test("calculateAverageRating uses addition not subtraction for sum", () => {
    const items = [
      {
        id: 1,
        name: "Sum Verification",
        station: "Test Station",
        reviews: [{ itemsStars: 1 }, { itemsStars: 2 }, { itemsStars: 3 }],
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

    // Addition: (1 + 2 + 3) / 3 = 2.0
    // Subtraction: ((1 - 2) - 3) / 3 = -1.3
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageRating"),
    ).toHaveTextContent("2.0");
  });

  test("Buttons work correctly", async () => {
    const _mockAlert = vi.spyOn(window, "alert").mockImplementation(() => {});

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
