import React from "react";
import { useParams } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewTable from "main/components/Reviews/ReviewTable";
import { useBackend } from "main/utils/useBackend";

export default function ReviewsForMenuItemPage() {
  const { itemid } = useParams();
  const { data, isLoading, error } = useBackend(
    // Stryker disable next-line all: don't test internal caching of React Query
    ["reviewsForMenuItem", itemid],
    // Stryker disable next-line all: default method is get, so replacing with an empty string will do nothing
    { method: "GET", url: `/api/diningcommons/menuitem?id=${itemid}` },
  );

  if (isLoading) {
    return (
      <BasicLayout>
        <p>Loading...</p>
      </BasicLayout>
    );
  }

  // Stryker disable next-line all : Don't mutate error block
  if (error) {
    return (
      <BasicLayout>
        <p>Error loading reviews.</p>
      </BasicLayout>
    );
  }

  const filteredReviews =
    // Stryker disable next-line ArrayDeclaration : Don't mutate fallback array
    (Array.isArray(data?.reviews) ? data.reviews : []).filter(
      (review) =>
        review.reviewerComments !== null &&
        review.reviewerComments !== undefined,
    );

  return (
    <BasicLayout>
      <h1>Reviews for Menu Item {itemid}</h1>
      <ReviewTable
        data={filteredReviews}
        userOptions={false}
        moderatorOptions={false}
      />
    </BasicLayout>
  );
}
