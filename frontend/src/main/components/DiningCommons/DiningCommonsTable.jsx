import React from "react";
import OurTable from "main/components/OurTable";
import { Link } from "react-router";
import { useBackend } from "main/utils/useBackend";

function MealsOfferedCell({ date, diningHall }) {
  const {
    data: meals,
    error,
    status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/diningcommons/${date}/${diningHall}`],
    {
      url: `/api/diningcommons/${date}/${diningHall}`,
    },
    // Stryker disable next-line all : don't test default value of empty list
    undefined,
    true,
  );

  // Stryker disable OptionalChaining
  if (error?.response?.status === 500) return <span>no meals offered</span>;
  if (status === "loading") return <span>Loading...</span>;

  if (meals) {
    return (
      <>
        {meals.map((meal, index) => (
          <React.Fragment key={meal.code}>
            {index > 0 && " "}
            <Link to={`/diningcommons/${date}/${diningHall}/${meal.code}`}>
              {meal.name}
            </Link>
          </React.Fragment> // we have two siblings (" " and link) so a fragment is needed to wrap them together
        ))}
      </> // this is also a fragment wrapper, but with no key since we're not inside of a list
    ); // https://react.dev/reference/react/Fragment#rendering-a-list-of-fragments
  }

  return <span>An error has occured.</span>;
}

export default function DiningCommonsTable({ commons, date }) {
  const testid = "DiningCommonsTable";
  const columns = [
    {
      Header: "Code",
      accessor: "code", // accessor is the "key" in the data
      Cell: ({ value }) => (
        <Link to={`/diningcommons/${date}/${value}`}>{value}</Link>
      ),
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Meals Offered Today",
      accessor: "code",
      id: "mealsOfferedToday", // by default the id is the accessor, but since our first column has the same accessor we need a different id here
      Cell: ({ value }) => <MealsOfferedCell date={date} diningHall={value} />,
    },
    {
      Header: "Has Dining Cam",
      accessor: "hasDiningCam",
      // Credits to Jayden for the code here!
      // Renders a checkmark box.
      Cell: ({ value }) => (value ? "✅" : "❌"),
    },
    {
      Header: "Has Sack Meal",
      accessor: "hasSackMeal",
      Cell: ({ value }) => (value ? "✅" : "❌"),
    },
    {
      Header: "Has Takeout Meal",
      accessor: "hasTakeoutMeal",
      Cell: ({ value }) => (value ? "✅" : "❌"),
    },
  ];

  const displayedColumns = columns;

  return <OurTable data={commons} columns={displayedColumns} testid={testid} />;
}
