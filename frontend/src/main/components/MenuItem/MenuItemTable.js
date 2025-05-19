// src/main/components/MenuItem/MenuItemTable.jsx

import React from "react";
import OurTable, { ButtonColumn } from "../OurTable";
import { hasRole } from "../../utils/currentUser";
import { useNavigate, useLocation } from "react-router-dom";

export default function MenuItemTable({ menuItems, currentUser }) {
  const testid = "MenuItemTable";
  const navigate = useNavigate();
  const location = useLocation();

  const reviewCallback = (cell) => {
    const id = cell.row.original.id;
    navigate(`/reviews/create/${id}`, {
      state: { from: location.pathname },
    });
  };

  const columns = [
    {
      Header: "Item Name",
      accessor: "name",
    },
    {
      Header: "Station",
      accessor: "station",
    },
    {
      Header: "Average Review",
      id: "averageReview",
      accessor: (row) => {
        const reviews = row.reviews;
        if (!reviews) {
          return "🤷‍♂️ No Rating";
        }
        const validRatings = reviews
          .map((r) => {
            const num = Number(r.itemsStars);
            return isNaN(num) ? null : num;
          })
          .filter(
            (stars) => Number.isFinite(stars) && stars >= 1 && stars <= 5,
          );

        if (validRatings.length === 0) {
          return "🤷‍♂️ No Rating";
        }

        const avg =
          validRatings.reduce((sum, stars) => sum + stars, 0) /
          validRatings.length;

        return `${avg.toFixed(1)} ⭐`;
      },
    },
  ];

  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn("Review Item", "warning", reviewCallback, testid),
    );
  }

  return <OurTable columns={columns} data={menuItems} testid={testid} />;
}
