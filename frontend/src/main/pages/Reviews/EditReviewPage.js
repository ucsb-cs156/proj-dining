import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";

export default function EditReviewPage() {
  const { id } = useParams();

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit review with id {id}</h1>
        <p>Coming soon! This page will need to be added as a route in App.js.</p>
      </div>
    </BasicLayout>
  );
}
