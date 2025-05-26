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
    navigate(`/reviews/${_cell.row.original.id}`);
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
  ];

  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn("Review Item", "warning", reviewCallback, testid)
    );
    columns.push(ButtonColumn("All Reviews", "warning", viewCallback, testid));
  }

  return <OurTable columns={columns} data={menuItems} testid={testid} />;
}

