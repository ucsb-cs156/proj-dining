import OurTable, { ButtonColumn } from "../OurTable";
import { hasRole } from "../../utils/currentUser";
import { Link } from "react-router";

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
      Header: "Reviews",
      accessor: "id",
      Cell: ({ value }) => <Link to={`/reviews/${value}`}>Reviews</Link>,
    },
  ];
  if (hasRole(currentUser, "ROLE_USER")) {
    columns.push(
      ButtonColumn("Review Item", "warning", reviewCallback, testid),
    );
  }

  return <OurTable columns={columns} data={menuItems} testid={testid} />;
}
