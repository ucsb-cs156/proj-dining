import { waitFor, render, screen } from "@testing-library/react";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("DiningCommonsTable tests", () => {
  const queryClient = new QueryClient();
  const fourCommons = diningCommonsFixtures.fourCommons;
  const expectedHeaders = [
    "Code",
    "Name",
    "Has Dining Cam",
    "Has Sack Meal",
    "Has Takeout Meal",
  ];
  const expectedFields = [
    "code",
    "name",
    "hasDiningCam",
    "hasSackMeal",
    "hasTakeoutMeal",
  ];
  const testId = "DiningCommonsTable";
  const date = new Date("2025-03-11").toISOString().split("T")[0];

  test("Checkmark / X for Boolean columns shows up as expected, url shows up correctly", async () => {
    // act - render the component

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            commons={diningCommonsFixtures.fourCommons}
            date={date}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered
    await screen.findByTestId("DiningCommonsTable-cell-row-0-col-code");
    for (let i = 0; i < fourCommons.length; i++) {
      expect(
        screen.getByTestId(`DiningCommonsTable-cell-row-${i}-col-code`),
      ).toBeInTheDocument();
      expect(screen.getByText(fourCommons[i].code)).toHaveAttribute(
        "href",
        `/diningcommons/2025-03-11/${fourCommons[i].code}`,
      );
      expect(
        screen.getByTestId(`DiningCommonsTable-cell-row-${i}-col-hasSackMeal`),
      ).toHaveTextContent(fourCommons[i].hasSackMeal ? "✅" : "❌");
      expect(
        screen.getByTestId(
          `DiningCommonsTable-cell-row-${i}-col-hasTakeoutMeal`,
        ),
      ).toHaveTextContent(fourCommons[i].hasTakeoutMeal ? "✅" : "❌");
      expect(
        screen.getByTestId(`DiningCommonsTable-cell-row-${i}-col-hasDiningCam`),
      ).toHaveTextContent(fourCommons[i].hasDiningCam ? "✅" : "❌");
    }
  });

  test("Checkmark / X for Boolean columns shows up as expected when hasDiningCam is false", async () => {
    // act - render the component

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            commons={[diningCommonsFixtures.oneCommonsDiningCamFalse]}
            date={date}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-0-col-hasDiningCam"),
      ).toHaveTextContent("❌");
    });
  });

  test("renders empty table correctly", () => {
    // act
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable commons={[]} date={date} />
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
            date={date}
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

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-code`),
    ).toHaveTextContent("carrillo");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("Carrillo");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-code`),
    ).toHaveTextContent("de-la-guerra");
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
            date={date}
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

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-code`),
    ).toHaveTextContent("carrillo");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-name`),
    ).toHaveTextContent("Carrillo");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-code`),
    ).toHaveTextContent("de-la-guerra");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("De La Guerra");
  });

  test("Has the expected column headers and content for ordinary user", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            commons={diningCommonsFixtures.fourCommons}
            date={date}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "Code",
      "Name",
      "Has Dining Cam",
      "Has Sack Meal",
      "Has Takeout Meal",
    ];
    const expectedFields = [
      "code",
      "name",
      "hasDiningCam",
      "hasSackMeal",
      "hasTakeoutMeal",
    ];
    const testId = "DiningCommonsTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-code`),
    ).toHaveTextContent("carrillo");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-code`),
    ).toHaveTextContent("de-la-guerra");
  });

  test("Has the expected column headers and content for adminUser", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable
            commons={diningCommonsFixtures.fourCommons}
            date={date}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "Code",
      "Name",
      "Has Dining Cam",
      "Has Sack Meal",
      "Has Takeout Meal",
    ];
    const expectedFields = [
      "code",
      "name",
      "hasDiningCam",
      "hasSackMeal",
      "hasTakeoutMeal",
    ];
    const testId = "DiningCommonsTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-code`),
    ).toHaveTextContent("carrillo");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-code`),
    ).toHaveTextContent("de-la-guerra");
  });
});
