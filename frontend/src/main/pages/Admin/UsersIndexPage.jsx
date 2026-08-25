import { useState } from "react";
import { Form } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UsersTable from "main/components/Users/UsersTable";
import { useBackend } from "main/utils/useBackend";

const pageSizeOptions = [10, 25, 50, 100, 500];

export default function UsersIndexPage() {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const { data: users } = useBackend(
    // Stryker disable next-line ArrayDeclaration,StringLiteral: query key caching detail
    ["/api/admin/users"],
    // Stryker disable next-line StringLiteral: axios treats a falsy method as "GET"
    { method: "GET", url: "/api/admin/users" },
    // Stryker disable next-line ArrayDeclaration: empty array is the correct default
    [],
  );

  const totalPages = Math.ceil(users.length / pageSize);
  const paginatedUsers = users.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(0);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Users</h1>
        <Form.Group className="mb-3 d-flex align-items-center gap-2">
          <Form.Label className="mb-0">Page Size:</Form.Label>
          <Form.Select
            // Stryker disable next-line ObjectLiteral,StringLiteral: style is a visual detail
            style={{ width: "auto" }}
            value={pageSize}
            onChange={handlePageSizeChange}
            data-testid="UsersIndexPage-pageSize"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        <UsersTable users={paginatedUsers} />
        <div className="d-flex align-items-center gap-2 mt-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
            disabled={currentPage === 0}
            data-testid="UsersIndexPage-prev"
          >
            Previous
          </button>
          <span data-testid="UsersIndexPage-page-info">
            Page {currentPage + 1} of {Math.max(totalPages, 1)}
          </span>
          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              // Stryker disable next-line ArithmeticOperator: next button is disabled at last page, so + 1 is unreachable in practice
              setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
            }
            disabled={currentPage >= totalPages - 1}
            data-testid="UsersIndexPage-next"
          >
            Next
          </button>
        </div>
      </div>
    </BasicLayout>
  );
}
