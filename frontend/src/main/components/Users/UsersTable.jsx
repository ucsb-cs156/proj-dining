import OurTable from "main/components/OurTable";
import { Button } from "react-bootstrap";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
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

export default function UsersTable({ users, showToggleButtons = false }) {
  const toggleAdminMutation = useBackendMutation(
    (cell) => ({
      url: "/api/admin/toggleAdmin",
      method: "PUT",
      params: {
        id: cell.row.values.id,
      },
    }),
    {
      onSuccess: () => {
        toast("Admin status toggled");
      },
    },
    ["/api/admin/users"],
  );

  const toggleModeratorMutation = useBackendMutation(
    (cell) => ({
      url: "/api/admin/toggleModerator",
      method: "PUT",
      params: {
        id: cell.row.values.id,
      },
    }),
    {
      onSuccess: () => {
        toast("Moderator status toggled");
      },
    },
    ["/api/admin/users"],
  );

  const toggleAdminColumn = {
    Header: "Toggle Admin",
    id: "toggle-admin",
    Cell: (cell) => (
      <Button
        variant="primary"
        onClick={() => toggleAdminMutation.mutate(cell)}
        data-testid={`UsersTable-cell-row-${cell.row.index}-col-toggle-admin-button`}
      >
        Toggle Admin
      </Button>
    ),
  };

  const toggleModeratorColumn = {
    Header: "Toggle Moderator",
    id: "toggle-moderator",
    Cell: (cell) => (
      <Button
        variant="primary"
        onClick={() => toggleModeratorMutation.mutate(cell)}
        data-testid={`UsersTable-cell-row-${cell.row.index}-col-toggle-moderator-button`}
      >
        Toggle Moderator
      </Button>
    ),
  };

  return (
    <OurTable
      data={users}
      columns={
        showToggleButtons
          ? [...columns, toggleAdminColumn, toggleModeratorColumn]
          : columns
      }
      testid={"UsersTable"}
    />
  );
}

UsersTable.propTypes = Object.create(null);
UsersTable.propTypes.users = PropTypes.array.isRequired;
UsersTable.propTypes.showToggleButtons = PropTypes.bool;
