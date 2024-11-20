import React from "react";
import OurTable from "main/components/OurTable";

export default function MealsTable({ meals }) {

  // Stryker disable all : hard to test for query caching

  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this

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
