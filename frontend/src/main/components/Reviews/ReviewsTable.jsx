import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useNavigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { cellToAxiosParamsDelete, onDeleteSuccess } from "main/utils/Reviews";

export default function ReviewsTable({
  reviews,
  userOptions,
  moderatorOptions,
  openModal,
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
  // Stryker restore all

  if (userOptions) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, "Reviewstable"));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "Reviewstable"),
    );
  }

  if (moderatorOptions) {
    columns.push(
      ButtonColumn(
        "Approve",
        "primary",
        (cell) => openModal(cell.row.original, "APPROVED"),
        "Reviewstable",
      ),
    );

    columns.push(
      ButtonColumn(
        "Reject",
        "danger",
        (cell) => openModal(cell.row.original, "REJECTED"),
        "Reviewstable",
      ),
    );
  }

  return <OurTable data={reviews} columns={columns} testid={"Reviewstable"} />;
}
