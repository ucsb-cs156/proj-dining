import React from "react";
import OurTable, { ButtonColumn } from "../OurTable";
import { useNavigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/ReviewsUtils";

export default function MenuItemReviewTable({ reviews, userOptions, moderatorOptions }) {
    const navigate = useNavigate();

    const deleteMutation = useBackendMutation(
        cellToAxiosParamsDelete,
        { onSuccess: onDeleteSuccess },
        ["/api/reviews/all"],
    );

  const editCallback = (cell) => {
    navigate(`/reviews/edit/${cell.row.original.id}`);
  };
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };
  const approveCallback = (cell) => {
        console.log("Approve clicked for item", cell.row.original.id);
        // TODO: Add mutation to mark review as approved
    };

    const rejectCallback = (cell) => {
        console.log("Reject clicked for item ", cell.row.original.id);
        // TODO: Add mutation to mark review as rejected
    };

  const columns = [
    {
      Header: "Item Id",
      accessor: "ItemId",
    },
    {
      Header: "Score",
      accessor: "itemsStars",
    },
    {
      Header: "Comments",
      accessor: "reviewerComments",
    },
    {
      Header: "Date Served",
      accessor: "dateItemServed",
    },
  ];

  if (userOptions) {
    columns.push({
        Header: "Item Name",
        accessor: "item.name",
    });
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "Reviewstable"),
    );
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
    <OurTable data={reviews} columns={columns} testid={"Reviewstable"} />
  );
}