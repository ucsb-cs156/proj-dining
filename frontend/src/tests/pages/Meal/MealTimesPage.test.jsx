import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import MealTimesPage from "main/pages/Meal/MealTimesPage";
import { mealFixtures } from "fixtures/mealFixtures";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      "date-time": "2024-11-25",
      "dining-commons-code": "portola",
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("MealTimesPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.spyOn(console, "error");
    console.error.mockImplementation(() => null);
  });

  afterEach(() => {
    axiosMock.reset();
  });

  test("renders without crashing", () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(200, mealFixtures.threeMeals);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("displays correct information in the table", async () => {
    const queryClient = new QueryClient();
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(200, mealFixtures.threeMeals);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Meals at portola for 2024-11-25");

    expect(
      screen.getByText("Meals at portola for 2024-11-25"),
    ).toBeInTheDocument();

    expect(screen.getByText("Breakfast")).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("Dinner")).toBeInTheDocument();

    expect(
      screen.queryByText("No meals offered today"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Unable to load page")).not.toBeInTheDocument();
  });

  test("displays message when no meals are offered (204 No Content)", async () => {
    const queryClient = new QueryClient();

    axiosMock.onGet("/api/diningcommons/2024-11-25/portola").reply(204);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No meals offered today")).toBeInTheDocument();
    });

    expect(screen.queryByText("Meal")).not.toBeInTheDocument();
    expect(screen.queryByText("Unable to load page")).not.toBeInTheDocument();
  });

  test("displays generic error message for server errors", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    axiosMock.onGet("/api/diningcommons/2024-11-25/portola").reply(500);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Unable to load page")).toBeInTheDocument();
    });

    expect(
      screen.queryByText("No meals offered today"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Meal")).not.toBeInTheDocument();
  });

  test("displays error message w/ body", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(500, mealFixtures.threeMeals);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Unable to load page")).toBeInTheDocument();
    });

    expect(
      screen.queryByText("No meals offered today"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Meal")).not.toBeInTheDocument();
  });

  test("displays message when meals array is empty (200 with empty array)", async () => {
    const queryClient = new QueryClient();

    axiosMock.onGet("/api/diningcommons/2024-11-25/portola").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No meals offered today")).toBeInTheDocument();
    });

    expect(screen.queryByText("Meal")).not.toBeInTheDocument();
  });
});
