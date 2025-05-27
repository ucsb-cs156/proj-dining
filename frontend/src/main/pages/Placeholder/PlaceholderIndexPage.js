import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Link } from "react-router";

export default function PlaceholderIndexPage() {
  // Stryker disable all : placeholder for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Index page not yet implemented</h1>
        <p>
          <Link to="/placeholder/create">Create</Link>
        </p>
        <p>
          <Link to="/placeholder/edit/1">Edit</Link>
        </p>
      </div>
    </BasicLayout>
  );
}
