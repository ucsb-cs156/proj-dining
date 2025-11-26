import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi } from "vitest";

import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";
import { menuItemFixtures } from "fixtures/menuItemFixtures";

const mockToast = vi.fn();
vi.mock("react-toastify", async () => {
  const originalModule = await vi.importActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
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

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient();

    // Set up common mocks
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
  });

  afterEach(() => {
    axiosMock.reset();
    queryClient.clear();
  });

  test("MenuItemPage works with no backend", async () => {
    axiosMock
      .onGet("/api/diningcommons/2025-03-11/carrillo/breakfast")
      .timeout();

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

  test("MenuItemPage renders 5 Menu Items Correctly", async () => {
    axiosMock
      .onGet("/api/diningcommons/2025-03-11/carrillo/breakfast")
      .reply(200, menuItemFixtures.fiveMenuItems);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("MenuItemTable-cell-row-0-col-name"),
      ).toBeInTheDocument();
    });

    for (let i = 0; i < menuItemFixtures.fiveMenuItems.length; i++) {
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-name`),
      ).toHaveTextContent(menuItemFixtures.fiveMenuItems[i].name);
      expect(
        screen.getByTestId(`MenuItemTable-cell-row-${i}-col-station`),
      ).toHaveTextContent(menuItemFixtures.fiveMenuItems[i].station);
    }
  });
});
