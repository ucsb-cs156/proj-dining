import { render, screen } from "@testing-library/react";
import DiningCommonsTable from "main/components/UCSBAPIDiningCommons/UCSBAPIDiningCommonsTable";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { diningCommonsFixtures } from "fixtures/UCSBAPIDiningCommonsFixtures";

describe("DiningCommonsTable tests", () => {
  const queryClient = new QueryClient();
  const testId = "DiningCommonsTable";

  const expectedHeaders = [
    "Name",
    "Code",
    "Location",
    "Has Sack Meal",
    "Has Take Out Meal",
    "Has Dining Cam",
  ];

  test("renders empty table correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable diningCommons={[]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders table with data correctly", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            diningCommons={diningCommonsFixtures.threeDiningCommons}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Assert headers
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    // Check the data for each dining commons entry

    // Ortega Dining Commons
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("Ortega");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-code`),
    ).toHaveTextContent("ortega");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Location`),
    ).toHaveTextContent("34.410987, -119.84709");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-hasSackMeal`),
    ).toHaveTextContent("Yes");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-hasTakeOutMeal`),
    ).toHaveTextContent("Yes");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-hasDiningCam`),
    ).toHaveTextContent("Yes");

    // De La Guerra Dining Commons
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("De La Guerra");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-code`),
    ).toHaveTextContent("dlg");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-Location`),
    ).toHaveTextContent("34.409811, -119.845026");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-hasSackMeal`),
    ).toHaveTextContent("No");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-hasTakeOutMeal`),
    ).toHaveTextContent("No");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-hasDiningCam`),
    ).toHaveTextContent("Yes");

    // Portola Dining Commons
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-name`),
    ).toHaveTextContent("Portola");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-code`),
    ).toHaveTextContent("portola");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-Location`),
    ).toHaveTextContent("34.417723, -119.867427");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-hasSackMeal`),
    ).toHaveTextContent("Yes");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-hasTakeOutMeal`),
    ).toHaveTextContent("Yes");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-hasDiningCam`),
    ).toHaveTextContent("No");
  });

  test("renders table with correct links", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            diningCommons={diningCommonsFixtures.threeDiningCommons}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // Adjust to look for names present in the fixtures
    const link = screen.getByRole("link", { name: "ortega" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/diningcommons/ortega");
  });
});
