import React from "react";
import OurTable from "main/components/OurTable";
import { Link } from "react-router-dom";

export default function DiningCommonsTable({ diningcommons }) {
  const columns = [
    {
      Header: "Name",
      accessor: "name",
      Cell: ({ value, row }) => (
        <Link to={`/diningcommons/${row.original.code}`}>{value}</Link>
      ),
    },
    {
      Header: "Code",
      accessor: "code",
    },
    {
      Header: "Has DiningCam",
      accessor: "hasDiningCam",
      Cell: ({ value }) => (value ? "Yes" : "No"),
    },
    {
      Header: "Has Sack Meal",
      accessor: "hasSackMeal",
      Cell: ({ value }) => (value ? "Yes" : "No"),
    },
    {
      Header: "Has Takeout Meal",
      accessor: "hasTakeoutMeal",
      Cell: ({ value }) => (value ? "Yes" : "No"),
    },
  ];

  return (
    <div>
      {diningcommons.length === 0 ? (
        <div data-testid="DiningCommonsTable-empty-message">
          No data available
        </div>
      ) : (
        <OurTable
          data={diningcommons}
          columns={columns}
          testid={"DiningCommonsTable"}
        />
      )}
    </div>
  );
}
