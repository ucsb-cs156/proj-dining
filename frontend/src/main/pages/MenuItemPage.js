import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";

export default function MenuItemPage() {
  // Stryker disable all : placeholder for future implementation
  let { dateTime } = useParams();
  let { diningCommonsCode } = useParams();
  let { meal } = useParams();
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Menu Item page not yet implemented for the following info</h1>
        <>{dateTime}   /   {diningCommonsCode}   /   {meal}</>
      </div>
    </BasicLayout>
  );
}
