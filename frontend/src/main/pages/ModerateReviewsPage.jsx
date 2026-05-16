import React, { useState } from "react";


import { useBackend } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import ModerateReviewModal from "main/components/Reviews/ModerateReviewModal";

//making this specific to dining; want to have am modal that 
// Modals are currently implemented in proj-happycows. A good place to start is the Play Page, and work through the modal from there
// The modal should take a parameter for the status the review is being set to
// The modal should contain a paragraph box for moderator comments and a submit button
// The modal should submit as a PUT to /api/reviews/moderate

const ModerateReviews = () => {
  const currentUser = useCurrentUser();

  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);   
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const moderateReviewsOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

   const openModal = (review, status) => {
    setSelectedReview(review);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderate Reviews</h1>

        <ReviewsTable
          reviews={reviews}
          moderatorOptions={moderateReviewsOptions}
          openModal={openModal}
        />
        <ModerateReviewModal
          show={isModalOpen}
          review={selectedReview}
          status={selectedStatus}
          onClose={closeModal}
        />
      </div>
    </BasicLayout>
  );

 
};

export default ModerateReviews;
