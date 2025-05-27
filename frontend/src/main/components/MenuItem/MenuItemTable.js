import OurTable, { ButtonColumn } from "../OurTable";
import { hasRole } from "../../utils/currentUser";
import { useNavigate } from "react-router-dom";

export default function MenuItemTable({ menuItems, currentUser }) {
  const testid = "MenuItemTable";
  const navigate = useNavigate();
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

  return <OurTable columns={columns} data={menuItems} testid={testid} />;
}
