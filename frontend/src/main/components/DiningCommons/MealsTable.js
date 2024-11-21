import React from "react";
import { Link } from "react-router-dom";
import OurTable from "main/components/OurTable";

export default function MealsTable({mealsData, dateTime, diningCommonsCode}) {
  const columns = [
    {
      Header: "Meal",
      accessor: "name",
      Cell: ({ value }) => <Link to={`/diningcommons/${dateTime}/${diningCommonsCode}/${value}`}>{value}</Link>,
    }
  ];

  return (
    <OurTable
      data={mealsData}
      columns={columns}
      testid={"MealsTable"}
    />
  );
}
