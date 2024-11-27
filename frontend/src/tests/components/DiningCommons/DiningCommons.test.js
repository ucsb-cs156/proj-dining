import { render, screen } from "@testing-library/react";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("DiningCommonsTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Code", "Name", "Has Dining Cam", "Has Sack Meal", "Has Takeout Meal", "Latitude", "Longitude"];
  const expectedFields = ["code", "name", "hasDiningCam", "hasSackMeal", "hasTakeoutMeal", "latitude", "longitude"];
  const testId = "DiningCommonsTable";

  test("Checkmark / X for Boolean columns shows up as expected", async () => {
    // act - render the component

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            commons={diningCommonsFixtures.fourCommons}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId(`DiningCommonsTable-cell-row-0-col-code`),
      ).toHaveTextContent("carrillo");
    });

    await waitFor(() => {
        expect(
          screen.getByTestId(`DiningCommonsTable-cell-row-1-col-code`),
        ).toHaveTextContent("de-la-guerra");
      });

    await waitFor(() => {
        expect(
            screen.getByTestId(`DiningCommonsTable-cell-row-2-col-code`),
        ).toHaveTextContent("ortega");
    });

    await waitFor(() => {
        expect(
            screen.getByTestId(`DiningCommonsTable-cell-row-3-col-code`),
        ).toHaveTextContent("portola");
    });

    // assert - check that the checkmarks and X's are available

    // carrillo 
    await waitFor(() => {
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-0-col-hasSackMeal"),
      ).toHaveTextContent("❌");
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-0-col-hasTakeoutMeal"),
      ).toHaveTextContent("❌");
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-0-col-hasDiningCam"),
      ).toHaveTextContent("✅");
    });

    // de la guerra
    await waitFor(() => {
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-1-col-hasSackMeal"),
      ).toHaveTextContent("❌");
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-1-col-hasTakeoutMeal"),
      ).toHaveTextContent("❌");
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-1-col-hasDiningCam"),
      ).toHaveTextContent("✅");
    });
    
    // ortega
    await waitFor(() => {
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-2-col-hasSackMeal"),
      ).toHaveTextContent("✅");
    });

    await waitFor(() => {
        expect(
          screen.getByTestId("DiningCommonsTable-cell-row-2-col-hasTakeoutMeal"),
        ).toHaveTextContent("✅");
      });
  
      await waitFor(() => {
        expect(
          screen.getByTestId("DiningCommonsTable-cell-row-2-col-hasDiningCam"),
        ).toHaveTextContent("✅");
      });

    // portola
    await waitFor(() => {
        expect(
          screen.getByTestId("DiningCommonsTable-cell-row-3-col-hasSackMeal"),
        ).toHaveTextContent("✅");
      });
  
      await waitFor(() => {
          expect(
            screen.getByTestId("DiningCommonsTable-cell-row-3-col-hasTakeoutMeal"),
          ).toHaveTextContent("✅");
        });
    
        await waitFor(() => {
          expect(
            screen.getByTestId("DiningCommonsTable-cell-row-3-col-hasDiningCam"),
          ).toHaveTextContent("✅");
        });
  });

  test("renders empty table correctly", () => {
    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable commons={[]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(
        `${testId}-cell-row-0-col-${field}`,
      );
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            commons={diningCommonsFixtures.fourCommons}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-code`)).toHaveTextContent(
      "carrillo",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("Carrillo");

    expect(screen.getByTestId(`${testId}-cell-row-1-col-code`)).toHaveTextContent(
      "de-la-guerra",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("De La Guerra");
  });

  test("Has the expected column headers, content for ordinary user", () => {
    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            commons={diningCommonsFixtures.fourCommons}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-code`)).toHaveTextContent(
      "carrillo",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("Carrillo");

    expect(screen.getByTestId(`${testId}-cell-row-1-col-code`)).toHaveTextContent(
      "de-la-guerra",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("De La Guerra");
  });
});
