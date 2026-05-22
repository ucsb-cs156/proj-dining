import React, { useState } from "react";

import { useBackend } from "main/utils/useBackend";
import { useBackendMutation } from "main/utils/useBackend";
import { useCurrentUser, hasRole } from "main/utils/currentUser";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewsTable from "main/components/Reviews/ReviewsTable";
import ModerateReviewModal from "main/components/Reviews/ModerateReviewModal";

const ModerateReviews = () => {
  const currentUser = useCurrentUser();

  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: reviews } = useBackend(
    ["/api/reviews/needsmoderation"],
    { method: "GET", url: "/api/reviews/needsmoderation" },
    [],
  );

  const moderateReviewsOptions =
    hasRole(currentUser, "ROLE_ADMIN") ||
    hasRole(currentUser, "ROLE_MODERATOR");

  const moderationMutation = useBackendMutation(
    (payload) => ({
      url: "/api/reviews/moderate",
      method: "PUT",
      params: {
        id: payload.review.id,
        status: payload.status,
        moderatorComments: payload.moderatorComments,
      },
    }),
    {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedReview(null);
        setSelectedStatus(null);
      },
    },
    ["/api/reviews/needsmoderation"],
  );

  const openModal = (review, status) => {
    setSelectedReview(review);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReview(null);
    setSelectedStatus(null);
  };

  const handleModerationSubmit = (data) => {
    moderationMutation.mutate({
      review: selectedReview,
      status: selectedStatus,
      moderatorComments: data.moderatorComments,
    });
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
          showModal={isModalOpen}
          toggleShowModal={closeModal}
          review={selectedReview}
          status={selectedStatus}
          onSubmitAction={handleModerationSubmit}
        />
      </div>
    </BasicLayout>
  );
};

export default ModerateReviews;
