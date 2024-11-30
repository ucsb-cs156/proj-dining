import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewTable from "main/components/Review/ReviewTable";
import { Button } from "react-bootstrap";
import { useCurrentUser, hasRole } from "main/utils/currentUser";

export default function MyReviewsIndexPage() {
  const currentUser = useCurrentUser();

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/reviews/create"
          style={{ float: "right" }}
        >
          Create Reviews
        </Button>
      );
    }
  };

  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews"],
    { method: "GET", url: "/api/reviews" },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>My Reviews</h1>
        <ReviewTable reviews={reviews} currentUser={currentUser} />
      </div>
    </BasicLayout>
  );
}
