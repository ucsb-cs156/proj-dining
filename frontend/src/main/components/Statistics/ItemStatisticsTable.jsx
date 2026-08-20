import React from "react";
import OurTable from "main/components/OurTable";

export default function ItemStatisticsTable({
  items,
  testIdPrefix = "ItemStatisticsTable",
}) {
  const columns = [
    {
      Header: "Item",
      accessor: "itemName",
    },
    {
      Header: "Dining Commons",
      accessor: "diningCommonsCode",
    },
    {
      Header: "Meal",
      accessor: "mealCode",
    },
    {
      Header: "Station",
      accessor: "station",
    },
    {
      Header: "Average Score",
      accessor: "averageStars",
      Cell: ({ value }) => value.toFixed(2),
    },
    {
      Header: "Reviews",
      accessor: "reviewCount",
    },
  ];

  return <OurTable data={items} columns={columns} testid={testIdPrefix} />;
}
