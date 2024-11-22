import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/ReviewUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function ReviewTable({
  reviews,
  currentUser,
  moderatorOptions,
  deleteColumn,
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/myreviews/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/myreviews/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const approveCallback = (cell) => {
    console.log(`Approved review with id: ${cell.row.values.id}`);
  };

  const rejectCallback = (cell) => {
    console.log(`Rejected review with id: ${cell.row.values.id}`);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "Item",
      accessor: "item",
    },
    {
      Header: "Station",
      accessor: "station",
    },
    {
      Header: "Stars",
      accessor: "stars",
    },
    {
      Header: "Review Text",
      accessor: "reviewText",
    },
    {
      Header: "Status",
      accessor: "status",
    },
    {
      Header: "Moderator Comments",
      accessor: "modComments",
    },
  ];

  if (moderatorOptions) {
    columns.push(
      ButtonColumn("Approve", "success", approveCallback, "ReviewTable"),
      ButtonColumn("Reject", "danger", rejectCallback, "ReviewTable"),
    );
  }
  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, "ReviewTable"));
  }
  if (deleteColumn && hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "ReviewTable"),
    );
  }

  return <OurTable data={reviews} columns={columns} testid={"ReviewTable"} />;
}
