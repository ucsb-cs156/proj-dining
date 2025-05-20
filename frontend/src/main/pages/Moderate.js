import React from "react";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import { Navigate } from "react-router-dom";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { _Table, _Button } from "react-bootstrap";
import AliasTable from "../components/Alias/AliasTable";
import { useBackend } from "../utils/useBackend";

const Moderate = () => {
  const { data: currentUser } = useCurrentUser();
  const { data } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/admin/usersWithProposedAlias`],
    // Stryker disable next-line all : don't test internal caching of React Query
    { method: "GET", url: "/api/admin/usersWithProposedAlias" },
    [],
  );

  if (!currentUser.loggedIn || !hasRole(currentUser, "ROLE_ADMIN")) {
    return <Navigate to="/" />;
  }

  // TODO: Replace this placeholder with the actual Reviews Table component when available
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderation Page</h1>

        <h4> Alias Table </h4>
        <AliasTable alias={data} />
        <br />
        <h4> Reviews Table </h4>
        {/* Placeholder: Using AliasTable for Reviews Table until ReviewsTable component is implemented */}
        <AliasTable alias={data} />
      </div>
    </BasicLayout>
  );
};

export default Moderate;
