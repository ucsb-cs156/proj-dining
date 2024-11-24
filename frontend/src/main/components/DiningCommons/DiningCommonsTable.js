import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/DiningCommonsUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function DiningCommonsTable({ diningcommons, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/diningcommons/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/diningcommons/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "Name",
      accessor: "name", // accessor is the "key" in the data
    },
    {
      Header: "Code",
      accessor: "code",
    },
    {
      Header: "HasDiningCam",
      accessor: "hasDiningCam",
    },
    {
      Header: "HasSackMeal",
      accessor: "hasSackMeal",
    },
    {
      Header: "HasTakeoutMeal",
      accessor: "hasTakeoutMeal",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "DiningCommonsTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "DiningCommonsTable"),
    );
  }

  return (
    <OurTable
      data={diningcommons}
      columns={columns}
      testid={"DiningCommonsTable"}
    />
  );
}
