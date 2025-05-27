import { useBackend } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import ReviewsTable from "main/components/Reviews/ReviewsTable";

export default function ReviewsPage() {
  const { itemid } = useParams();
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

  const filteredReviews =
    reviews?.filter((review) => review.item.id === Number(itemid)) || [];

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Reviews for Menu Item {itemid}</h1>
        <ReviewsTable reviews={filteredReviews} />
      </div>
    </BasicLayout>
  );
}
