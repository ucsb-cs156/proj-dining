import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";

export default function PostReviewPage() {
  const { id } = useParams();

  const submitReview = async (formData) => {
    try {
      await axios.post("/api/reviews/post", null, {
        params: {
          itemId,
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