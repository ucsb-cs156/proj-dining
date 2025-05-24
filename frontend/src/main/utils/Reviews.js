import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/reviews",
    method: "DELETE",
    params: {
      itemId: cell.row.values.itemId,
    },
  };
}
