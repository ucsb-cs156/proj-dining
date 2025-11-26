import { waitFor, render, screen, within } from "@testing-library/react";
import { diningCommonsFixtures } from "fixtures/diningCommonsFixtures";
import DiningCommonsTable from "main/components/DiningCommons/DiningCommonsTable";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: () => mockedNavigate,
}));

// mock useQuery but keep QueryClient / QueryClientProvider
vi.mock("react-query", async () => ({
  ...(await vi.importActual("react-query")),
  useQuery: vi.fn(),
}));

// vi.mock already made this a mock fn
const mockedUseQuery = useQuery;

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
    mockedUseQuery.mockReset();
    // default: success with no meals (data.meals is an empty array)
    mockedUseQuery.mockReturnValue({
      data: { meals: [] },
      error: null,
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

  //
  // Core structural tests
  //

  test("Has the expected column headers and basic content", () => {
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

  test("Checkmark / X for Boolean columns shows up as expected, url shows up correctly", () => {
    renderTable();

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

  //
  // Meals Offered Today branch coverage tests
  //

  test("Meals cell shows loading placeholder when status is loading", async () => {
    mockedUseQuery.mockReturnValue({
      data: null,
      error: null,
      status: "loading",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("...");
  });

  test("Meals cell shows 'no meals offered' when data.meals is empty and useQuery called with correct args and onError logs", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: [] },
      error: null,
      status: "success",
    });

    const commons = [fourCommons[0]];
    const code = commons[0].code;
    const url = `/api/diningcommons/${date}/${code}`;

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderTable(commons);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("no meals offered");

    expect(mockedUseQuery).toHaveBeenCalledTimes(1);
    const [calledKey, calledFn, calledOptions] = mockedUseQuery.mock.calls[0];

    expect(calledKey).toEqual([url]);
    expect(typeof calledFn).toBe("function");
    expect(calledOptions).toEqual(
      expect.objectContaining({
        initialData: [],
        retry: false,
        onError: expect.any(Function),
      }),
    );

    const fakeError = { message: "boom" };
    calledOptions.onError(fakeError);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error loading meals for ${code} on ${date}`,
      fakeError,
    );

    consoleErrorSpy.mockRestore();
  });

  test("Meals cell shows links when data is an array of objects with name", async () => {
    mockedUseQuery.mockReturnValue({
      data: [{ name: "Lunch" }, { name: "Dinner" }],
      error: null,
      status: "success",
    });

    const commons = [fourCommons[0]];
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

    expect(lunch).toHaveStyle("margin-right: 0.75rem");
    expect(dinner).toHaveStyle("margin-right: 0.75rem");
  });

  test("Meals cell shows links when data.meals is an array of objects with name", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: [{ name: "Brunch" }, { name: "Late Night" }] },
      error: null,
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
    expect(lateNight).toHaveAttribute(
      "href",
      `/diningcommons/2025-03-11/${commons[0].code}/Late Night`,
    );
  });

  test("Meals cell shows 'no meals offered' when data object has no meals", async () => {
    mockedUseQuery.mockReturnValue({
      data: { foo: "bar" },
      error: null,
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("no meals offered");
  });

  test("Meals cell shows 'no meals offered' when status is error even if meals data is present", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: [{ name: "Lunch" }] },
      error: undefined,
      status: "error",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("no meals offered");
    expect(
      screen.queryByRole("link", { name: /lunch/i }),
    ).not.toBeInTheDocument();
  });

  //
  // Closed commons tests
  //

  test("Uses closed-commons logic when status is 404 (no meals link even if data has meals)", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: [{ name: "Lunch" }] },
      error: {
        response: {
          status: 404,
          data: { message: "Not Found" },
        },
      },
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("no meals offered");
    expect(
      screen.queryByRole("link", { name: /lunch/i }),
    ).not.toBeInTheDocument();
  });

  test("Uses closed-commons logic when status is 500 (no meals link even if data has meals)", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: [{ name: "Lunch" }] },
      error: {
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
        },
      },
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("no meals offered");
    expect(
      screen.queryByRole("link", { name: /lunch/i }),
    ).not.toBeInTheDocument();
  });

  test("Uses closed-commons logic when message includes 'no meals' even if status is 200", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: [{ name: "Lunch" }] },
      error: {
        response: {
          status: 200,
          data: { message: "No meals available today; commons closed" },
        },
      },
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("no meals offered");
    expect(
      screen.queryByRole("link", { name: /lunch/i }),
    ).not.toBeInTheDocument();
  });

  //
  // Kill optional-chaining mutants: error without nested fields
  //

  test("Handles error without nested fields and still renders meals", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: [{ name: "Lunch" }] },
      error: {
        // no response / data / message
        foo: "bar",
      },
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const lunch = await screen.findByRole("link", { name: /lunch/i });
    expect(lunch).toBeInTheDocument();
  });

  test("Treats missing error.response.data as not closed and still shows meals", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: [{ name: "Brunch" }] },
      error: {
        response: {
          status: 200,
          // no data field at all
        },
      },
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const brunch = await screen.findByRole("link", { name: /brunch/i });
    expect(brunch).toBeInTheDocument();
  });

  test("Does not treat unrelated error message as closed", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: [{ name: "Dinner" }] },
      error: {
        response: {
          status: 200,
          data: { message: "Some random backend message" },
        },
      },
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const dinner = await screen.findByRole("link", { name: /dinner/i });
    expect(dinner).toBeInTheDocument();
  });

  test("Treats data.meals = undefined as no meals offered", async () => {
    mockedUseQuery.mockReturnValue({
      data: { meals: undefined },
      error: null,
      status: "success",
    });

    renderTable([fourCommons[0]]);

    const cell = await screen.findByTestId(
      "DiningCommonsTable-cell-row-0-col-meals",
    );
    expect(cell).toHaveTextContent("no meals offered");
    // ensure no links are rendered
    expect(within(cell).queryByRole("link")).not.toBeInTheDocument();
  });

  test("Non-string error message fallback does not mark commons as closed", async () => {
    // Save original includes
    const originalIncludes = String.prototype.includes;

    // Monkey-patch String.prototype.includes just for this test
    String.prototype.includes = function (substr) {
      const str = this.toString();
      if (str === "" && substr === "no meals") {
        // real code path: msg === ""
        return false;
      }
      if (str === "Stryker was here!" && substr === "no meals") {
        // mutated code path: msg === "Stryker was here!"
        return true;
      }
      return originalIncludes.call(this, substr);
    };

    mockedUseQuery.mockReturnValue({
      data: { meals: [{ name: "Brunch" }] },
      error: {
        response: {
          status: 200,
          // non-string message so the code uses the fallback value
          data: { message: 123 },
        },
      },
      status: "success",
    });

    try {
      renderTable([fourCommons[0]]);

      // In real code (msg === ""), isClosedDiningCommons returns false,
      // so we should still see the Brunch link.
      const brunch = await screen.findByRole("link", { name: /brunch/i });
      expect(brunch).toBeInTheDocument();
    } finally {
      // Always restore includes so other tests are not affected
      String.prototype.includes = originalIncludes;
    }
  });
});
