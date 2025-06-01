import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/reviews/reviewer",
    method: "DELETE",
    params: {
      id: cell.row.original.id,
    },
  };
}

export function cellToAxiosParamsModerate(cell, status) {
  return {
    url: "/api/reviews/moderate",
    method: "PUT",
    params: {
      id: cell.row.original.id,
      status: status,
      moderatorComments: "",
    },
  };
}

export function onModerateSuccess() {
  console.log("Moderation success");
}
