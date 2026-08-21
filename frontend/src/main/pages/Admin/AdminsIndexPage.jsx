import { useState } from "react";
import { Button } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RoleEmailTable from "main/components/Users/RoleEmailTable";
import RoleEmailAddModal from "main/components/Users/RoleEmailAddModal";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

const getEndpoint = "/api/admin/all";

export default function AdminsIndexPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addServerError, setAddServerError] = useState(null);

  const { data: admins } = useBackend(
    [getEndpoint],
    { method: "GET", url: getEndpoint },
    [],
  );

  const addMutation = useBackendMutation(
    (email) => ({
      url: "/api/admin/post",
      method: "POST",
      params: { email },
    }),
    {
      onSuccess: (admin) => {
        toast(`New admin added - email: ${admin.email}`);
        setShowAddModal(false);
        setAddServerError(null);
      },
      onError: (error) => {
        setAddServerError(
          error?.response?.data?.message ?? "Unable to add admin.",
        );
      },
    },
    [getEndpoint],
  );

  const openAddModal = () => {
    setAddServerError(null);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddServerError(null);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <Button
          className="btn btn-primary"
          style={{ float: "right" }}
          onClick={openAddModal}
          data-testid="AdminsIndexPage-add-button"
        >
          Add Admin
        </Button>
        <h1>Admins</h1>
        <RoleEmailTable
          data={admins}
          deleteEndpoint="/api/admin/delete"
          getEndpoint={getEndpoint}
          testIdPrefix="AdminsIndexPage"
        />
        <p>
          Note: Initial admins that are set in the <code>ADMIN_EMAILS</code>
          &nbsp; configuration cannot be deleted through the application.
        </p>
      </div>
      <RoleEmailAddModal
        show={showAddModal}
        onHide={closeAddModal}
        onSubmitEmail={(email) => addMutation.mutate(email)}
        title="Add Admin"
        buttonLabel="Add"
        serverError={addServerError}
      />
    </BasicLayout>
  );
}
