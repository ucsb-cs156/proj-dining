import OurTable, { ButtonColumn } from "../OurTable";
import { hasRole } from "../../utils/currentUser";

export default function MenuItemTable({ menuItems, currentUser }) {
  const testid = "MenuItemTable";
  const reviewCallback = async (_cell) => {
    alert("Reviews coming soon!");
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
      accessor: (row) => {
        const reviews = row.reviews;
        if (!reviews || reviews.length === 0) return "🤷‍♂️ No Rating";
        const avg =
          reviews.reduce((sum, r) => sum + r.itemsStars, 0) / reviews.length;
        return `${avg.toFixed(1)} ⭐`;
      },
      id: "averageReview",
    },
  ];
  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn("Review Item", "warning", reviewCallback, testid),
    );
  }

  return <OurTable columns={columns} data={menuItems} testid={testid} />;
}
