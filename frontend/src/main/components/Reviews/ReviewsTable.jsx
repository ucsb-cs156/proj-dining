import React, { useState } from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useNavigate } from "react-router";
import ReviewModeratorModal from "main/components/Modal/ReviewModeratorModal";
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

  const [show, setShow] = useState(false);
  const [pendingCell, setPendingCell] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  const handleClose = () => {
    setShow(false);
    setPendingCell(null);
    setPendingStatus(null);
  };

  const editCallback = (cell) => {
    navigate(`/reviews/edit/${cell.row.original.id}`);
  };

  // Stryker disable all
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/reviews/userReviews", "/api/reviews/needsmoderation"],
  );

  const approveMutation = useBackendMutation(
    ({ cell, moderatorComments }) =>
      cellToAxiosParamsModerate(cell, "APPROVED", moderatorComments),
    { onSuccess: onModerateSuccess },
    ["/api/reviews/needsmoderation"],
  );

  const rejectMutation = useBackendMutation(
    ({ cell, moderatorComments }) =>
      cellToAxiosParamsModerate(cell, "REJECTED", moderatorComments),
    { onSuccess: onModerateSuccess },
    ["/api/reviews/needsmoderation"],
  );
  // Stryker restore all

  // Stryker disable next-line all
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const approveCallback = (cell) => {
    setPendingCell(cell);
    setPendingStatus("APPROVED");
    setShow(true);
  };

  const rejectCallback = (cell) => {
    setPendingCell(cell);
    setPendingStatus("REJECTED");
    setShow(true);
  };

  const handleSubmit = ({ moderatorComment }) => {
    if (pendingStatus === "APPROVED") {
      approveMutation.mutate({
        cell: pendingCell,
        moderatorComments: moderatorComment,
      });
    } else {
      rejectMutation.mutate({
        cell: pendingCell,
        moderatorComments: moderatorComment,
      });
    }
    handleClose();
  };

  const columns = [
    {
      Header: "Moderation Status",
      accessor: "status",
      Cell: ({ value }) => value,
    },
    {
      Header: "Moderator Comment",
      accessor: "moderatorComments",
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
      ButtonColumn("Approve", "primary", approveCallback, "Reviewstable"),
    );
    columns.push(
      ButtonColumn("Reject", "danger", rejectCallback, "Reviewstable"),
    );
  }

  return (
    <div>
      <ReviewModeratorModal
        isOpen={show}
        onClose={handleClose}
        status={pendingStatus}
        onSubmit={handleSubmit}
      />
      <OurTable data={reviews} columns={columns} testid={"Reviewstable"} />
    </div>
  );
}
