import React from "react";
import { Link } from "react-router-dom";
import OurTable from "main/components/OurTable";

export default function DiningCommonsTable({
  diningCommons,
  testIdPrefix = "DiningCommonsTable",
}) {
  const columns = [
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Code",
      accessor: "code",
      Cell: ({ value }) => <Link to={`/diningcommons/${value}`}>{value}</Link>,
    },
    {
      Header: "Location",
      accessor: (row) => `${row.location.latitude}, ${row.location.longitude}`,
    },
    {
      Header: "Has Sack Meal",
      accessor: "hasSackMeal",
      Cell: ({ value }) => (value ? "Yes" : "No"),
    },
    {
      Header: "Has Take Out Meal",
      accessor: "hasTakeOutMeal",
      Cell: ({ value }) => (value ? "Yes" : "No"),
    },
    {
      Header: "Has Dining Cam",
      accessor: "hasDiningCam",
      Cell: ({ value }) => (value ? "Yes" : "No"),
    },
  ];

  return (
    <OurTable data={diningCommons} columns={columns} testid={testIdPrefix} />
  );
}
