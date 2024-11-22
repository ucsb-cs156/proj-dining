import OurTable from "main/components/OurTable";

const columns = [
  {
    Header: "id",
    accessor: "id", // accessor is the "key" in the data
  },
  {
    Header: "First Name",
    accessor: "givenName",
  },
  {
    Header: "Last Name",
    accessor: "familyName",
  },
  {
    Header: "Email",
    accessor: "email",
  },
  {
    Header: "Admin",
    id: "admin",
    accessor: (row, _rowIndex) => String(row.admin), // hack needed for boolean values to show up
  },
  {
    Header: "Alias",
    accessor: "alias",
  },
  {
    Header: "Moderation Status",
    accessor: "moderation",
    Cell: ({ value }) => {
      switch (value) {
        case "Approved":
          return "APPROVED";
        case "Rejected":
          return "REJECTED";
        default:
          return "Awaiting Moderation";
      }
    },
  },
];

export default function UsersTable({ users }) {
  return <OurTable data={users} columns={columns} testid={"UsersTable"} />;
}
