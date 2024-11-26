import { render, screen } from "@testing-library/react";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

const queryClient = new QueryClient();

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("DiningCommonsTable tests", () => {
  const expectedHeaders = [
    "Name",
    "Code",
    "Has DiningCam",
    "Has Sack Meal",
    "Has Takeout Meal",
  ];
  const testId = "DiningCommonsTable";

  const renderComponent = (diningcommons = []) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable diningcommons={diningcommons} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders empty table correctly", () => {
    renderComponent([]);

    const emptyMessage = screen.getByTestId("DiningCommonsTable-empty-message");
    expect(emptyMessage).toHaveTextContent("No data available");
  });

  test("renders table with dining commons correctly", () => {
    const diningcommons = diningCommonsFixtures.threeDiningCommons;

    // Act
    renderComponent(diningcommons);

    // Assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    diningcommons.forEach((dc, rowIndex) => {
      const nameLink = screen.getByRole("link", { name: dc.name });
      expect(nameLink).toBeInTheDocument();
      expect(nameLink).toHaveAttribute("href", `/diningcommons/${dc.code}`);

      const codeCell = screen.getByTestId(
        `${testId}-cell-row-${rowIndex}-col-code`,
      );
      expect(codeCell).toHaveTextContent(dc.code ? dc.code : "N/A");

      const hasDiningCamCell = screen.getByTestId(
        `${testId}-cell-row-${rowIndex}-col-hasDiningCam`,
      );
      expect(hasDiningCamCell).toHaveTextContent(
        dc.hasDiningCam ? "Yes" : "No",
      );

      const hasSackMealCell = screen.getByTestId(
        `${testId}-cell-row-${rowIndex}-col-hasSackMeal`,
      );
      expect(hasSackMealCell).toHaveTextContent(dc.hasSackMeal ? "Yes" : "No");

      const hasTakeoutMealCell = screen.getByTestId(
        `${testId}-cell-row-${rowIndex}-col-hasTakeoutMeal`,
      );
      expect(hasTakeoutMealCell).toHaveTextContent(
        dc.hasTakeoutMeal ? "Yes" : "No",
      );
    });
  });

  test("Name column links navigate to the correct URL", () => {
    // Arrange
    const diningcommons = diningCommonsFixtures.threeDiningCommons;

    // Act
    renderComponent(diningcommons);

    // Assert
    diningcommons.forEach((dc) => {
      const nameLink = screen.getByRole("link", { name: dc.name });
      expect(nameLink).toBeInTheDocument();
      expect(nameLink).toHaveAttribute("href", `/diningcommons/${dc.code}`);
    });
  });

  test("renders correctly with single dining common", () => {
    // Arrange
    const diningcommons = [diningCommonsFixtures.oneDiningCommon];

    // Act
    renderComponent(diningcommons);

    // Assert
    const nameLink = screen.getByRole("link", { name: diningcommons[0].name });
    expect(nameLink).toBeInTheDocument();
    expect(nameLink).toHaveAttribute(
      "href",
      `/diningcommons/${diningcommons[0].code}`,
    );

    const codeCell = screen.getByTestId(`${testId}-cell-row-0-col-code`);
    expect(codeCell).toHaveTextContent(
      diningcommons[0].code ? diningcommons[0].code : "N/A",
    );

    const hasDiningCamCell = screen.getByTestId(
      `${testId}-cell-row-0-col-hasDiningCam`,
    );
    expect(hasDiningCamCell).toHaveTextContent(
      diningcommons[0].hasDiningCam ? "Yes" : "No",
    );

    const hasSackMealCell = screen.getByTestId(
      `${testId}-cell-row-0-col-hasSackMeal`,
    );
    expect(hasSackMealCell).toHaveTextContent(
      diningcommons[0].hasSackMeal ? "Yes" : "No",
    );

    const hasTakeoutMealCell = screen.getByTestId(
      `${testId}-cell-row-0-col-hasTakeoutMeal`,
    );
    expect(hasTakeoutMealCell).toHaveTextContent(
      diningcommons[0].hasTakeoutMeal ? "Yes" : "No",
    );
  });

  test("renders correctly with no dining cam", () => {
    // Arrange
    const diningcommons = [
      {
        name: "No Dining Cam Common",
        code: "no-dining-cam",
        hasDiningCam: false,
        hasSackMeal: true,
        hasTakeoutMeal: true,
      },
    ];

    // Act
    renderComponent(diningcommons);

    // Assert
    const nameLink = screen.getByRole("link", { name: diningcommons[0].name });
    expect(nameLink).toBeInTheDocument();
    expect(nameLink).toHaveAttribute(
      "href",
      `/diningcommons/${diningcommons[0].code}`,
    );

    const codeCell = screen.getByTestId(`${testId}-cell-row-0-col-code`);
    expect(codeCell).toHaveTextContent(
      diningcommons[0].code ? diningcommons[0].code : "N/A",
    );

    const hasDiningCamCell = screen.getByTestId(
      `${testId}-cell-row-0-col-hasDiningCam`,
    );
    expect(hasDiningCamCell).toHaveTextContent("No");

    const hasSackMealCell = screen.getByTestId(
      `${testId}-cell-row-0-col-hasSackMeal`,
    );
    expect(hasSackMealCell).toHaveTextContent("Yes");

    const hasTakeoutMealCell = screen.getByTestId(
      `${testId}-cell-row-0-col-hasTakeoutMeal`,
    );
    expect(hasTakeoutMealCell).toHaveTextContent("Yes");
  });
});
