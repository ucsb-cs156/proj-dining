import React from "react";
import OurTable, { ButtonColumn } from "../OurTable";
import { useNavigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
  cellToAxiosParamsModerate,
  onModerateSuccess,
} from "main/utils/Reviews";

export default function ReviewsTable({
  reviews,
  userOptions,
  moderatorOptions,
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/reviews/edit/${cell.row.original.id}`);
  };

  // Stryker disable all
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/reviews/userReviews", "/api/reviews/needsmoderation"],
  );
  // Stryker restore all

  // Stryker disable next-line all
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  // Stryker disable all
  const approveMutation = useBackendMutation(
    (cell) => cellToAxiosParamsModerate(cell, "APPROVED"),
    { onSuccess: onModerateSuccess },
    ["/api/reviews/needsmoderation"],
  );

  const rejectMutation = useBackendMutation(
    (cell) => cellToAxiosParamsModerate(cell, "REJECTED"),
    { onSuccess: onModerateSuccess },
    ["/api/reviews/needsmoderation"],
  );

  const approveCallback = async (cell) => {
    approveMutation.mutate(cell);
  };

  const rejectCallback = async (cell) => {
    rejectMutation.mutate(cell);
  };
  // Stryker restore all

  const columns = [
    {
      Header: "Moderation Status",
      accessor: "status",
      Cell: ({ value }) => value,
    },
    {
      Header: "Item Id",
      accessor: "item.id",
    },
    {
      Header: "Item Name",
      accessor: "item.name",
    },
    {
      Header: "Score",
      accessor: "itemsStars",
      Cell: ({ value }) => "⭐".repeat(value),
    },
    {
      Header: "Comments",
      accessor: "reviewerComments",
    },
    {
      Header: "Date Served",
      accessor: "dateItemServed",
      Cell: ({ value }) => (
        <span>{new Date(value).toLocaleDateString("en-US")}</span>
      ),
    },
    {
      Header: "Dining Commons Code",
      accessor: "item.diningCommonsCode",
    },
  ];

  if (userOptions) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, "Reviewstable"));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "Reviewstable"),
    );
  }

  if (moderatorOptions) {
    columns.push(
      ButtonColumn("Approve", "primary", approveCallback, "Reviewstable"),
    );
    columns.push(
      ButtonColumn("Reject", "danger", rejectCallback, "Reviewstable"),
    );
  }

  return <OurTable data={reviews} columns={columns} testid={"Reviewstable"} />;
}
