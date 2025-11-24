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
      Header: "Meals Offered Today",
      accessor: "mealsOfferedToday",
      Cell: ({ value, row }) => {
        return (
          <div>
            {!value || value.length === 0
              ? "No meals offered today"
              : value.map((meal) => (
                  <Link
                    to={`/diningcommons/${date}/${row.original.code}/${meal.code}`}
                    className="p-2"
                    data-testid={`DiningCommonsTable-cell-row-${row.index}-col-meal-${meal.code}`}
                  >
                    {meal.name}
                  </Link>
                ))}
          </div>
        );
      },
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
