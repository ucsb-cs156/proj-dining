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
    { method: "GET", url: "/api/admin/usersWithProposedAlias" },
    [],
  );

  if (!currentUser.loggedIn || !hasRole(currentUser, "ROLE_ADMIN")) {
    return <Navigate to="/" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h2>Moderation Page</h2>
        <AliasTable alias={data} />
        {/* <DiningCommonsTable commons={data} date={date} /> */}
        {/* create a table with 3 columns: alias, approve, reject */}
      </div>
    </BasicLayout>
  );
};

export default Moderate;
