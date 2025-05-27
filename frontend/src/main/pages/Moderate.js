import React from "react";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import { Navigate } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend } from "main/utils/useBackend";
import AliasTable from "main/components/Alias/AliasTable";
import axios from "axios";
import { toast } from "react-toastify";

const Moderate = () => {
  const { data: currentUser } = useCurrentUser();

  const { data } = useBackend(["/api/admin/usersWithProposedAlias"], {
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

  const handleApprove = async (alias) => {
    try {
      await axios.put("/api/currentUser/updateAliasModeration", null, {
        params: { id: alias.id, approved: true },
      });
      toast.success(
        `Alias "${alias.proposedAlias}" for ID ${alias.id} approved!`,
      );
    } catch (err) {
      toast.error(`Error approving alias: ${err?.message || "Unknown error"}`);
    }
  };

  const handleReject = async (alias) => {
    try {
      await axios.put("/api/currentUser/updateAliasModeration", null, {
        params: { id: alias.id, approved: false },
      });
      toast.success(
        `Alias "${alias.proposedAlias}" for ID ${alias.id} rejected!`,
      );
    } catch (err) {
      toast.error(`Error rejecting alias: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <BasicLayout id="moderate-page" data-testid="moderate-page">
      <div className="pt-2">
        <h1>Moderation Page</h1>
        <p>
          This page is accessible only to admins and moderators. (Placeholder)
        </p>
        <AliasTable
          aliases={data || []}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </BasicLayout>
  );
};

export default Moderate;
