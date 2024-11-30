export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/reviews",
    method: "DELETE",
    params: {
      id: cell.row.values.id,
    },
  };
}
