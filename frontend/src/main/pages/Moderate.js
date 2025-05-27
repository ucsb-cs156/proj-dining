import React from "react";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import { Navigate } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { _Table, _Button } from "react-bootstrap"; // Optional: remove if unused
import AliasTable from "../components/Alias/AliasTable";
import { useBackend } from "../utils/useBackend";

const Moderate = () => {
  const { data: currentUser } = useCurrentUser();

  if (
    !currentUser.loggedIn ||
    (!hasRole(currentUser, "ROLE_ADMIN") &&
      !hasRole(currentUser, "ROLE_MODERATOR"))
  ) {
    return <Navigate to="/" />;
  }

  const { data } = useBackend(
    [`/api/admin/usersWithProposedAlias`],
    { method: "GET", url: "/api/admin/usersWithProposedAlias" },
    [],
  );

  return (
    <BasicLayout id="moderate-page" data-testid="moderate-page">
      <div className="pt-2">
        <h2>Moderation Page</h2>
        <p>
          This page is accessible only to admins and moderators. (Placeholder)
        </p>
        <AliasTable alias={data || []} />
      </div>
    </BasicLayout>
  );
};

export default Moderate;