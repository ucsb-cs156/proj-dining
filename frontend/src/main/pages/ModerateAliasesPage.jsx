import React from "react";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";

const ModerateAliases = () => {
  const currentUser = useCurrentUser();

  const {
    data: aliases,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews/needsmoderation"],
    { method: "GET", url: "/api/reviews/needsmoderation" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderation Page</h1>
        <AliasApprovalTable aliases={aliases} />
      </div>
    </BasicLayout>
  );
};

export default ModerateAliases;