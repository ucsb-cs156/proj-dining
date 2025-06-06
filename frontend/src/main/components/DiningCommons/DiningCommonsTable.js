import React from "react";
import OurTable from "main/components/OurTable";
import { Link } from "react-router";

export default function DiningCommonsTable({ commons, date }) {
  const testid = "DiningCommonsTable";
  const columns = [
    {
      Header: "Code",
      accessor: "code", // accessor is the "key" in the data
      Cell: ({ value }) => (
        <Link to={`/diningcommons/${date}/${value}`}>{value}</Link>
      ),
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Has Dining Cam",
      accessor: "hasDiningCam",
      // Credits to Jayden for the code here!
      // Renders a checkmark box.
      Cell: ({ value }) => (value ? "✅" : "❌"),
    },
    {
      Header: "Has Sack Meal",
      accessor: "hasSackMeal",
      Cell: ({ value }) => (value ? "✅" : "❌"),
    },
    {
      Header: "Has Takeout Meal",
      accessor: "hasTakeoutMeal",
      Cell: ({ value }) => (value ? "✅" : "❌"),
    },
  ];

  const displayedColumns = columns;

  return <OurTable data={commons} columns={displayedColumns} testid={testid} />;
}
