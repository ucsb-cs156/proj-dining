import { waitFor, render, screen } from "@testing-library/react";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import { useBackend } from "main/utils/useBackend";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

vi.mock("main/utils/useBackend", () => ({
  useBackend: vi.fn(),
}));

// vi.mock already made this a mock fn
const mockedUseBackend = useBackend;

describe("DiningCommonsTable tests", () => {
  const queryClient = new QueryClient();
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
    "meals",
    "hasDiningCam",
    "hasSackMeal",
    "hasTakeoutMeal",
  ];
  const testId = "DiningCommonsTable";
  const date = new Date("2025-03-11").toISOString().split("T")[0];

  beforeEach(() => {
    mockedUseBackend.mockReset();
    // default: success with no meals (data.meals is an empty array)
    mockedUseBackend.mockReturnValue({
      data: { meals: [] },
      status: "success",
    });
  });

  function renderTable(commons = fourCommons) {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DiningCommonsTable commons={commons} date={date} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  }

  test("Checkmark / X for Boolean columns shows up as expected, url shows up correctly", async () => {
    renderTable();

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

  //
  // Meals Offered Today branch coverage tests
  //

  test("Meals cell shows loading placeholder when backend status is not success", async () => {
    mockedUseBackend.mockReturnValue({
      data: null,
      status: "loading",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("...");
  });

  test("Meals cell shows 'no meals offered' when backend returns empty meals array", async () => {
    mockedUseBackend.mockReturnValue({
      data: { meals: [] },
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("no meals offered");
  });

  test("Meals cell shows links when backend returns data as array of objects with name", async () => {
    mockedUseBackend.mockReturnValue({
      data: [{ name: "Lunch" }, { name: "Dinner" }],
      status: "success",
    });

    const commons = [fourCommons[0]]; // e.g. carrillo
    renderTable(commons);

    const lunch = await screen.findByRole("link", { name: "Lunch" });
    const dinner = await screen.findByRole("link", { name: "Dinner" });

    expect(lunch).toHaveAttribute(
      "href",
      `/diningcommons/2025-03-11/${commons[0].code}/Lunch`,
    );
    expect(dinner).toHaveAttribute(
      "href",
      `/diningcommons/2025-03-11/${commons[0].code}/Dinner`,
    );
  });

  test("Meals cell shows links when backend returns data.meals as array of objects with name", async () => {
    mockedUseBackend.mockReturnValue({
      data: { meals: [{ name: "Brunch" }, { name: "Late Night" }] },
      status: "success",
    });

    const commons = [fourCommons[0]];
    renderTable(commons);

    const brunch = await screen.findByRole("link", { name: "Brunch" });
    const lateNight = await screen.findByRole("link", { name: "Late night" });

    expect(brunch).toHaveAttribute(
      "href",
      `/diningcommons/2025-03-11/${commons[0].code}/Brunch`,
    );
    // label is capitalized, rest lowercased: "Late night"
    expect(lateNight).toHaveAttribute(
      "href",
      `/diningcommons/2025-03-11/${commons[0].code}/Late Night`,
    );
  });

  test("Meals cell shows 'no meals offered' when backend returns object without meals array", async () => {
    // Covers the case where data is not an array and data.meals is not an array
    mockedUseBackend.mockReturnValue({
      data: { foo: "bar" },
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("no meals offered");
  });

  //
  // Existing tests updated to include Meals column
  //

  test("Checkmark / X for Boolean columns shows up as expected when hasDiningCam is false", async () => {
    renderTable([diningCommonsFixtures.oneCommonsDiningCamFalse]);

    await waitFor(() => {
      expect(
        screen.getByTestId("DiningCommonsTable-cell-row-0-col-hasDiningCam"),
      ).toHaveTextContent("❌");
    });
  });

  test("renders empty table correctly", () => {
    renderTable([]);

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

  test("Has the expected column headers and basic content (admin user)", () => {
    renderTable();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const cell = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(cell).toBeInTheDocument();
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

  test("Has the expected column headers and basic content (ordinary user)", () => {
    renderTable();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const cell = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(cell).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-code`),
    ).toHaveTextContent("carrillo");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-code`),
    ).toHaveTextContent("de-la-guerra");
  });
});
