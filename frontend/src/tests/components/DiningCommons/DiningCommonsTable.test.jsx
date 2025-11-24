import { waitFor, render, screen } from "@testing-library/react";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import { mealFixtures } from "fixtures/mealFixtures";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import AxiosMockAdapter from "axios-mock-adapter";
import axios from "axios";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    toast: (x) => mockToast(x),
  };
});

describe("DiningCommonsTable tests", () => {
  const queryClient = new QueryClient();
  const axiosMock = new AxiosMockAdapter(axios);
  const fourCommons = diningCommonsFixtures.fourCommons;
  const expectedHeaders = [
    "Code",
    "Name",
    "Meals Offered Today",
    "Has Dining Cam",
    "Has Sack Meal",
    "Has Takeout Meal",
  ];
  const expectedFields = [
    "code",
    "name",
    "mealsOfferedToday",
    "hasDiningCam",
    "hasSackMeal",
    "hasTakeoutMeal",
  ];
  const testId = "DiningCommonsTable";
  const date = new Date("2025-03-11").toISOString().split("T")[0];

  afterEach(() => {
    mockToast.mockClear();
  });

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
      "Meals Offered Today",
      "Has Dining Cam",
      "Has Sack Meal",
      "Has Takeout Meal",
    ];
    const expectedFields = [
      "code",
      "name",
      "mealsOfferedToday",
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
      "Meals Offered Today",
      "Has Dining Cam",
      "Has Sack Meal",
      "Has Takeout Meal",
    ];
    const expectedFields = [
      "code",
      "name",
      "mealsOfferedToday",
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

  test("Meals Offered Today shows 'no meals offered' for 500 error", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // otherwise the client keeps retrying after an error, so the error=500 isn't constant
        },
      },
    });

    axiosMock.reset();
    axiosMock.onGet(`/api/diningcommons/${date}/portola`).reply(500, []);

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

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-3-col-mealsOfferedToday",
    );

    await waitFor(() => {
      expect(cell).toHaveTextContent("no meals offered");
    });

    expect(mockToast).not.toHaveBeenCalled();
  });

  test("Meals Offered Today shows links for success", async () => {
    queryClient.clear();

    axiosMock.reset();
    axiosMock
      .onGet(`/api/diningcommons/${date}/portola`)
      .reply(200, mealFixtures.threeMeals);

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

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-3-col-mealsOfferedToday",
    );

    // toHaveTextContent ignores spaces, this does not
    expect(cell.textContent).toBe("Breakfast Lunch Dinner");

    for (let i = 0; i < mealFixtures.threeMeals.length; i++) {
      expect(screen.getByText(mealFixtures.threeMeals[i].name)).toHaveAttribute(
        "href",
        `/diningcommons/${date}/portola/${mealFixtures.threeMeals[i].code}`,
      );
    }

    expect(cell).not.toHaveTextContent("no meals offered");
  });

  test("when loading (empty meal list), have the same behavior as error 500", async () => {
    queryClient.clear();

    axiosMock.reset();
    axiosMock.onGet(`/api/diningcommons/${date}/portola`).reply(200, []);

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

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-3-col-mealsOfferedToday",
    );

    await waitFor(() => {
      expect(cell).toHaveTextContent("no meals offered");
    });

    expect(mockToast).not.toHaveBeenCalled();
  });
});
