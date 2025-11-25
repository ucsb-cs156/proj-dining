import React from "react";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import { toast } from "react-toastify";

const ModerateAliasesPage = () => {
  const {
    data: users,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/usersWithProposedAlias"],
    // Stryker disable next-line all : don't test internal caching of React Query
    { method: "GET", url: "/api/admin/usersWithProposedAlias" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  const objectToAxiosPutParams = (params) => ({
    url: "/api/currentUser/updateAliasModeration",
    method: "PUT",
    params: {
      id: params.id,
      approved: params.approved,
    },
  });

  const onSuccess = () => {
    toast.success(`Alias moderation updated successfully`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/usersWithProposedAlias"],
  );

  const handleApprove = async (user) => {
    mutation.mutate({ id: user.id, approved: true });
  };

  const handleReject = async (user) => {
    mutation.mutate({ id: user.id, approved: false });
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderate Aliases</h1>
        <AliasApprovalTable
          aliases={users}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </BasicLayout>
  );
};

export default ModerateAliasesPage;
