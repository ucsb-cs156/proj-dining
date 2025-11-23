import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import MealTimesPage, { onMealsError } from "main/pages/Meal/MealTimesPage";
import { mealFixtures } from "fixtures/mealFixtures";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { vi } from "vitest";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
  },
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
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("MealTimesPage tests", () => {
  let queryClient;
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.spyOn(console, "error");
    console.error.mockImplementation(() => null);
    axiosMock.reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders without crashing", () => {
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

  test("displays error message when dining commons is closed (404)", async () => {
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(404, { message: "Dining commons not found" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No meals available")).toBeInTheDocument();
    });

    expect(
      screen.getByText("portola is not serving meals on 2024-11-25."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This dining commons may be closed on this date. Please try a different date or select another dining commons.",
      ),
    ).toBeInTheDocument();
  });

  test("displays error message when dining commons is closed (500)", async () => {
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(500, { message: "Server error" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No meals available")).toBeInTheDocument();
    });

    expect(
      screen.getByText("portola is not serving meals on 2024-11-25."),
    ).toBeInTheDocument();
  });

  test("displays error message when backend returns 'no meals' message", async () => {
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(400, { message: "No meals available for this date" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No meals available")).toBeInTheDocument();
    });

    expect(
      screen.getByText("portola is not serving meals on 2024-11-25."),
    ).toBeInTheDocument();
  });

  test("displays error message when backend returns 'closed' message", async () => {
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(400, { message: "Dining commons is closed" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No meals available")).toBeInTheDocument();
    });

    expect(
      screen.getByText("portola is not serving meals on 2024-11-25."),
    ).toBeInTheDocument();
  });

  test("displays error message when backend returns 'closed' with different status code", async () => {
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(403, { message: "The dining commons is CLOSED today" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No meals available")).toBeInTheDocument();
    });

    expect(
      screen.getByText("portola is not serving meals on 2024-11-25."),
    ).toBeInTheDocument();
  });

  test("displays generic error message for other errors", async () => {
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(403, { message: "Access denied" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Error loading meals")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Unable to load meal information at this time."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Please try again later or contact support if the problem persists.",
      ),
    ).toBeInTheDocument();
  });

  test("displays generic error message when no error message from backend", async () => {
    axiosMock.onGet("/api/diningcommons/2024-11-25/portola").networkError();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Error loading meals")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Unable to load meal information at this time."),
    ).toBeInTheDocument();
  });

  test("displays alert-info class for closed dining commons error", async () => {
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(404, { message: "Not found" });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No meals available")).toBeInTheDocument();
    });

    const alertDiv = container.querySelector(".alert-info");
    expect(alertDiv).toBeInTheDocument();
    expect(alertDiv).not.toHaveClass("alert-danger");
  });

  test("displays alert-danger class for generic errors", async () => {
    axiosMock
      .onGet("/api/diningcommons/2024-11-25/portola")
      .reply(403, { message: "Access denied" });

    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommons/2024-11-25/portola"]}>
          <MealTimesPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Error loading meals")).toBeInTheDocument();
    });

    const alertDiv = container.querySelector(".alert-danger");
    expect(alertDiv).toBeInTheDocument();
    expect(alertDiv).not.toHaveClass("alert-info");
  });
});

describe("onMealsError tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error");
    console.error.mockImplementation(() => null);
  });

  test("shows user-friendly message for 404 error", () => {
    const error = {
      response: {
        status: 404,
        data: { message: "Not found" },
      },
    };

    onMealsError(error, "carrillo", "2025-08-16");

    expect(toast.error).toHaveBeenCalledWith(
      "carrillo is not serving meals on 2025-08-16. Please try a different date or dining commons.",
    );
  });

  test("shows user-friendly message for 500 error", () => {
    const error = {
      response: {
        status: 500,
        data: { message: "Server error" },
      },
    };

    onMealsError(error, "ortega", "2025-12-25");

    expect(toast.error).toHaveBeenCalledWith(
      "ortega is not serving meals on 2025-12-25. Please try a different date or dining commons.",
    );
  });

  test("shows user-friendly message when error message contains 'no meals'", () => {
    const error = {
      response: {
        status: 400,
        data: { message: "No meals available today" },
      },
    };

    onMealsError(error, "dlg", "2025-01-01");

    expect(toast.error).toHaveBeenCalledWith(
      "dlg is not serving meals on 2025-01-01. Please try a different date or dining commons.",
    );
  });

  test("shows user-friendly message when error message contains 'closed'", () => {
    const error = {
      response: {
        status: 400,
        data: { message: "Dining commons is CLOSED" },
      },
    };

    onMealsError(error, "portola", "2025-07-04");

    expect(toast.error).toHaveBeenCalledWith(
      "portola is not serving meals on 2025-07-04. Please try a different date or dining commons.",
    );
  });

  test("shows user-friendly message when error message contains 'closed' (lowercase)", () => {
    const error = {
      response: {
        status: 403,
        data: { message: "dining commons closed for the day" },
      },
    };

    onMealsError(error, "dlg", "2025-07-04");

    expect(toast.error).toHaveBeenCalledWith(
      "dlg is not serving meals on 2025-07-04. Please try a different date or dining commons.",
    );
  });

  test("shows user-friendly message when only 'closed' keyword matches (not 404/500/no meals)", () => {
    const error = {
      response: {
        status: 403, // Not 404 or 500
        data: { message: "permanently closed" }, // Contains 'closed' but not 'no meals'
      },
    };

    onMealsError(error, "portola", "2025-01-01");

    expect(toast.error).toHaveBeenCalledWith(
      "portola is not serving meals on 2025-01-01. Please try a different date or dining commons.",
    );
  });

  test("shows user-friendly message when error message contains 'no meals' (lowercase)", () => {
    const error = {
      response: {
        status: 403,
        data: { message: "sorry, no meals today" },
      },
    };

    onMealsError(error, "carrillo", "2025-07-04");

    expect(toast.error).toHaveBeenCalledWith(
      "carrillo is not serving meals on 2025-07-04. Please try a different date or dining commons.",
    );
  });

  test("shows generic error message for other errors with message", () => {
    const error = {
      response: {
        status: 403,
        data: { message: "Access denied" },
      },
    };

    onMealsError(error, "carrillo", "2024-11-25");

    expect(toast.error).toHaveBeenCalledWith("Access denied");
  });

  test("shows fallback error message when no error message provided", () => {
    const error = {
      response: {
        status: 400,
        data: {},
      },
    };

    onMealsError(error, "ortega", "2024-11-20");

    expect(toast.error).toHaveBeenCalledWith(
      "Error loading meals for ortega on 2024-11-20",
    );
  });

  test("shows fallback error message when error has no response", () => {
    const error = {
      message: "Network error",
    };

    onMealsError(error, "dlg", "2024-11-15");

    expect(toast.error).toHaveBeenCalledWith(
      "Error loading meals for dlg on 2024-11-15",
    );
  });

  test("logs error to console", () => {
    const error = {
      response: {
        status: 404,
        data: { message: "Not found" },
      },
    };

    onMealsError(error, "portola", "2025-08-16");

    expect(console.error).toHaveBeenCalledWith("onMealsError: error=", error);
  });
});
