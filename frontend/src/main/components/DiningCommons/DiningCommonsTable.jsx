import React from "react";
import OurTable from "main/components/OurTable";
import { Link } from "react-router";
import { useQuery } from "react-query";
import axios from "axios";

// helper for “closed/no meals”
const isClosedDiningCommons = (error) => {
  if (!error) return false;
  const status = error.response?.status;
  const rawMessage = error.response?.data?.message;
  const msg = typeof rawMessage === "string" ? rawMessage.toLowerCase() : "";
  return status === 404 || status === 500 || msg.includes("no meals");
};

export default function DiningCommonsTable({ commons, date }) {
  const testid = "DiningCommonsTable";

  function MealsCell({ row }) {
    const code = row.original.code;
    const url = `/api/diningcommons/${date}/${code}`;

    const { data, error, status } = useQuery(
      [url],
      async () => (await axios.get(url)).data,
      {
        initialData: [],
        retry: false,
        onError: (err) =>
          console.error(`Error loading meals for ${code} on ${date}`, err),
      },
    );

    if (status === "loading") return <span>...</span>;

    // if closed or error -> just say no meals offered
    if (status === "error" || isClosedDiningCommons(error)) {
      return <span>no meals offered</span>;
    }

    // normalize meals
    let meals = Array.isArray(data)
      ? data.map((m) => m.name)
      : data?.meals?.map((m) => m.name) || [];

    if (meals.length === 0) return <span>no meals offered</span>;

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
    { Header: "Name", accessor: "name" },
    {
      Header: "Meals Offered Today",
      accessor: "meals",
      Cell: (props) => <MealsCell {...props} />,
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
