export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/myreviews",
    method: "DELETE",
    params: {
      id: cell.row.values.id,
    },
  };
}
