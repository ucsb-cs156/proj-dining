import React from "react";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";

const ModerateReviewsPage = () => {
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

  const moderatorOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderate Reviews</h1>
        <ReviewsTable reviews={reviews} moderatorOptions={moderatorOptions} />
      </div>
    </BasicLayout>
  );
};

export default ModerateReviewsPage;
