import { toast } from "react-toastify";

export const cellToAxiosParamsApprove = (cell) => ({
  method: "PUT",
  url: "/api/currentUser/updateAliasModeration",
  params: {
    id: cell.row.original.id,
    approved: true,
    proposedAlias: cell.row.original.proposedAlias,
  },
});

export const cellToAxiosParamsReject = (cell) => ({
  method: "PUT",
  url: "/api/currentUser/updateAliasModeration",
  params: {
    id: cell.row.original.id,
    approved: false,
    proposedAlias: cell.row.original.proposedAlias,
  },
});

export function onModerateSuccess() {
  console.log("Moderation success");
  toast("Moderation success");
}
