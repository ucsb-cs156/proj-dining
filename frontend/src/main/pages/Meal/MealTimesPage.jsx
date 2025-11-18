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
    [{retry: false}],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        {/* You can display all meal times of the dining common on a certain date */}
        <h1>
          Meals at {diningCommonsCode} for {dateTime}
        </h1>
        {status === "error" && (
          error?.response?.status === 404 ? (
            <div>
              No meals offered today
            </div>
          ) : (
            <div>
              Unable to load page
            </div>
          )
        )}
        {status === "success" && (
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
