import React from "react";
import OurTable from "main/components/OurTable";

export default function CommonsAveragesOverTimeTable({
  rows,
  testIdPrefix = "CommonsAveragesOverTimeTable",
}) {
  const columns = [
    {
      Header: "Dining Commons",
      accessor: "diningCommonsCode",
    },
    {
      Header: "Month",
      accessor: "period",
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

  return <OurTable data={rows} columns={columns} testid={testIdPrefix} />;
}
