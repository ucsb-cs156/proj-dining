import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import { useBackend, _useBackendMutation } from "main/utils/useBackend";
import MealTable from "main/components/Meal/MealTable";


export default function MealTimesPage() {
  // Stryker disable next-line all : Can't test state because hook is internal
  let { dateTime, diningCommonsCode } = useParams();

  const {
    data: meals,
    error: _error,
    status: _status,
    } = useBackend(
        // Stryker disable next-line all : don't test internal caching of React Query
        [`/api/diningcommons/${dateTime}/${diningCommonsCode}`],
        {url: `/api/diningcommons/${dateTime}/${diningCommonsCode}`,  
        params: {
            dateTime,
            diningCommonsCode,
          },
        },
        // Stryker disable next-line all : don't test default value of empty list
        [],
    );

  return (
    <BasicLayout>
      <div className="pt-2">
        {/* You can display all meal times of the dining common on a certain date */}
        <h5>Meals at {diningCommonsCode} for {dateTime}</h5>

        {/* Render the MealTable and pass the meals data */}
        {meals && <MealTable meals={meals} dateTime={dateTime} diningCommonsCode={diningCommonsCode} />}
      </div>
    </BasicLayout>
  );

}