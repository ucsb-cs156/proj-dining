import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";

export default function EditReviewPage() {
  const { id } = useParams();

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit review with id {id}</h1>
        <p>Coming soon!</p>
      </div>
    </BasicLayout>
  );
}
