import React from "react";
import OurTable from "main/components/OurTable";

export default function MealsTable({ meals }) {
  // Stryker disable all : hard to test for query caching



  const columns = [
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Code",
      accessor: "code",
    },
  ];

  return <OurTable data={meals} columns={columns} testid={"MealsTable"} />;
}
