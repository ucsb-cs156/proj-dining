import OurTable, { ButtonColumn } from "main/components/OurTable";
import { hasRole } from "main/utils/currentUser";
import { useNavigate } from "react-router";

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

  const calculateAverageRating = (reviewScore) => {
    if (!reviewScore) {
      return "No ratings";
    } else {
      return reviewScore.toFixed(1);
    }
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
      accessor: (row) => calculateAverageRating(row.reviewScore),
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
