import { render, screen } from "@testing-library/react";
import ItemStatisticsTable from "main/components/Statistics/ItemStatisticsTable";
import { statisticsFixtures } from "fixtures/statisticsFixtures";

describe("ItemStatisticsTable tests", () => {
  test("renders all columns and data", () => {
    render(<ItemStatisticsTable items={statisticsFixtures.threeBestItems} />);

    const testId = "ItemStatisticsTable";
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-itemName`),
    ).toHaveTextContent("Waffle");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-diningCommonsCode`),
    ).toHaveTextContent("carrillo");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-mealCode`),
    ).toHaveTextContent("breakfast");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-station`),
    ).toHaveTextContent("Bakery");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-averageStars`),
    ).toHaveTextContent("4.90");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-reviewCount`),
    ).toHaveTextContent("12");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-itemName`),
    ).toHaveTextContent("Pizza");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-averageStars`),
    ).toHaveTextContent("4.20");
  });

  test("renders headers correctly", () => {
    render(<ItemStatisticsTable items={statisticsFixtures.threeBestItems} />);

    expect(
      screen.getByTestId("ItemStatisticsTable-header-itemName"),
    ).toHaveTextContent("Item");
    expect(
      screen.getByTestId("ItemStatisticsTable-header-diningCommonsCode"),
    ).toHaveTextContent("Dining Commons");
    expect(
      screen.getByTestId("ItemStatisticsTable-header-mealCode"),
    ).toHaveTextContent("Meal");
    expect(
      screen.getByTestId("ItemStatisticsTable-header-station"),
    ).toHaveTextContent("Station");
    expect(
      screen.getByTestId("ItemStatisticsTable-header-averageStars"),
    ).toHaveTextContent("Average Score");
    expect(
      screen.getByTestId("ItemStatisticsTable-header-reviewCount"),
    ).toHaveTextContent("Reviews");
  });

  test("accepts a custom testIdPrefix", () => {
    render(
      <ItemStatisticsTable
        items={statisticsFixtures.threeBestItems}
        testIdPrefix="CustomPrefix"
      />,
    );

    expect(
      screen.getByTestId("CustomPrefix-cell-row-0-col-itemName"),
    ).toHaveTextContent("Waffle");
  });
});
