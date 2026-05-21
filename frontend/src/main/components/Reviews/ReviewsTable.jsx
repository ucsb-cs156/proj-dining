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
import ModerationModal from "main/components/Moderation/ModerationModal";

export default function ReviewsTable({
  reviews,
  userOptions,
  moderatorOptions,
}) {
  const navigate = useNavigate();
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [pendingCell, setPendingCell] = useState(null);
  const [moderationStatus, setModerationStatus] = useState(null);
  const [moderatorComments, setModeratorComments] = useState("");

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
  const moderationMutation = useBackendMutation(
    ({ cell, status, moderatorComments }) =>
      cellToAxiosParamsModerate(cell, status, moderatorComments),
    { onSuccess: onModerateSuccess },
    ["/api/reviews/needsmoderation"],
  );

  const openModerationModal = (cell, status) => {
    setPendingCell(cell);
    setModerationStatus(status);
    setModeratorComments("");
    setShowModerationModal(true);
  };

  const approveCallback = async (cell) => {
    openModerationModal(cell, "APPROVED");
  };

  const rejectCallback = async (cell) => {
    openModerationModal(cell, "REJECTED");
  };

  const handleModerationSubmit = () => {
    /* istanbul ignore if */
    if (!pendingCell || !moderationStatus) {
      return;
    }

    moderationMutation.mutate({
      cell: pendingCell,
      status: moderationStatus,
      moderatorComments,
    });

    setShowModerationModal(false);
    setPendingCell(null);
    setModerationStatus(null);
    setModeratorComments("");
  };

  const handleCloseModerationModal = () => {
    setShowModerationModal(false);
    setPendingCell(null);
    setModerationStatus(null);
    setModeratorComments("");
  };

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
      ButtonColumn("Approve", "primary", approveCallback, "Reviewstable"),
    );
    columns.push(
      ButtonColumn("Reject", "danger", rejectCallback, "Reviewstable"),
    );
  }

  return (
    <>
      <OurTable data={reviews} columns={columns} testid={"Reviewstable"} />
      <ModerationModal
        show={showModerationModal}
        onHide={handleCloseModerationModal}
        status={moderationStatus}
        moderatorComments={moderatorComments}
        onModeratorCommentsChange={setModeratorComments}
        onSubmit={handleModerationSubmit}
        review={pendingCell?.row.original}
      />
    </>
  );
}
