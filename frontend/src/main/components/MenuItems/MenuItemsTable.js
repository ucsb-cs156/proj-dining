import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useNavigate } from "react-router-dom";

export default function MenuItemsTable({ menuItems }) {
  const _navigate = useNavigate();

  const reviewCallback = (_cell) => {
    //navigate(`/menuitems/review/${cell.row.values.id}`);
    window.alert("Feature coming soon!");
  };

  // Stryker disable all : hard to test for query caching

  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  //make a test for stryker window alert
  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "DiningCommonsCode",
      accessor: "diningCommonsCode",
    },
    {
      Header: "Meal",
      accessor: "meal",
    },
    {
      Header: "ItemName",
      accessor: "itemName",
    },
    {
      Header: "Station",
      accessor: "station",
    },
  ];

  columns.push(
    ButtonColumn(
      "Review this item",
      "primary",
      reviewCallback,
      "MenuItemsTable",
    ),
  );

  return (
    <OurTable data={menuItems} columns={columns} testid={"MenuItemsTable"} />
  );
}
