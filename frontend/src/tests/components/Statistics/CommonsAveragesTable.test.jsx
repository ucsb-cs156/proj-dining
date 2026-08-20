import { render, screen } from "@testing-library/react";
import CommonsAveragesTable from "main/components/Statistics/CommonsAveragesTable";
import { statisticsFixtures } from "fixtures/statisticsFixtures";

describe("CommonsAveragesTable tests", () => {
  test("renders all rows", () => {
    render(
      <CommonsAveragesTable averages={statisticsFixtures.commonsAverages} />,
    );

    const testId = "CommonsAveragesTable";
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-diningCommonsCode`),
    ).toHaveTextContent("carrillo");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-averageStars`),
    ).toHaveTextContent("4.00");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-reviewCount`),
    ).toHaveTextContent("18");

    expect(
      screen.getByTestId(`${testId}-cell-row-3-col-diningCommonsCode`),
    ).toHaveTextContent("portola");
    expect(
      screen.getByTestId(`${testId}-cell-row-3-col-averageStars`),
    ).toHaveTextContent("3.90");
  });

  test("renders headers", () => {
    render(
      <CommonsAveragesTable averages={statisticsFixtures.commonsAverages} />,
    );

    expect(
      screen.getByTestId("CommonsAveragesTable-header-diningCommonsCode"),
    ).toHaveTextContent("Dining Commons");
    expect(
      screen.getByTestId("CommonsAveragesTable-header-averageStars"),
    ).toHaveTextContent("Average Score");
    expect(
      screen.getByTestId("CommonsAveragesTable-header-reviewCount"),
    ).toHaveTextContent("Reviews");
  });

  test("accepts custom testIdPrefix", () => {
    render(
      <CommonsAveragesTable
        averages={statisticsFixtures.commonsAverages}
        testIdPrefix="CustomPrefix"
      />,
    );

    expect(
      screen.getByTestId("CustomPrefix-cell-row-0-col-diningCommonsCode"),
    ).toHaveTextContent("carrillo");
  });
});
