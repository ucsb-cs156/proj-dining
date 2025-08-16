import React from "react";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";

const Moderate = () => {
  const currentUser = useCurrentUser();

  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews/all"],
    { method: "GET", url: "/api/reviews/all" },
    // Stryker disable next-line all : don't test internal caching of React Query
    [],
  );

  const moderatorOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  // Stryker disable all
  const filteredReviews =
    reviews?.filter((review) => review.status === "AWAITING_REVIEW") || [];

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderation Page</h1>
        <ReviewsTable
          reviews={filteredReviews}
          moderatorOptions={moderatorOptions}
        />
      </div>
    </BasicLayout>
  );
};

export default Moderate;
