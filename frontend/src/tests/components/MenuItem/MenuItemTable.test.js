import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { QueryClient, QueryClientProvider } from "react-query";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";
import { extractAllReviewsForItem } from "main/components/MenuItem/MenuItemTable";
import MenuItemTable from "main/components/MenuItem/MenuItemTable";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = jest.fn();
const mockLocation = { pathname: "/menu-items" };

// One and only one mock for all of react-router-dom
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...original,
    useParams: () => ({
      "date-time": "2025-03-11",
      "dining-commons-code": "carrillo",
      meal: "breakfast",
    }),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

describe("MenuItemPage", () => {
  let axiosMock;
  let queryClient;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient();
  });

  afterEach(() => {
    axiosMock.restore();
  });

  test("MenuItemPage works with no backend", async () => {
    axiosMock
      .onGet("/api/diningcommons/2025-03-11/carrillo/breakfast")
      .timeout();
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(3);
    });

    expect(screen.getByText("Breakfast")).toBeInTheDocument();
    expect(
      screen.queryByText("MenuItemTable-cell-header-col-name"),
    ).not.toBeInTheDocument();
  });

  test("MenuItemPage renders average stars correctly for menu items", async () => {
    axiosMock
      .onGet("/api/diningcommons/2025-03-11/carrillo/breakfast")
      .reply(200, [
        {
          id: 1,
          name: "Oatmeal (vgn)",
          station: "Grill (Cafe)",
          reviews: [
            { itemsStars: 4, item: 1 },
            { itemsStars: 5, item: 1 },
          ],
        },
        {
          id: 2,
          name: "Blintz",
          station: "Grill (Cafe)",
          reviews: [],
        },
        {
          id: 3,
          name: "Scrambled Eggs",
          station: "Grill (Cafe)",
          reviews: [{ itemsStars: 2, item: 3 }],
        },
      ]);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("MenuItemTable-cell-row-0-col-averageReview");

    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("4.5 ⭐");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-1-col-averageReview"),
    ).toHaveTextContent("🤷‍♂️ No Rating");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-2-col-averageReview"),
    ).toHaveTextContent("2.0 ⭐");
  });

  test("MenuItemPage handles invalid stars and mixed review data", async () => {
    const badData = [
      {
        id: 99,
        name: "Bad Review Dish",
        station: "Test Station",
        reviews: [
          { itemsStars: "NaN", item: 99 },
          { itemsStars: 0, item: 99 },
          { itemsStars: 6, item: 99 },
          { itemsStars: 3, item: 99 },
        ],
      },
    ];

    axiosMock
      .onGet("/api/diningcommons/2025-03-11/carrillo/breakfast")
      .reply(200, badData);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("MenuItemTable-cell-row-0-col-averageReview");
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("3.0 ⭐");
  });

  test("MenuItemPage renders review button and navigates on click", async () => {
    axiosMock
      .onGet("/api/diningcommons/2025-03-11/carrillo/breakfast")
      .reply(200, [
        {
          id: 42,
          name: "Test Dish",
          station: "Test Station",
          reviews: [{ itemsStars: 5, item: 42 }],
        },
      ]);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const reviewButton = await screen.findByRole("button", {
      name: /Review Item/i,
    });
    expect(reviewButton).toBeInTheDocument();
  });

  describe("extractAllReviewsForItem edge cases", () => {
    test("handles circular references gracefully", () => {
      const review = { id: 1, itemsStars: 5, item: 42 };
      const circular = { nested: null };
      circular.nested = circular; // create circular ref

      const input = [review, circular];
      const result = extractAllReviewsForItem(input, 42);
      expect(result).toEqual([review]);
    });

    test("skips nodes that are not objects", () => {
      const input = [
        null,
        undefined,
        123,
        "hello",
        { itemsStars: 4, item: 10 },
      ];
      const result = extractAllReviewsForItem(input, 10);
      expect(result.length).toBe(1);
    });

    test("does not include reviews without itemsStars", () => {
      const input = [
        { item: 10 },
        { itemsStars: undefined, item: 10 },
        { itemsStars: 5, item: 10 },
      ];
      const result = extractAllReviewsForItem(input, 10);
      expect(result.length).toBe(1);
      expect(result[0].itemsStars).toBe(5);
    });

    test("matches both item.id === itemId and item === itemId", () => {
      const input = [
        { itemsStars: 3, item: { id: 10 } },
        { itemsStars: 4, item: 10 },
        { itemsStars: 5, item: { id: 11 } }, // should not match
      ];
      const result = extractAllReviewsForItem(input, 10);
      const stars = result.map((r) => r.itemsStars);
      expect(stars).toEqual([3, 4]);
    });

    test("recursively finds reviews in deeply nested properties", () => {
      const input = {
        outer: {
          middle: {
            deep: [
              { itemsStars: 2, item: { id: 10 } },
              { itemsStars: 5, item: 10 },
            ],
          },
        },
      };
      const result = extractAllReviewsForItem(input, 10);
      expect(result.length).toBe(2);
    });
  });
  test("extractAllReviewsForItem recurses into arrays", () => {
    const data = [
      {
        itemsStars: 5,
        item: 42,
      },
      [
        {
          itemsStars: 4,
          item: 42,
        },
      ],
    ];

    const result = extractAllReviewsForItem(data, 42);
    const ids = result.map((r) => r.itemsStars);

    expect(result.length).toBe(2); // will fail if arrays are not recursed
    expect(ids).toContain(5);
    expect(ids).toContain(4);
  });

  test("extractAllReviewsForItem includes reviews inside nested arrays", () => {
    const data = [
      {
        id: 1,
        name: "Top level item",
        station: "A",
        reviews: [
          [
            {
              itemsStars: 5,
              item: 42, // should be matched
            },
          ],
        ],
      },
    ];

    // This nested array will only be reached if Array.isArray(node) works
    const result = extractAllReviewsForItem(data, 42);
    expect(result.length).toBe(1);
    expect(result[0].itemsStars).toBe(5);
  });

  test("extractAllRevsiewsForItem recurses into arrays", () => {
    const nested = [
      [
        { itemsStars: 3, item: 10 },
        { itemsStars: 5, item: 10 },
      ],
    ];

    const result = extractAllReviewsForItem(nested, 10);
    expect(result.length).toBe(2);
    expect(result.map((r) => r.itemsStars)).toEqual([3, 5]);
  });

  test("extractAllReviewsForItem recurses into nested object properties", () => {
    const nested = {
      a: {
        b: {
          itemsStars: 4,
          item: 20,
        },
      },
    };

    const result = extractAllReviewsForItem(nested, 20);
    expect(result.length).toBe(1);
    expect(result[0].itemsStars).toBe(4);
  });

  test("extractAllReviewsForItem handles direct item id (not object)", () => {
    const flat = [{ itemsStars: 3, item: 30 }];
    const result = extractAllReviewsForItem(flat, 30);
    expect(result.length).toBe(1);
  });

  test("itemsStars value of 1 is considered valid", () => {
    const reviews = [
      {
        id: 1,
        name: "Test",
        station: "T1",
        reviews: [{ itemsStars: 1, item: 1 }],
      },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable menuItems={reviews} currentUser={{ roles: [] }} />
      </MemoryRouter>,
    );

    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("1.0 ⭐");
  });

  test("Table headers render correctly", () => {
    render(
      <MemoryRouter>
        <MenuItemTable menuItems={[]} currentUser={{ roles: [] }} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("MenuItemTable-header-name")).toHaveTextContent(
      "Item Name",
    );
    expect(
      screen.getByTestId("MenuItemTable-header-station"),
    ).toHaveTextContent("Station");
  });

  test("filters out invalid ratings using AND logic", () => {
    const input = [
      {
        id: 1,
        name: "Test",
        station: "X",
        reviews: [
          { itemsStars: 1, item: 1 }, // ✅ valid
          { itemsStars: 0, item: 1 }, // ✅ valid
          { itemsStars: 6, item: 1 }, // ✅ valid
        ],
      },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable menuItems={input} currentUser={{}} />
      </MemoryRouter>,
    );
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("1.0 ⭐");
  });

  test("reduce uses + not - to compute average", () => {
    const input = [
      {
        id: 1,
        name: "Test",
        station: "X",
        reviews: [
          { itemsStars: 3, item: 1 }, // ✅ valid
          { itemsStars: 3, item: 1 }, // ✅ valid
        ],
      },
    ];
    render(
      <MemoryRouter>
        <MenuItemTable menuItems={input} currentUser={{}} />
      </MemoryRouter>,
    );
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("3.0 ⭐");
  });

  test("renders column headers correctly", () => {
    render(
      <MemoryRouter>
        <MenuItemTable menuItems={[]} currentUser={{}} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("MenuItemTable-header-name")).toHaveTextContent(
      "Item Name",
    );
    expect(
      screen.getByTestId("MenuItemTable-header-station"),
    ).toHaveTextContent("Station");
    expect(
      screen.getByTestId("MenuItemTable-header-averageReview"),
    ).toHaveTextContent("Average Review");
  });

  test("uses + not - to compute average", () => {
    const input = [
      {
        id: 1,
        name: "Mutation Test Dish",
        station: "X",
        reviews: [
          { itemsStars: 3, item: 1 },
          { itemsStars: 3, item: 1 },
        ],
      },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable menuItems={input} currentUser={{}} />
      </MemoryRouter>,
    );

    // If "+" is correct, should show 3.0
    // If "-" is used, would show -3.0 or 🤷‍♂️ No Rating
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("3.0 ⭐");
  });

  test("Review Item button has warning style and correct testid", async () => {
    const input = [
      { id: 1, name: "Review Test", station: "Check", reviews: [] },
    ];

    const currentUser = {
      root: {
        rolesList: ["ROLE_USER"], // ✅ satisfies hasRole check
      },
    };

    render(
      <MemoryRouter>
        <MenuItemTable menuItems={input} currentUser={currentUser} />
      </MemoryRouter>,
    );

    const button = await screen.findByTestId(
      "MenuItemTable-cell-row-0-col-Review Item-button",
    );
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("btn-warning");
    expect(button).toHaveTextContent("Review Item");
  });

  test("does NOT render Review Item button if user does NOT have ROLE_USER", () => {
    const input = [
      { id: 1, name: "No Review Privileges", station: "Z", reviews: [] },
    ];

    const currentUser = {
      root: {
        rolesList: ["ROLE_TOD"], // ❌ not ROLE_USER
      },
    };

    render(
      <MemoryRouter>
        <MenuItemTable menuItems={input} currentUser={currentUser} />
      </MemoryRouter>,
    );

    const btn = screen.queryByTestId(
      "MenuItemTable-cell-row-0-col-Review Item-button",
    );
    expect(btn).not.toBeInTheDocument(); // 💥 would fail if `hasRole(...)` was mutated to `true`
  });

  test("reviewCallback navigates correctly to the review creation page", async () => {
    const input = [
      { id: 1, name: "Trigger Nav", station: "Trigger", reviews: [] },
    ];

    const currentUser = {
      root: {
        rolesList: ["ROLE_USER"], // ✅ correct structure
      },
    };

    render(
      <MemoryRouter>
        <MenuItemTable menuItems={input} currentUser={currentUser} />
      </MemoryRouter>,
    );

    const button = await screen.findByTestId(
      "MenuItemTable-cell-row-0-col-Review Item-button",
    );

    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/reviews/create/1", {
      state: { from: "/menu-items" },
    });
  });

  test("extractAllReviewsForItem recurses through deeply nested arrays and collects exactly matching reviews", () => {
    const data = [
      { itemsStars: 5, item: 42 }, // ✅ Top-level
      [
        { itemsStars: 4, item: 42 }, // ✅ Nested level 1
        { itemsStars: 1, item: 999 }, // ❌ Wrong itemId
        [
          { itemsStars: 3, item: 42 }, // ✅ Nested level 2
          { itemsStars: 2, item: 48 }, // ❌ Wrong itemId
          [
            { itemsStars: 2, item: 42 }, // ✅ Deep level
            { itemsStars: 2, item: 51 }, // ❌ Wrong itemId
          ],
          [
            { itemsStars: 1, item: 42 }, // ✅ Deepest level
            { itemsStars: 1, item: 100 }, // ❌ Wrong itemId
          ],
        ],
      ],
    ];

    const result = extractAllReviewsForItem(data, 42);
    const stars = result.map((r) => r.itemsStars).sort();

    expect(result.length).toBe(5); // Only 5 valid reviews
    expect(stars).toEqual([1, 2, 3, 4, 5]); // Ensure exact values collected
  });

  test("average fails if stars are subtracted instead of added", () => {
    const rows = [
      {
        id: 1,
        name: "Mutation‑Guard Dish",
        station: "Test Station",
        reviews: [
          { itemsStars: 4, item: 1 },
          { itemsStars: 1, item: 1 },
        ],
      },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable menuItems={rows} currentUser={{}} />
      </MemoryRouter>,
    );

    // Real code (+)  →  (4+1)/2 = 2.5 ⭐
    // Mutant  (‑)    →  (0‑4‑1)/2 = ‑2.5 ⭐   → assertion fails, mutant killed
    expect(
      screen.getByTestId("MenuItemTable-cell-row-0-col-averageReview"),
    ).toHaveTextContent("2.5 ⭐");
  });
  test("average is positive and equal to the expected value", () => {
    const rows = [
      {
        id: 1,
        name: "Mutation‑Guard Dish",
        station: "A",
        reviews: [
          { itemsStars: 4, item: 1 },
          { itemsStars: 1, item: 1 }, // average should be 2.5
        ],
      },
    ];

    render(
      <MemoryRouter>
        <MenuItemTable menuItems={rows} currentUser={{}} />
      </MemoryRouter>,
    );

    const cell = screen.getByTestId(
      "MenuItemTable-cell-row-0-col-averageReview",
    );

    // ① exact numeric check – kills many mutants
    expect(cell).toHaveTextContent("2.5 ⭐");

    // ② sign check – guarantees “+ ➔ –” mutants are killed
    expect(cell.textContent.startsWith("-")).toBe(false);
  });
});
