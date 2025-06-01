import { render, fireEvent, screen } from "@testing-library/react";
import ReviewTable from "../../../main/components/Reviews/ReviewTable";
import { ReviewFixtures } from "../../../fixtures/reviewFixtures";

describe("ReviewTable Tests", () => {
  const data = ReviewFixtures.threeReviews;

  test("Headers and data render correctly (minimal)", () => {
    render(
      <ReviewTable data={data} userOptions={false} moderatorOptions={false} />
    );
    expect(screen.getByTestId("ReviewTable-header-Item ID")).toHaveTextContent(
      "Item ID"
    );
    expect(
      screen.getByTestId("ReviewTable-header-itemsStars")
    ).toHaveTextContent("Score");
    expect(
      screen.getByTestId("ReviewTable-header-reviewerComments")
    ).toHaveTextContent("Comments");
    expect(
      screen.getByTestId("ReviewTable-header-dateItemServed")
    ).toHaveTextContent("Date Served");
    // No action headers
    expect(
      screen.queryByTestId("ReviewTable-header-Edit")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-header-Delete")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-header-Approve")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-header-Reject")
    ).not.toBeInTheDocument();
    // Data rows
    for (let i = 0; i < data.length; i++) {
      expect(
        screen.getByTestId(`ReviewTable-cell-row-${i}-col-itemsStars`)
      ).toHaveTextContent(String(data[i].itemsStars));
      expect(
        screen.getByTestId(`ReviewTable-cell-row-${i}-col-reviewerComments`)
      ).toHaveTextContent(data[i].reviewerComments);
      expect(
        screen.getByTestId(`ReviewTable-cell-row-${i}-col-dateItemServed`)
      ).toHaveTextContent(data[i].dateItemServed);
    }
  });

  test("userOptions shows Edit/Delete buttons and calls callbacks", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(
      <ReviewTable
        data={data}
        userOptions={true}
        moderatorOptions={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
    // Headers
    expect(screen.getByTestId("ReviewTable-header-Edit")).toHaveTextContent(
      "Edit"
    );
    expect(screen.getByTestId("ReviewTable-header-Delete")).toHaveTextContent(
      "Delete"
    );
    // Buttons
    for (let i = 0; i < data.length; i++) {
      const editBtn = screen.getByTestId(
        `ReviewTable-cell-row-${i}-col-Edit-button`
      );
      const deleteBtn = screen.getByTestId(
        `ReviewTable-cell-row-${i}-col-Delete-button`
      );
      expect(editBtn).toBeInTheDocument();
      expect(deleteBtn).toBeInTheDocument();
      expect(editBtn).toHaveTextContent("Edit");
      expect(deleteBtn).toHaveTextContent("Delete");
      expect(editBtn.className).toMatch(/btn-primary/);
      expect(deleteBtn.className).toMatch(/btn-danger/);
      fireEvent.click(editBtn);
      fireEvent.click(deleteBtn);
    }
    expect(onEdit).toHaveBeenCalledTimes(data.length);
    expect(onDelete).toHaveBeenCalledTimes(data.length);
  });

  test("moderatorOptions shows Approve/Reject buttons and calls callbacks", () => {
    const onApprove = jest.fn();
    const onReject = jest.fn();
    render(
      <ReviewTable
        data={data}
        userOptions={false}
        moderatorOptions={true}
        onApprove={onApprove}
        onReject={onReject}
      />
    );
    // Headers
    expect(screen.getByTestId("ReviewTable-header-Approve")).toHaveTextContent(
      "Approve"
    );
    expect(screen.getByTestId("ReviewTable-header-Reject")).toHaveTextContent(
      "Reject"
    );
    // Buttons
    for (let i = 0; i < data.length; i++) {
      const approveBtn = screen.getByTestId(
        `ReviewTable-cell-row-${i}-col-Approve-button`
      );
      const rejectBtn = screen.getByTestId(
        `ReviewTable-cell-row-${i}-col-Reject-button`
      );
      expect(approveBtn).toBeInTheDocument();
      expect(rejectBtn).toBeInTheDocument();
      expect(approveBtn).toHaveTextContent("Approve");
      expect(rejectBtn).toHaveTextContent("Reject");
      expect(approveBtn.className).toMatch(/btn-success/);
      expect(rejectBtn.className).toMatch(/btn-danger/);
      fireEvent.click(approveBtn);
      fireEvent.click(rejectBtn);
    }
    expect(onApprove).toHaveBeenCalledTimes(data.length);
    expect(onReject).toHaveBeenCalledTimes(data.length);
  });

  test("minimal props shows no action buttons", () => {
    render(
      <ReviewTable data={data} userOptions={false} moderatorOptions={false} />
    );
    expect(
      screen.queryByTestId("ReviewTable-cell-row-0-col-Edit-button")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-cell-row-0-col-Delete-button")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-cell-row-0-col-Approve-button")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-cell-row-0-col-Reject-button")
    ).not.toBeInTheDocument();
  });

  test("renders empty Item ID when both itemId and item are missing", () => {
    const data = [
      {
        id: 999,
        reviewerComments: "No item id",
        itemsStars: 1,
        dateItemServed: "2022-01-01T00:00:00",
      },
    ];
    render(
      <ReviewTable data={data} userOptions={false} moderatorOptions={false} />
    );
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-Item ID")
    ).toHaveTextContent(/^\s*$/); // empty or whitespace only
  });

  test("renders Item ID from item.id when item is an object with id", () => {
    const data = [
      {
        id: 100,
        item: { id: 42 },
        reviewerComments: "Has item object with id",
        itemsStars: 5,
        dateItemServed: "2022-01-01T00:00:00",
      },
    ];
    render(
      <ReviewTable data={data} userOptions={false} moderatorOptions={false} />
    );
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-Item ID")
    ).toHaveTextContent("42");
  });

  test("renders Item ID from item when item is a primitive", () => {
    const data = [
      {
        id: 101,
        item: 99,
        reviewerComments: "Has item as primitive",
        itemsStars: 4,
        dateItemServed: "2022-01-01T00:00:00",
      },
    ];
    render(
      <ReviewTable data={data} userOptions={false} moderatorOptions={false} />
    );
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-Item ID")
    ).toHaveTextContent("99");
  });

  test("renders Item ID from itemId when item is missing", () => {
    const data = [
      {
        id: 102,
        itemId: 77,
        reviewerComments: "Has itemId only",
        itemsStars: 3,
        dateItemServed: "2022-01-01T00:00:00",
      },
    ];
    render(
      <ReviewTable data={data} userOptions={false} moderatorOptions={false} />
    );
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-Item ID")
    ).toHaveTextContent("77");
  });
});
