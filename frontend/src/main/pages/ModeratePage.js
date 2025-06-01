import React from "react";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import { Navigate } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import { useBackendMutation } from "main/utils/useBackend";
import AliasTable from "main/components/Alias/AliasTable";
import { toast } from "react-toastify";

export default function ModeratePage() {
  const { data: currentUser } = useCurrentUser();

  const { data: aliases } = useBackend(["/api/admin/usersWithProposedAlias"], {
    method: "GET",
    url: "/api/admin/usersWithProposedAlias",
  });

  if (
    !currentUser.loggedIn ||
    (!hasRole(currentUser, "ROLE_ADMIN") &&
      !hasRole(currentUser, "ROLE_MODERATOR"))
  ) {
    return <Navigate to="/" />;
  }

  const objectToAxiosParamsApprove = (alias) => ({
    url: "/api/currentUser/updateAliasModeration",
    method: "PUT",
    params: { id: alias.id, approved: true },
  });

  const approveMutation = useBackendMutation(
    objectToAxiosParamsApprove,
    ["/api/admin/usersWithProposedAlias"],
    {
      onSuccess: (data, alias) => {
        toast.success(
          `Alias "${alias.proposedAlias}" for ID ${alias.id} approved!`,
        );
      },
      onError: (error) => {
        toast.error(
          `Error approving alias: ${error.message || "Unknown error"}`,
        );
      },
    },
  );

  const objectToAxiosParamsReject = (alias) => ({
    url: "/api/currentUser/updateAliasModeration",
    method: "PUT",
    params: { id: alias.id, approved: false },
  });

  const rejectMutation = useBackendMutation(
    objectToAxiosParamsReject,
    ["/api/admin/usersWithProposedAlias"],
    {
      onSuccess: (data, alias) => {
        toast.success(
          `Alias "${alias.proposedAlias}" for ID ${alias.id} rejected!`,
        );
      },
      onError: (error) => {
        toast.error(
          `Error rejecting alias: ${error.message || "Unknown error"}`,
        );
      },
    },
  );

  const handleApprove = (alias) => {
    approveMutation.mutate(alias);
  };

  const handleReject = (alias) => {
    rejectMutation.mutate(alias);
  };

  return (
    <BasicLayout id="moderatePage" data-testid="moderatePage">
      <div className="pt-2">
        <h1>Moderation Page</h1>
        <p>
          This page is accessible only to admins and moderators. (Placeholder)
        </p>
        <AliasTable
          aliases={aliases || []}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </BasicLayout>
  );
}
