import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ReviewForm from "main/components/MyReviews/ReviewForm";
import { useBackend } from "main/utils/useBackend";

export default function PostReviewPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: menuItems } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/diningcommons/menuitem?id=${id}`],
    {
      // Stryker disable next-line all : the default method is get, so replacing with an empty string will do nothing
      method: "GET",
      url: `/api/diningcommons/menuitem?id=${id}`,
    },
    // Stryker disable next-line all : Don't test empty initial data
    [],
  );

  const itemName = menuItems.name;

  const submitReview = async (formData) => {
    try {
      await axios.post("/api/reviews/post", null, {
        params: {
          itemId: id,
          reviewerComments: formData.reviewerComments,
          itemsStars: formData.itemsStars,
          dateItemServed: formData.dateItemServed,
        },
      });
      toast(`Review submitted for ${itemName}`);
      navigate("/myreviews");
    } catch (err) {
      toast.error(
        `Error submitting review: ${err.response?.data?.error || err.message}`,
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Post a review for Menu Item {id}</h1>
        <ReviewForm initialItemName={itemName} submitAction={submitReview} />
      </div>
    </BasicLayout>
  );
}
