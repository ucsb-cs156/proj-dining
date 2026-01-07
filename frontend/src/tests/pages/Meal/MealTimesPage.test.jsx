import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import MealTimesPage from "main/pages/Meal/MealTimesPage";
import { mealFixtures } from "fixtures/mealFixtures";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

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
    useNavigate: () => mockNavigate,

    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("MealTimesPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    vi.spyOn(console, "error");
    console.error.mockImplementation(() => null);
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(200, mealFixtures.threeMeals);
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
  });

  test("when backend returns 204, displays toast message", async () => {
    axiosMock.onGet("/api/diningcommons/2024-11-25/portola").reply(204);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const closedMessage =
      "portola is closed on 2024-11-25. Please select another date or dining common.";

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(closedMessage, {
        toastId: "closed-dining-commons",
      });
    });

    expect(screen.queryByText("Breakfast")).not.toBeInTheDocument();
  });

  test("changing the date navigates to correct URL", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Meals at portola for 2024-11-25");

    const input = screen.getByLabelText("Select Date:");

    fireEvent.change(input, { target: { value: "2025-11-01" } });

    expect(mockNavigate).toHaveBeenCalledWith(
      "/diningcommons/2025-11-01/portola",
    );
  });
});
