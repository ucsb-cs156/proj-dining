import OurTable, { ButtonColumn } from "main/components/OurTable";

export default function ReviewTable({
  data,
  userOptions,
  moderatorOptions,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) {
  const columns = [
    {
      Header: "Item ID",
      accessor: (row) => row.item?.id ?? row.item ?? row.itemId ?? "",
    },
    { Header: "Score", accessor: "itemsStars" },
    { Header: "Comments", accessor: "reviewerComments" },
    { Header: "Date Served", accessor: "dateItemServed" },
  ];

  if (userOptions) {
    columns.push(
      ButtonColumn("Edit", "primary", onEdit || (() => {}), "ReviewTable")
    );
    columns.push(
      ButtonColumn("Delete", "danger", onDelete || (() => {}), "ReviewTable")
    );
  }

  if (moderatorOptions) {
    columns.push(
      ButtonColumn("Approve", "success", onApprove || (() => {}), "ReviewTable")
    );
    columns.push(
      ButtonColumn("Reject", "danger", onReject || (() => {}), "ReviewTable")
    );
  }

  return <OurTable data={data} columns={columns} testid="ReviewTable" />;
}
