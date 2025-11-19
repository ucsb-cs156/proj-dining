import { render, screen } from "@testing-library/react";
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

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    toast: (x) => mockToast(x),
  };
});

const queryClient = new QueryClient();

describe("MealTimesPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  beforeEach(() => {
    vi.spyOn(console, "error");
    console.error.mockImplementation(() => null);
  });
  beforeEach(() => {
    axiosMock.reset();
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(200, mealFixtures.threeMeals);
  });

  afterEach(() => {
    mockToast.mockClear();
  });

  test("renders without crashing", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("displays correct information in the table", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for the meal information to be loaded
    await screen.findByText("Meals at portola for 2024-11-25");

    // Ensure that the header is correct
    expect(
      screen.getByText("Meals at portola for 2024-11-25"),
    ).toBeInTheDocument();

    // Check that each meal time is displayed correctly
    expect(screen.getByText("Breakfast")).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("Dinner")).toBeInTheDocument();

    expect(
      screen.queryByText(/No meals offered today/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  });

  test("displays 'No meals offered today.' when backend returns 500", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // ✅ turns retries off
          retry: false,
        },
      },
    });

    axiosMock.reset();
    axiosMock.onGet("/api/diningcommons/2024-11-25/portola").reply(500, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for the meal information to be loaded
    await screen.findByText("Meals at portola for 2024-11-25");

    // Ensure that the header is correct
    expect(
      screen.getByText("Meals at portola for 2024-11-25"),
    ).toBeInTheDocument();

    // Should display this
    expect(
      await screen.findByText(/No meals offered today/i),
    ).toBeInTheDocument();

    // An empty table should not show up
    expect(
      screen.queryByTestId("MealTable-header-group-0"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();

    expect(mockToast).not.toHaveBeenCalled();
  });

  test("indicate when loading when loading API", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // ✅ turns retries off
          retry: false,
        },
      },
    });

    axiosMock.reset();
    axiosMock.onGet("/api/diningcommons/2024-11-25/portola").reply(() => new Promise(() => {}));
    // Above: loading forever

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Wait for the meal information to be loaded
    await screen.findByText("Meals at portola for 2024-11-25");

    // Ensure that the header is correct
    expect(
      screen.getByText("Meals at portola for 2024-11-25"),
    ).toBeInTheDocument();

    // Should display this
    expect(await screen.findByText(/Loading/i)).toBeInTheDocument();

    // An empty table should not show up
    expect(
      screen.queryByTestId("MealTable-header-group-0"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/No meals offered today/i),
    ).not.toBeInTheDocument();
  });
});
