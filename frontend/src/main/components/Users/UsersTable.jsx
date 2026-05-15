import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";

const cellToAxiosParamsToggleAdmin = (cell) => ({
  method: "PUT",
  url: "/api/admin/toggleAdmin",
  params: { id: cell.row.values.id },
});

const cellToAxiosParamsToggleModerator = (cell) => ({
  method: "PUT",
  url: "/api/admin/toggleModerator",
  params: { id: cell.row.values.id },
});

const baseColumns = [
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

export default function UsersTable({
  users,
  showToggleRoleButtons,
  currentUser,
}) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [pendingCell, setPendingCell] = useState(null);

  // Stryker disable all
  const toggleAdminMutation = useBackendMutation(
    cellToAxiosParamsToggleAdmin,
    {},
    ["/api/admin/users"],
  );

  const toggleModeratorMutation = useBackendMutation(
    cellToAxiosParamsToggleModerator,
    {},
    ["/api/admin/users"],
  );
  // Stryker restore all

  const toggleAdminCallback = (cell) => {
    if (currentUser?.root?.user?.id === cell.row.values.id) {
      setPendingCell(cell);
      setShowModal(true);
    } else {
      toggleAdminMutation.mutate(cell);
    }
  };

  // Stryker disable next-line all
  const toggleModeratorCallback = async (cell) => {
    toggleModeratorMutation.mutate(cell);
  };

  const handleConfirm = () => {
    setShowModal(false);
    toggleAdminMutation.mutate(pendingCell);
    navigate("/");
  };

  const handleCancel = () => {
    setShowModal(false);
    // Stryker disable next-line all
    setPendingCell(null);
  };

  const columns = [...baseColumns];

  if (showToggleRoleButtons) {
    columns.push(
      ButtonColumn(
        "Toggle Admin",
        "primary",
        toggleAdminCallback,
        "UsersTable",
      ),
    );
    columns.push(
      ButtonColumn(
        "Toggle Moderator",
        "primary",
        toggleModeratorCallback,
        "UsersTable",
      ),
    );
  }

  return (
    <>
      <OurTable data={users} columns={columns} testid={"UsersTable"} />
      {showModal && (
        <Modal
          show
          onHide={handleCancel}
          data-testid="confirm-admin-toggle-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Admin Toggle</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Are you sure you want to toggle admin status for your own account?
            </p>
            <p>
              You will lose admin access and be redirected to the home page.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={handleCancel}
              data-testid="confirm-admin-toggle-cancel"
            >
              No
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              data-testid="confirm-admin-toggle-confirm"
            >
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}
