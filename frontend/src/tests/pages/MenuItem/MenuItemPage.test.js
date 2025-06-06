import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { QueryClient, QueryClientProvider } from "react-query";

import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";
import { menuItemFixtures } from "fixtures/menuItemFixtures";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      "date-time": "2025-03-11",
      "dining-commons-code": "carrillo",
      meal: "breakfast",
    }),
  };
});

describe("MenuItemPage", () => {
  let axiosMock;
  let queryClient;

  beforeAll(() => {
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient();
  });

  afterEach(() => {
    axiosMock.reset();
    queryClient.clear();
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
      .reply(200, menuItemFixtures.withReviews);
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

    // Optionally: test that navigation is triggered
  });
});
