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
  ];
  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn("Review Item", "warning", reviewCallback, testid),
    );
  }

  return <OurTable columns={columns} data={menuItems} testid={testid} />;
}
