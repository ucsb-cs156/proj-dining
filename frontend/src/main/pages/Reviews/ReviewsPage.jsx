import { useBackend } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import ReviewsTable from "main/components/Reviews/ReviewsTable";

export default function ReviewsPage() {
  const { itemid } = useParams();
  const {
    data: reviews,
    error: _error,
    status: _status,
  } = useBackend(
    /* Stryker disable all : don't test internal caching of React Query */
    [`/api/reviews/approved/forItem/${itemid}`],
    { method: "GET", url: `/api/reviews/approved/forItem/${itemid}` },
    [],
    /* Stryker enable all */
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Reviews for Menu Item {itemid}</h1>
        <ReviewsTable reviews={reviews} />
      </div>
    </BasicLayout>
  );
}
