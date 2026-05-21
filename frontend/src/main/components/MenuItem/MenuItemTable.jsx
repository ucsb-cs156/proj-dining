import OurTable, { ButtonColumn } from "main/components/OurTable";
import { hasRole } from "main/utils/currentUser";
import { useNavigate } from "react-router";
import React, { useState } from "react";

export default function MenuItemTable({ menuItems, currentUser }) {
  const testid = "MenuItemTable";
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const reviewCallback = async (_cell) => {
    const itemId = _cell.row.original.id;
    navigate(`/reviews/post/${itemId}`);
  };

  const viewCallback = async (_cell) => {
    const itemId = _cell.row.original.id;
    navigate(`/reviews/${itemId}`);
  };

  const calculateAverageRating = (reviews) => {
    if (!reviews || !Array.isArray(reviews) || reviews.length === 0)
      return "No reviews";
    const validRatings = reviews
      .filter(
        (r) => r && typeof r === "object" && typeof r.itemsStars === "number",
      )
      .map((r) => r.itemsStars);
    if (validRatings.length === 0) return "No ratings";
    const avg = validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
    return avg.toFixed(1);
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
      Header: "Average Rating",
      accessor: (row) => calculateAverageRating(row.reviews),
      id: "averageRating",
    },
  ];

  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn("Review Item", "warning", reviewCallback, testid),
    );
    columns.push(ButtonColumn("All Reviews", "warning", viewCallback, testid));
  }

  // split input (delimiters: space, comma) into non-empty keywords
  const keywords = searchTerm
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  const searchedItems = menuItems.filter((item) => {
    return keywords.every(
      (kw) =>
        item.name.toLowerCase().includes(kw) ||
        item.station.toLowerCase().includes(kw),
    );
  });

  return (
    <>
      <input
        type="text"
        placeholder="Search by keywords (separated by space or comma)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="form-control mb-3"
      />
      <OurTable columns={columns} data={searchedItems} testid={testid} />
    </>
  );
}
