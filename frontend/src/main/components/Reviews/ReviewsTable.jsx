import React, { useState } from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useNavigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
  cellToAxiosParamsModerate,
  onModerateSuccess,
} from "main/utils/Reviews";
import ModeratorCommentsModal from "main/components/Reviews/ModeratorCommentsModal";

export default function ReviewsTable({
  reviews,
  userOptions,
  moderatorOptions,
}) {
  const navigate = useNavigate();
  const [modalShow, setModalShow] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [pendingCell, setPendingCell] = useState(null);

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
  const moderateMutation = useBackendMutation(
    ({ cell, status, moderatorComments }) =>
      cellToAxiosParamsModerate(cell, status, moderatorComments),
    { onSuccess: onModerateSuccess },
    ["/api/reviews/needsmoderation"],
  );
  // Stryker restore all

  const approveCallback = (cell) => {
    setPendingStatus("APPROVED");
    setPendingCell(cell);
    setModalShow(true);
  };

  const rejectCallback = (cell) => {
    setPendingStatus("REJECTED");
    setPendingCell(cell);
    setModalShow(true);
  };

  const handleModalSubmit = (comments) => {
    moderateMutation.mutate({
      cell: pendingCell,
      status: pendingStatus,
      moderatorComments: comments,
    });
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
    columns.splice(1, 0, {
      Header: "Reviewer Email",
      accessor: "reviewer.email",
    });
    columns.push(
      ButtonColumn("Approve", "primary", approveCallback, "Reviewstable"),
    );
    columns.push(
      ButtonColumn("Reject", "danger", rejectCallback, "Reviewstable"),
    );
  }

  return (
    <>
      <ModeratorCommentsModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        status={pendingStatus}
        onSubmit={handleModalSubmit}
      />
      <OurTable data={reviews} columns={columns} testid={"Reviewstable"} />
    </>
  );
}
