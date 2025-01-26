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
    Header: "Proposed Alias",
    accessor: "proposedAlias",
  },
  {
    Header: "Status",
    accessor: (row) => {
      if (row.status === "Approved" && row.dateApproved) {
        const formattedDate = new Date(row.dateApproved).toLocaleDateString();
        return `Approved on ${formattedDate}`;
      }
      return row.status;
    },
  },
];

export default function UsersTable({ users }) {
  return <OurTable data={users} columns={columns} testid={"UsersTable"} />;
}
