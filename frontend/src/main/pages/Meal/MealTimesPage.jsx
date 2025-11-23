import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import { useBackend } from "main/utils/useBackend";
import { toast } from "react-toastify";
import MealTable from "main/components/Meal/MealTable";

export default function MealTimesPage() {
  // Stryker disable next-line all : Can't test state because hook is internal
  let { "date-time": dateTime, "dining-commons-code": diningCommonsCode } =
    useParams();

  const { data: meals, status } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/diningcommons/${dateTime}/${diningCommonsCode}`],
    {
      url: `/api/diningcommons/${dateTime}/${diningCommonsCode}`,
    },
  );

  if (status === 204) {
    const message = `${diningCommonsCode} is closed on ${dateTime}. Please select another date or dining common.`;
    toast(message, { toastId: "closed-dining-commons" });
    return (
      <BasicLayout>
        <h1>
          Meals at {diningCommonsCode} for {dateTime}
        </h1>
        <div>{message}</div>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>
          Meals at {diningCommonsCode} for {dateTime}
        </h1>
        {meals && (
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
