import React from "react";
import { Link } from "react-router-dom";
import OurTable from "main/components/OurTable";

export default function DiningCommonsTable({ diningCommonsData }) {
  const columns = [
    {
      Header: "Code",
      accessor: "code",
      Cell: ({ value }) => <Link to={`/diningcommons/${value}`}>{value}</Link>,
    },
    {
      Header: "Name",
      accessor: "name",
    },
  ];

  return (
    <OurTable
      data={diningCommonsData}
      columns={columns}
      testid={"DiningCommonsTable"}
    />
  );
}
