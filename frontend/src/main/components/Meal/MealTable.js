import React from "react";
import OurTable from "main/components/OurTable";
import { Link } from "react-router-dom";

export default function MealTable({
  meals,
  dateTime, 
  diningCommonsCode,
  testIdPrefix = "MealTable",
}) {
  const columns = [
    {
      Header: "Meal",
      accessor: "name", // accessor is the "key" in the data
      Cell: ({ row }) => (
        <Link
          to={`/api/diningcommons/${dateTime}/${diningCommonsCode}/${row.original.code}`}
        >
          {row.original.name}
        </Link>
      ),
    },
  ];

  return (
    <OurTable data={meals} columns={columns} testid={testIdPrefix} />
  );
}
