import { useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useNavigate, useParams } from "react-router";
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
  const [selectedDate, setSelectedDate] = useState(dateTime);
  const navigate = useNavigate();

  const onChangeDate = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    navigate(`/diningcommons/${newDate}/${diningCommonsCode}`);
  };

  if (status === 204) {
    const message = `${diningCommonsCode} is closed on ${dateTime}. Please select another date or dining common.`;
    toast(message, { toastId: "closed-dining-commons" });
    return (
      <BasicLayout>
        <h1>
          Meals at {diningCommonsCode} for {dateTime}
        </h1>
        <p>
          <label htmlFor="dateSelector">Select Date:</label>
          <br></br>
          <input
            type="date"
            id="dateSelector"
            name="dateSelector"
            value={selectedDate}
            onChange={onChangeDate}
          />
        </p>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>
          Meals at {diningCommonsCode} for {dateTime}
        </h1>
        <p>
          <label htmlFor="dateSelector">Select Date:</label>
          <br></br>
          <input
            type="date"
            id="dateSelector"
            name="dateSelector"
            value={selectedDate}
            onChange={onChangeDate}
          />
        </p>
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
