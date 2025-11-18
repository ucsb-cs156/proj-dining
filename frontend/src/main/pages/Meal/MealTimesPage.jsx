import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import { useBackend } from "main/utils/useBackend";
import MealTable from "main/components/Meal/MealTable";

export default function MealTimesPage() {
  // Stryker disable next-line all : Can't test state because hook is internal
  let { "date-time": dateTime, "dining-commons-code": diningCommonsCode } =
    useParams();

  const {
    data: meals,
    error: error,
    status: status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/diningcommons/${dateTime}/${diningCommonsCode}`],
    { url: `/api/diningcommons/${dateTime}/${diningCommonsCode}` },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        {/* You can display all meal times of the dining common on a certain date */}
        <h1>
          Meals at {diningCommonsCode} for {dateTime}
        </h1>

        {/* Unexpected error*/}        
        {error && (
          <div>
            Unable to load page
          </div>
        )}
        
        {/* Check for 204 */}
        {status === "success" && (!meals || meals.length === 0) && (
          <div>
            No meals offered today
          </div>
        )}
        
        {/* If there is body then show meals */}
        {meals && meals.length > 0 && (
          <MealTable
            meals={meals}
            dateTime={dateTime}
            diningCommonsCode={diningCommonsCode}
          />
        )}
      </div>
    </BasicLayout>
  );
}
