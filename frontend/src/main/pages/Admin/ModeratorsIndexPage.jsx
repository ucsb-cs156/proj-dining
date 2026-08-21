import { useState } from "react";
import { Button } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RoleEmailTable from "main/components/Users/RoleEmailTable";
import RoleEmailAddModal from "main/components/Users/RoleEmailAddModal";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

const getEndpoint = "/api/admin/moderators/all";

export default function ModeratorsIndexPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addServerError, setAddServerError] = useState(null);

  const { data: moderators } = useBackend(
    [getEndpoint],
    { method: "GET", url: getEndpoint },
    [],
  );

  const addMutation = useBackendMutation(
    (email) => ({
      url: "/api/admin/moderators/post",
      method: "POST",
      params: { email },
    }),
    {
      onSuccess: (moderator) => {
        toast(`New moderator added - email: ${moderator.email}`);
        setShowAddModal(false);
        setAddServerError(null);
      },
      onError: (error) => {
        setAddServerError(
          error?.response?.data?.message ?? "Unable to add moderator.",
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
          data-testid="ModeratorsIndexPage-add-button"
        >
          Add Moderator
        </Button>
        <h1>Moderators</h1>
        <RoleEmailTable
          data={moderators}
          deleteEndpoint="/api/admin/moderators/delete"
          getEndpoint={getEndpoint}
          testIdPrefix="ModeratorsIndexPage"
        />
      </div>
      <RoleEmailAddModal
        show={showAddModal}
        onHide={closeAddModal}
        onSubmitEmail={(email) => addMutation.mutate(email)}
        title="Add Moderator"
        buttonLabel="Add"
        serverError={addServerError}
      />
    </BasicLayout>
  );
}
