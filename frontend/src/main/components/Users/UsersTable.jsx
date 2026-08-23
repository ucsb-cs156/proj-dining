import OurTable from "main/components/OurTable";
import PropTypes from "prop-types";

const formatApprovalDate = (dateApproved) => {
  if (typeof dateApproved !== "string") {
    return null;
  }

  const dateParts = dateApproved.split("-");
  const yearString = dateParts[0];
  const monthString = dateParts[1];
  const dayString = dateParts[2];
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (date.toISOString().slice(0, 10) !== dateApproved) {
    return null;
  }

  return `${month}/${day}/${year}`;
};

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
    Header: "Moderator",
    id: "moderator",
    accessor: (row, _rowIndex) => String(row.moderator),
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
      if (row.status === "APPROVED") {
        const formattedDate = formatApprovalDate(row.dateApproved);
        if (!formattedDate) {
          return row.status;
        }
        return `Approved on ${formattedDate}`;
      }
      return row.status;
    },
  },
];

export default function UsersTable({ users }) {
  return <OurTable data={users} columns={columns} testid={"UsersTable"} />;
}

UsersTable.propTypes = Object.create(null);
UsersTable.propTypes.users = PropTypes.array.isRequired;
