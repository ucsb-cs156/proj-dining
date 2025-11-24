import React from "react";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import axios from "axios";
import { toast } from "react-toastify";

const Moderate = () => {
  const currentUser = useCurrentUser();

  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews/needsmoderation"],
    // Stryker disable next-line all : don't test internal caching of React Query
    { method: "GET", url: "/api/reviews/needsmoderation" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  //
  // Fetch aliases awaiting approval
  //
  const { data: aliases } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/users/needsmoderation"],
    // Stryker disable next-line all : don't test internal caching of React Query
    { method: "GET", url: "/api/admin/users/needsmoderation" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  const moderatorOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  const approveCallback = async (alias) => {
    const user = alias.row.original;

    await axios.put("/api/currentUser/updateAliasModeration", null, {
      params: {
        id: user.id,
        approved: true,
      },
    });
    // Stryker disable next-line all
    toast(`Approved alias for ${user.email}`);
  };

  const rejectCallback = async (alias) => {
    const user = alias.row.original;

    await axios.put("/api/currentUser/updateAliasModeration", null, {
      params: {
        id: user.id,
        approved: false,
      },
    });
    // Stryker disable next-line all
    toast(`Approved alias for ${user.email}`);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderate Reviews</h1>
        <ReviewsTable reviews={reviews} moderatorOptions={moderatorOptions} />
        <AliasApprovalTable
          aliases={aliases}
          approveCallback={approveCallback}
          rejectCallback={rejectCallback}
        />
      </div>
    </BasicLayout>
  );
};

export default Moderate;
