import { useCurrentUser } from "main/utils/currentUser";
import { useBackend } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import MenuItemTable from "main/components/MenuItem/MenuItemTable";
import { useParams } from "react-router";

export default function MenuItemPage() {
  const currentUser = useCurrentUser();
  const {
    "date-time": date,
    "dining-commons-code": diningCommons,
    meal,
  } = useParams();
  const { data: menuItems, isLoading } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/diningcommons/${date}/${diningCommons}/${meal}`],
    {
      // Stryker disable next-line all : the default method is get, so replacing with an empty string will do nothing
      method: "GET",
      url: `/api/diningcommons/${date}/${diningCommons}/${meal}`,
    },
  );

  return (
    <BasicLayout>
      <h2>{meal.at(0).toUpperCase() + meal.substring(1)}</h2>
      {isLoading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading menu items...</p>
        </div>
      ) : (
        <MenuItemTable currentUser={currentUser} menuItems={menuItems} />
      )}
    </BasicLayout>
  );
}
