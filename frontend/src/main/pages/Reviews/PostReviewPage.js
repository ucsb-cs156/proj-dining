import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";

export default function PostReviewPage() {
  const { id } = useParams();

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Post a review for Menu Item {id}</h1>
        <p>Coming Soon!</p>
      </div>
    </BasicLayout>
  );
}
