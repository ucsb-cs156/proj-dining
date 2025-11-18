import React from "react";
import OurTable from "main/components/OurTable";
import { Link } from "react-router";
import { useBackend } from "main/utils/useBackend";

export default function DiningCommonsTable({ commons, date }) {
  const testid = "DiningCommonsTable";

  function MealsCell({ row }) {
    const code = row.original.code;
    const url = `/api/diningcommons/${date}/${code}`;

    const { data, status } = useBackend([url], { method: "GET", url }, []);

    if (status !== "success") {
      return <span>...</span>;
    }

    // Normalize meals into strings
    let meals = [];

    if (Array.isArray(data)) {
      meals = data.map((m) => {
        return m.name;
      });
    } else if (data && Array.isArray(data.meals)) {
      meals = data.meals.map((m) => {
        return m.name;
      });
    }

    if (meals.length === 0) {
      return <span>no meals offered</span>;
    }

    return (
      <>
        {meals.map((meal) => {
          const label =
            meal.charAt(0).toUpperCase() + meal.slice(1).toLowerCase();
          const to = `/diningcommons/${date}/${code}/${meal}`;
          return (
            <Link key={meal} to={to} style={{ marginRight: "0.75rem" }}>
              {label}
            </Link>
          );
        })}
      </>
    );
  }


  const columns = [
    {
      Header: "Code",
      accessor: "code",
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
      accessor: "meals", // value not used; we rely on row.original.code
      Cell: (cellProps) => <MealsCell {...cellProps} />,
    },
    {
      Header: "Has Dining Cam",
      accessor: "hasDiningCam",
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

  return <OurTable data={commons} columns={columns} testid={testid} />;
}
