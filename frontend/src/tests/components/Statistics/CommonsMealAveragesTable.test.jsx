import { render, screen } from "@testing-library/react";

import CommonsMealAveragesTable from "main/components/Statistics/CommonsMealAveragesTable";
import { statisticsFixtures } from "fixtures/statisticsFixtures";

describe("CommonsMealAveragesTable tests", () => {
  test("renders default headers when no testIdPrefix is provided", () => {
    render(
      <CommonsMealAveragesTable averages={statisticsFixtures.mealAverages} />,
    );

    expect(
      screen.getByTestId("CommonsMealAveragesTable-header-mealCode"),
    ).toHaveTextContent("Meal");
    expect(
      screen.getByTestId("CommonsMealAveragesTable-header-averageStars"),
    ).toHaveTextContent("Average Score");
    expect(
      screen.getByTestId("CommonsMealAveragesTable-header-reviewCount"),
    ).toHaveTextContent("Reviews");
  });

  test("renders a row for every meal entry with formatted score", () => {
    render(
      <CommonsMealAveragesTable
        averages={statisticsFixtures.mealAverages}
        testIdPrefix="meals-table"
      />,
    );

    expect(
      screen.getByTestId("meals-table-cell-row-0-col-mealCode"),
    ).toHaveTextContent("breakfast");
    expect(
      screen.getByTestId("meals-table-cell-row-0-col-averageStars"),
    ).toHaveTextContent("4.25");
    expect(
      screen.getByTestId("meals-table-cell-row-0-col-reviewCount"),
    ).toHaveTextContent("8");

    expect(
      screen.getByTestId("meals-table-cell-row-1-col-mealCode"),
    ).toHaveTextContent("dinner");
    expect(
      screen.getByTestId("meals-table-cell-row-1-col-averageStars"),
    ).toHaveTextContent("3.50");
    expect(
      screen.getByTestId("meals-table-cell-row-1-col-reviewCount"),
    ).toHaveTextContent("12");

    expect(
      screen.getByTestId("meals-table-cell-row-2-col-mealCode"),
    ).toHaveTextContent("lunch");
    expect(
      screen.getByTestId("meals-table-cell-row-2-col-averageStars"),
    ).toHaveTextContent("4.00");
    expect(
      screen.getByTestId("meals-table-cell-row-2-col-reviewCount"),
    ).toHaveTextContent("10");
  });

  test("renders an empty body when averages is an empty array", () => {
    render(
      <CommonsMealAveragesTable
        averages={[]}
        testIdPrefix="meals-table-empty"
      />,
    );

    expect(
      screen.getByTestId("meals-table-empty-header-mealCode"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("meals-table-empty-cell-row-0-col-mealCode"),
    ).not.toBeInTheDocument();
  });
});
