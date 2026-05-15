import OurTable from "main/components/OurTable";
import { Button } from "react-bootstrap";
import { useQueryClient } from "react-query";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

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
      if (row.status === "Approved" && row.dateApproved) {
        // Parse as local date (YYYY-MM-DD)
        const [year, month, day] = row.dateApproved.split("-");
        const formattedDate = new Date(
          year,
          month - 1,
          day,
        ).toLocaleDateString();
        return `Approved on ${formattedDate}`;
      }
      return row.status;
    },
  },
];

export default function UsersTable({ users }) {
  const queryClient = useQueryClient();

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
        queryClient.invalidateQueries(["/api/admin/users"]);
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
        queryClient.invalidateQueries(["/api/admin/users"]);
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
      columns={[...columns, toggleAdminColumn, toggleModeratorColumn]}
      testid={"UsersTable"}
    />
  );
}
