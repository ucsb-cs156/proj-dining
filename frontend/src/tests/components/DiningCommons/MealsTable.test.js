import { render, screen } from "@testing-library/react";
import { mealsFixtures } from "fixtures/mealsFixtures";
import MealsTable from "main/components/DiningCommons/MealsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("MealsTable tests", () => {
  const queryClient = new QueryClient();

  const dateTime = "2021-10-01";
  const diningCommonsCode = "de-la-guerra";
  test("Has the expected column headers and content", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MealsTable
            mealsData={mealsFixtures.threeMeals}
            dateTime={dateTime}
            diningCommonsCode={diningCommonsCode}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = ["Meal"];
    const expectedFields = ["name"];
    const testId = "MealsTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("Breakfast");
    const breakfastLink = screen.getByText("Breakfast");
    expect(breakfastLink).toHaveAttribute(
      "href",
      "/diningcommons/2021-10-01/de-la-guerra/Breakfast",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("Lunch");
    const lunchLink = screen.getByText("Lunch");
    expect(lunchLink).toHaveAttribute(
      "href",
      "/diningcommons/2021-10-01/de-la-guerra/Lunch",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-name`),
    ).toHaveTextContent("Dinner");
    const dinnerLink = screen.getByText("Dinner");
    expect(dinnerLink).toHaveAttribute(
      "href",
      "/diningcommons/2021-10-01/de-la-guerra/Dinner",
    );
  });
});
