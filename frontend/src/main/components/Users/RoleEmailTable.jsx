import { useState } from "react";
import { Button } from "react-bootstrap";
import OurTable from "main/components/OurTable";
import RoleEmailDeleteModal from "main/components/Users/RoleEmailDeleteModal";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

export default function RoleEmailTable({
  data,
  deleteEndpoint = "/api/admin/delete",
  getEndpoint = "/api/admin/all",
  testIdPrefix = "RoleEmailTable",
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  const deleteMutation = useBackendMutation(
    (email) => ({
      url: deleteEndpoint,
      method: "DELETE",
      params: { email },
    }),
    {
      onSuccess: (deleted) => {
        toast(deleted?.message ?? "Deleted");
      },
    },
    [getEndpoint],
  );

  const openDeleteModal = (email) => {
    setPendingEmail(email);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPendingEmail(null);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(pendingEmail);
    closeDeleteModal();
  };

  const columns = [
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Delete",
      id: "delete",
      Cell: (cell) => {
        if (cell.row.original.isInAdminEmails) {
          return (
            <span
              data-testid={`${testIdPrefix}-cell-row-${cell.row.index}-cannot-delete`}
            >
              In <code>ADMIN_EMAILS</code>
            </span>
          );
        }
        return (
          <Button
            className="btn btn-danger"
            onClick={() => openDeleteModal(cell.row.original.email)}
            data-testid={`${testIdPrefix}-cell-row-${cell.row.index}-col-delete-button`}
          >
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <OurTable
        data={Array.isArray(data) ? data : []}
        columns={columns}
        testid={testIdPrefix}
      />
      <RoleEmailDeleteModal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        email={pendingEmail}
        onConfirm={confirmDelete}
      />
    </>
  );
}

RoleEmailTable.propTypes = Object.create(null);
RoleEmailTable.propTypes.data = PropTypes.array;
RoleEmailTable.propTypes.deleteEndpoint = PropTypes.string;
RoleEmailTable.propTypes.getEndpoint = PropTypes.string;
RoleEmailTable.propTypes.testIdPrefix = PropTypes.string;
