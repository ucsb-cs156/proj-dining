import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/mealUtils";
import { useNavigate } from "react-router-dom";

export default function MealsTable({ meals }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/meals/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/meals/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Code",
      accessor: "code",
    },
  ];

  return <OurTable data={meals} columns={columns} testid={"MealsTable"} />;
}
