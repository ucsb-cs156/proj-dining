import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import MealTimesPage from "main/pages/Meal/MealTimesPage";
import { mealFixtures } from "fixtures/mealFixtures";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
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

const queryClient = new QueryClient();

describe("MealTimesPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  beforeEach(() => {
    jest.spyOn(console, "error");
    console.error.mockImplementation(() => null);
  });
  beforeEach(() => {
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
});
