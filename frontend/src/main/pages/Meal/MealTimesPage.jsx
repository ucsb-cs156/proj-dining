import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import { useBackend } from "main/utils/useBackend";
import { toast } from "react-toastify";
import MealTable from "main/components/Meal/MealTable";

export default function MealTimesPage() {
  let { "date-time": dateTime, "dining-commons-code": diningCommonsCode } =
    useParams();

  const { data: meals, status } = useBackend(
    [`/api/diningcommons/${dateTime}/${diningCommonsCode}`],
    {
      method: "GET",
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
