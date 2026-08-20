import { render, screen } from "@testing-library/react";
import CommonsAveragesOverTimeTable from "main/components/Statistics/CommonsAveragesOverTimeTable";
import { statisticsFixtures } from "fixtures/statisticsFixtures";

describe("CommonsAveragesOverTimeTable tests", () => {
  test("renders all rows", () => {
    render(
      <CommonsAveragesOverTimeTable
        rows={statisticsFixtures.commonsOverTime}
      />,
    );

    const testId = "CommonsAveragesOverTimeTable";
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-diningCommonsCode`),
    ).toHaveTextContent("carrillo");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-period`),
    ).toHaveTextContent("2025-03");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-averageStars`),
    ).toHaveTextContent("4.20");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-reviewCount`),
    ).toHaveTextContent("5");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-diningCommonsCode`),
    ).toHaveTextContent("ortega");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-period`),
    ).toHaveTextContent("2025-04");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-averageStars`),
    ).toHaveTextContent("4.60");
  });

  test("renders headers", () => {
    render(
      <CommonsAveragesOverTimeTable
        rows={statisticsFixtures.commonsOverTime}
      />,
    );

    expect(
      screen.getByTestId(
        "CommonsAveragesOverTimeTable-header-diningCommonsCode",
      ),
    ).toHaveTextContent("Dining Commons");
    expect(
      screen.getByTestId("CommonsAveragesOverTimeTable-header-period"),
    ).toHaveTextContent("Month");
    expect(
      screen.getByTestId("CommonsAveragesOverTimeTable-header-averageStars"),
    ).toHaveTextContent("Average Score");
    expect(
      screen.getByTestId("CommonsAveragesOverTimeTable-header-reviewCount"),
    ).toHaveTextContent("Reviews");
  });

  test("accepts custom testIdPrefix", () => {
    render(
      <CommonsAveragesOverTimeTable
        rows={statisticsFixtures.commonsOverTime}
        testIdPrefix="CustomPrefix"
      />,
    );

    expect(
      screen.getByTestId("CustomPrefix-cell-row-0-col-period"),
    ).toHaveTextContent("2025-03");
  });
});
