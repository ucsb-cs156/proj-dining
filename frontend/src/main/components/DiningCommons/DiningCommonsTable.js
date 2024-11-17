import React from "react";
import OurTable from "main/components/OurTable";

export default function DiningCommonsTable({ diningCommonsData }) {
  const columns = [
    {
      Header: "Code",
      accessor: "code",
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
