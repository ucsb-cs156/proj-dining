import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import { Button } from "react-bootstrap";

export default function MyReviewsIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews/all"],
    { method: "GET", url: "/api/reviews/all" },
    [],
  );

  const userOptions = hasRole(currentUser, "ROLE_USER");

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>My Reviews</h1>
        <ReviewsTable reviews={reviews} userOptions={userOptions} />
      </div>
    </BasicLayout>
  );
}
