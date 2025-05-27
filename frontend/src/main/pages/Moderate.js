import React from "react";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import { Navigate } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

const Moderate = () => {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser.loggedIn || !hasRole(currentUser, "ROLE_ADMIN")) {
    return <Navigate to="/" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderation Page</h1>
        <p>This page is accessible only to admins. (Placeholder)</p>
      </div>
    </BasicLayout>
  );
};

export default Moderate;
