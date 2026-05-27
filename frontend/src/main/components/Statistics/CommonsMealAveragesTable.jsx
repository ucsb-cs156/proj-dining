import React from "react";
import OurTable from "main/components/OurTable";

export default function CommonsMealAveragesTable({
  averages,
  testIdPrefix = "CommonsMealAveragesTable",
}) {
  const columns = [
    {
      Header: "Meal",
      accessor: "mealCode",
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

  return <OurTable data={averages} columns={columns} testid={testIdPrefix} />;
}
