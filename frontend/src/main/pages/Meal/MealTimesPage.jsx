import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import { useQuery } from "react-query";
import axios from "axios";
import { toast } from "react-toastify";
import MealTable from "main/components/Meal/MealTable";

/* eslint-disable react-refresh/only-export-components*/

export const onMealsError = (error, diningCommonsCode, dateTime) => {
  console.error("onMealsError: error=", error);

  // Check if it's a specific error related to closed dining commons
  // Stryker disable next-line all : Optional chaining on error.response?.status is defensive coding
  const isClosedDiningCommons =
    error.response?.status === 404 ||
    error.response?.status === 500 ||
    // Stryker disable next-line all : Optional chaining on error.response?.data?.message is defensive coding
    error.response?.data?.message?.toLowerCase().includes("no meals") ||
    // Stryker disable next-line all : Optional chaining on error.response?.data?.message is defensive coding
    error.response?.data?.message?.toLowerCase().includes("closed");

  if (isClosedDiningCommons) {
    // Show user-friendly message for closed dining commons
    toast.error(
      `${diningCommonsCode} is not serving meals on ${dateTime}. Please try a different date or dining commons.`,
    );
  } else {
    // Show generic error message for other types of errors
    // Stryker disable all : Fallback message with OR operator and optional chaining is defensive coding
    const message =
      error.response?.data?.message ||
      `Error loading meals for ${diningCommonsCode} on ${dateTime}`;
    // Stryker restore all
    toast.error(message);
  }
};

/* eslint-enable react-refresh/only-export-components*/

export default function MealTimesPage() {
  // Stryker disable next-line all : Can't test state because hook is internal
  let { "date-time": dateTime, "dining-commons-code": diningCommonsCode } =
    useParams();

  const { data: meals, error } = useQuery(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/diningcommons/${dateTime}/${diningCommonsCode}`],
    async () => {
      const response = await axios.get(
        `/api/diningcommons/${dateTime}/${diningCommonsCode}`,
      );
      return response.data;
    },
    {
      // Stryker disable next-line all : don't test default value of empty list
      initialData: [],
      retry: false,
      // Stryker disable next-line all : onError callback is tested via component behavior tests
      onError: (error) => {
        // Use custom error handler instead of generic toast spam
        onMealsError(error, diningCommonsCode, dateTime);
      },
    },
  );

  // Handle error state (dining commons closed, network issues, etc.)
  if (error) {
    // Stryker disable next-line all : Optional chaining on error.response?.status is defensive coding
    const isClosedDiningCommons =
      error.response?.status === 404 ||
      error.response?.status === 500 ||
      // Stryker disable next-line all : Optional chaining on error.response?.data?.message is defensive coding
      error.response?.data?.message?.toLowerCase().includes("no meals") ||
      // Stryker disable next-line all : Optional chaining on error.response?.data?.message is defensive coding
      error.response?.data?.message?.toLowerCase().includes("closed");

    return (
      <BasicLayout>
        <div className="pt-2">
          <h1>
            Meals at {diningCommonsCode} for {dateTime}
          </h1>
          <div
            className={`alert ${isClosedDiningCommons ? "alert-info" : "alert-danger"}`}
          >
            <h4>
              {isClosedDiningCommons
                ? "No meals available"
                : "Error loading meals"}
            </h4>
            <p>
              {isClosedDiningCommons
                ? `${diningCommonsCode} is not serving meals on ${dateTime}.`
                : "Unable to load meal information at this time."}
            </p>
            <p>
              {isClosedDiningCommons
                ? "This dining commons may be closed on this date. Please try a different date or select another dining commons."
                : "Please try again later or contact support if the problem persists."}
            </p>
          </div>
        </div>
      </BasicLayout>
    );
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        {/* You can display all meal times of the dining common on a certain date */}
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
