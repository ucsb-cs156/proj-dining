import React from "react";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import AliasApprovalTable from "main/components/AliasApproval/AliasApprovalTable";
import {
  cellToAxiosParamsApprove,
  cellToAxiosParamsReject,
  onModerateSuccess,
} from "main/utils/Aliases";

const ModerateReviews = () => {
  const currentUser = useCurrentUser();

  //
  // Reviews needing moderation
  //
  const { data: reviews } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews/needsmoderation"],
    // Stryker disable next-line all : don't test internal caching of React Query
    { method: "GET", url: "/api/reviews/needsmoderation" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  //
  // Aliases needing moderation
  //
  const { data: aliases } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/users/needsmoderation"],
    // Stryker disable next-line all : don't test internal caching of React Query
    { method: "GET", url: "/api/admin/users/needsmoderation" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  const approveAliasMutation = useBackendMutation(
    cellToAxiosParamsApprove,
    { onSuccess: onModerateSuccess },
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/users/needsmoderation"],
  );

  const rejectAliasMutation = useBackendMutation(
    cellToAxiosParamsReject,
    { onSuccess: onModerateSuccess },
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/users/needsmoderation"],
  );

  const approveAliasCallback = (alias) => {
    approveAliasMutation.mutate(alias);
  };

  const rejectAliasCallback = (alias) => {
    rejectAliasMutation.mutate(alias);
  };

  const moderateReviewsOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderation Page</h1>

        <h2>Reviews Needing Moderation</h2>
        <ReviewsTable
          reviews={reviews}
          moderatorOptions={moderateReviewsOptions}
        />

        <h2 className="mt-4">Aliases Needing Moderation</h2>
        <AliasApprovalTable
          aliases={aliases}
          approveCallback={approveAliasCallback}
          rejectCallback={rejectAliasCallback}
          moderatorOptions={moderateReviewsOptions}
        />
      </div>
    </BasicLayout>
  );
};

export default ModerateReviews;
