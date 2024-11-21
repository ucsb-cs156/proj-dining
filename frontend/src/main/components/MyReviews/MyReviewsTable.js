import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/MyReviewsUtils";
import { useNavigate } from "react-router-dom";

export default function MyReviewsTable({ reviews, moderatorOptions=false, deleteColumn=false }) {
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

  // Stryker disable next-line all
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
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
      Header: "Review",
      accessor: "review",
    },
    {
      Header: "Status",
      accessor: "status",
    },
    {
      Header: "Moderator Comments",
      accessor: "moderatorComments",
    },
  ];
  
  columns.push(
    ButtonColumn("Edit", "primary", editCallback, "MyReviewsTable"),
    );
    if (deleteColumn) {
        columns.push(
        ButtonColumn("Delete", "danger", deleteCallback, "MyReviewsTable"),
        );
    }
    if (moderatorOptions) {
        columns.push( 
            ButtonColumn("Approve", "success", editCallback, "MyReviewsTable"),
            ButtonColumn("Reject", "danger", editCallback, "MyReviewsTable"),
        )
    }

  return (
    <OurTable
      data={reviews}
      columns={columns}
      testid={"MyReviewsTable"}
    />
  );
}