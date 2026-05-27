import React from "react";
import OurTable from "main/components/OurTable";

export default function CommonsAveragesTable({
  averages,
  testIdPrefix = "CommonsAveragesTable",
}) {
  const columns = [
    {
      Header: "Dining Commons",
      accessor: "diningCommonsCode",
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
