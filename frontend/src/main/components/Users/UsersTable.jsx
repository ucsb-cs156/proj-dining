import OurTable from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UsersTable({ users }) {
  // helper function to toggle admin status
  const toggleAdminMutation = useBackendMutation(
    (row) => ({
      url: "/api/admin/toggleAdmin",
      method: "PUT",
      params: { id: row.id },
    }),
    {
      onSuccess: (_data, row) =>
        toast("Updated admin status for user " + row.givenName),
    },
    // Stryker disable next-line all : don't test internal caching of react query
    ["/api/admin/users"],
  );
  // toggle admin status
  const handleAdminToggle = (row) => {
    toggleAdminMutation.mutate(row);
  };

  // helper function to toggle moderator status
  const toggleModeratorMutation = useBackendMutation(
    (row) => ({
      url: "/api/admin/toggleModerator",
      method: "PUT",
      params: { id: row.id },
    }),
    {
      onSuccess: (_data, row) =>
        toast("Updated moderator status for user " + row.givenName),
    },
    // Stryker disable next-line all : don't test internal caching of react query
    ["/api/admin/users"],
  );
  // toggle moderator status
  const handleModeratorToggle = (row) => {
    toggleModeratorMutation.mutate(row);
  };

  // the table
  const columns = [
    {
      Header: "id",
      accessor: "id",
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
      accessor: (row) => {
        return (
          // Stryker disable next-line StringLiteral
          <div style={{ display: "flex", gap: "5%", justifyContent: "center" }}>
            {/* checkbox: toggle admin status */}
            <input
              type="checkbox"
              aria-label="admin"
              name="adminToggle"
              checked={row.admin}
              onChange={() => handleAdminToggle(row)}
            />
          </div>
        );
      },
    },
    {
      Header: "Moderator",
      id: "moderator",
      accessor: (row) => {
        return (
          // Stryker disable next-line StringLiteral
          <div style={{ display: "flex", justifyContent: "center" }}>
            {/* checkbox: toggle moderator status */}
            <input
              type="checkbox"
              aria-label="moderator"
              name="moderatorToggle"
              checked={row.moderator}
              onChange={() => handleModeratorToggle(row)}
            />
          </div>
        );
      },
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

  return <OurTable data={users} columns={columns} testid={"UsersTable"} />;
}
