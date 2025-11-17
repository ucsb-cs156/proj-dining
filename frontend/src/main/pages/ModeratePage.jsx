import React from "react";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";

const Moderate = () => {
  const currentUser = useCurrentUser();

  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews/needsmoderation"],
    { method: "GET", url: "/api/reviews/needsmoderation" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  //
  // Fetch aliases awaiting approval
  //
  const {
    data: aliases,
  } = useBackend(
    ["/api/aliases/needsmoderation"],
    { method: "GET", url: "/api/aliases/needsmoderation" },
    []
  );

  const moderatorOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  //
  // Approve + Reject callbacks
  //
  const approveCallback = async (alias) => {
    await fetch(`/api/aliases/${alias.id}/approve`, { method: "POST" });
  };

  const rejectCallback = async (alias) => {
    await fetch(`/api/aliases/${alias.id}/reject`, { method: "POST" });
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderation Page</h1>
        <ReviewsTable reviews={reviews} moderatorOptions={moderatorOptions} />
        <AliasApprovalTable aliases={aliases} approveCallback={approveCallback} rejectCallback={rejectCallback} />
      </div>
    </BasicLayout>
  );
};

export default Moderate;
