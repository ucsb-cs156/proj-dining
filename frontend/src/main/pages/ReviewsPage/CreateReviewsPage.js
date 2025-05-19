import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewForm from "main/components/MenuItemReviews/ReviewForm";
import { useCurrentUser } from "main/utils/currentUser";

export default function CreateReviewPage({ id: idFromProps }) {
  const { id: idFromRoute } = useParams();
  const id = idFromProps ?? idFromRoute;
  const { data: currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/reviews/create";

  const submitAction = async (formData) => {
    const reviewerEmail =
      currentUser &&
      currentUser.root &&
      currentUser.root.user &&
      currentUser.root.user.email;

    if (!reviewerEmail) {
      toast.error("You must be logged in to submit a review.");
      return;
    }

    const itemId = id ? parseInt(id, 10) : parseInt(formData.itemId, 10);

    try {
      const payload = {
        reviewerEmail,
        itemsStars: parseInt(formData.stars, 10),
        reviewerComments: formData.comments,
        dateItemServed: new Date().toISOString(),
        itemId,
      };

      // Stryker disable next-line all
      const REVIEW_POST_URL = "/api/reviews/post";
      const response = await axios.post(REVIEW_POST_URL, null, {
        params: payload,
      });

      const review = response.data;
      const displayName = review.item?.name || `Menu Item #${itemId}`;
      const rating = review.itemsStars;
      const comment =
        review.reviewerComments?.trim() || "No comments provided.";

      toast.success(
        `✅ Review submitted for "${displayName}"\n⭐ Rating: ${rating}\n💬 Comment: ${comment}`,
        { autoClose: 8000 },
      );

      setTimeout(() => {
        navigate(from);
      }, 1000);
    } catch (e) {
      console.error(e);
      const message = e.response?.data?.message || e.response?.data?.error;
      if (e.response?.status === 404 && message.includes("MenuItem")) {
        toast.error(`Menu item with ID ${itemId} not found.`);
      } else {
        toast.error("Error creating review.");
      }
    }
  };

  const initialContents = {
    itemId: id || "",
    stars: "",
    comments: "",
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Leave a Review</h1>
        <ReviewForm
          initialContents={initialContents}
          submitAction={submitAction}
          buttonLabel="Submit Review"
          hideItemId={!!id}
        />
      </div>
    </BasicLayout>
  );
}
