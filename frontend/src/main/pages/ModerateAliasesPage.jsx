import React from "react";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import {
  cellToAxiosParamsApprove,
  cellToAxiosParamsReject,
} from "main/utils/Aliases";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import { onModerateSuccess } from "main/utils/Aliases";

const ModerateAliases = () => {
  const currentUser = useCurrentUser();

  //
  // Aliases needing moderation
  //
  const { data: aliases } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/usersWithProposedAlias"],
    // Stryker disable next-line all : don't test internal caching of React Query
    { method: "GET", url: "/api/admin/usersWithProposedAlias" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  //
  // ---- APPROVE MUTATION ----
  //
  const approveMutation = useBackendMutation(
    cellToAxiosParamsApprove,
    // On success: invalidate both relevant query keys
    { onSuccess: onModerateSuccess },
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/usersWithProposedAlias"],
  );

  //
  // ---- REJECT MUTATION ----
  //
  const rejectMutation = useBackendMutation(
    cellToAxiosParamsReject,
    { onSuccess: onModerateSuccess },
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/usersWithProposedAlias"],
  );

  //
  // Callbacks (just trigger the mutations)
  //
  const approveCallback = (alias) => {
    approveMutation.mutate(alias);
  };

  const rejectCallback = (alias) => {
    rejectMutation.mutate(alias);
  };

  const moderateAliasesOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderation Page</h1>
        <AliasApprovalTable
          aliases={aliases}
          approveCallback={approveCallback}
          rejectCallback={rejectCallback}
          moderatorOptions={moderateAliasesOptions}
        />
      </div>
    </BasicLayout>
  );
};

export default ModerateAliases;
