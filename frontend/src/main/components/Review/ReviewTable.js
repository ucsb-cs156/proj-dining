import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/ReviewUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function ReviewTable({ dates, currentUser }) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/review/edit/${cell.row.values.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/review/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id", // accessor is the "key" in the data
    },
    {
      Header: "ItemId",
      accessor: "itemId",
    },
    {
      Header: "ReviewerEmail",
      accessor: "reviewerEmail",
    },
    {
      Header: "Date",
      accessor: "dateReviewed",
    },
    {
      Header: "Stars",
      accessor: "stars",
    },
    {
      Header: "Comments",
      accessor: "comments",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "ReviewTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "ReviewTable"),
    );
  }

  return (
    <OurTable data={dates} columns={columns} testid={"ReviewTable"} />
  );
}
