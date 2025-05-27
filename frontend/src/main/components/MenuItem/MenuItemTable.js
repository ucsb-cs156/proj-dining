// src/main/components/MenuItem/MenuItemTable.jsx

import React from "react";
import OurTable, { ButtonColumn } from "../OurTable";
import { hasRole } from "../../utils/currentUser";
import { useNavigate, useLocation } from "react-router-dom";

export const extractAllReviewsForItem = (raw, itemId) => {
  const seen = new Set();
  const reviews = [];

  const recurse = (node) => {
    // known issue with Stryker on recursion with array checking
    // Stryker disable next-line all : recursion
    if (Array.isArray(node)) {
      node.forEach(recurse);
    } else if (node) {
      if (seen.has(node)) return;
      seen.add(node);

      const isReviewForItem =
        typeof node.itemsStars !== "undefined" &&
        (node.item.id === itemId || node.item === itemId);

      if (isReviewForItem) {
        reviews.push(node);
      }

      Object.values(node).forEach(recurse);
    }
  };

  recurse(raw);
  return reviews;
};

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
        const extracted = extractAllReviewsForItem(row.reviews, row.id);

        const validRatings = extracted
          .map((r) => {
            const num = Number(r.itemsStars);
            return Number.isFinite(num) && num >= 1 && num <= 5 ? num : null;
          })
          .filter((num) => num !== null);

        if (validRatings.length === 0) {
          return "🤷‍♂️ No Rating";
        }

        let total = 0;
        for (const stars of validRatings) {
          total = total + stars;
        }
        const avg = total / validRatings.length;
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
