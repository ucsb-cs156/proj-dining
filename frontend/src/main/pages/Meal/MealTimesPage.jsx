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
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/diningcommons/${dateTime}/${diningCommonsCode}`],
    { url: `/api/diningcommons/${dateTime}/${diningCommonsCode}` },
    // Stryker disable next-line all : don't test default value of empty list
    [],
    true,
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        {/* You can display all meal times of the dining common on a certain date */}
        <h1>
          Meals at {diningCommonsCode} for {dateTime}
        </h1>
        {/* length=0 technically means its loading but it only loads for that long when there's an error anyways */}
        {meals.length === 0 && <p>No meals offered today.</p>}
        {/* the error takes a few seconds to come through. before that, the status is success, but we still don't want to show the meals table. so the table should only be shown if meals is actually populated */}
        {meals.length > 0 && (
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
