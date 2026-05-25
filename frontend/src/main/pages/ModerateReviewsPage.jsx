import React from "react";

import { useBackend } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";

const ModerateReviews = () => {
  const currentUser = useCurrentUser();

  const { data: reviews } = useBackend(
    ["/api/reviews/needsmoderation"],
    { method: "GET", url: "/api/reviews/needsmoderation" },
    [],
  );

  const moderateReviewsOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderate Reviews</h1>

        <ReviewsTable
          reviews={reviews}
          moderatorOptions={moderateReviewsOptions}
        />
      </div>
    </BasicLayout>
  );
};

export default ModerateReviews;
