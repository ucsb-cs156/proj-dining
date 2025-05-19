import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ReviewForm from "main/components/MenuItemReviews/ReviewForm";
import { useCurrentUser } from "main/utils/currentUser";

export default function CreateReviewPage() {
  const { id } = useParams(); // optional
  const { data: currentUser } = useCurrentUser();

  const [menuItem, setMenuItem] = useState(null);
  const [error, setError] = useState("");

  // Fetch menu item if ID is provided
  useEffect(() => {
    if (!id) return;
    axios
      .get("/api/diningcommons/menuitem", { params: { id } })
      .then((resp) => setMenuItem(resp.data))
      .catch((e) => {
        console.error(e);
        const backendMessage =
          e.response?.data?.message || e.response?.data?.error || "";
        if (
          backendMessage.includes("MenuItem") &&
          backendMessage.includes("not found")
        ) {
          toast.error(`Menu item with ID ${id} not found.`);
          setError(`Menu item with ID ${id} not found.`);
        } else {
          toast.error("Failed to load menu item.");
          setError("Failed to load menu item.");
        }
      });
  }, [id]);

  const submitAction = async (formData) => {
    const reviewerEmail = currentUser?.root?.user?.email;

    if (!reviewerEmail) {
      toast.error("You must be logged in to submit a review.");
      return;
    }

    const itemId = parseInt(id || formData.itemId, 10);

    try {
      const payload = {
        reviewerEmail,
        itemsStars: parseInt(formData.stars, 10),
        reviewerComments: formData.comments, // can be blank
        dateItemServed: new Date().toISOString(),
        itemId,
      };

      // ✅ Get full Review object from backend (which includes item)
      const response = await axios.post("/api/reviews/post", null, {
        params: payload,
      });

      const review = response.data;
      const displayName = review.item?.name || `Menu Item #${itemId}`;
      const rating = review.itemsStars;
      const comment =
        review.reviewerComments?.trim() || "No comments provided.";

      toast.success(
        `Review submitted for "${displayName}"\n⭐ Rating: ${rating}\n💬 Comment: ${comment}`,
        { autoClose: 8000 },
      );
    } catch (e) {
      console.error(e);

      const message =
        e.response?.data?.message || e.response?.data?.error || "";

      if (e.response?.status === 404 && message.includes("MenuItem")) {
        toast.error(`Menu item with ID ${itemId} not found.`);
      } else {
        toast.error("Error creating review.");
      }
    }
  };

  if (error) {
    return (
      <BasicLayout>
        <p className="text-danger">{error}</p>
      </BasicLayout>
    );
  }

  if (id && !menuItem) {
    return (
      <BasicLayout>
        <p>Loading menu item…</p>
      </BasicLayout>
    );
  }

  const initialContents = {
    itemId: id || "",
    stars: "",
    comments: "",
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>
          {id
            ? `Leave a Review for "${menuItem?.name}"`
            : "Leave a Review for a Menu Item"}
        </h1>
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
