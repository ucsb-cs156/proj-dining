import { render, fireEvent, screen } from "@testing-library/react";
import ReviewTable from "../../../main/components/Reviews/ReviewTable";
import { ReviewFixtures } from "../../../fixtures/reviewFixtures";

describe("ReviewTable Tests", () => {
  const data = ReviewFixtures.threeReviews;

  test("Headers and data render correctly (minimal)", () => {
    render(
      <ReviewTable data={data} userOptions={false} moderatorOptions={false} />,
    );
    expect(
      screen.getByTestId("ReviewTable-header-itemsStars"),
    ).toHaveTextContent("Score");
    expect(
      screen.getByTestId("ReviewTable-header-reviewerComments"),
    ).toHaveTextContent("Comments");
    expect(
      screen.getByTestId("ReviewTable-header-dateItemServed"),
    ).toHaveTextContent("Date Served");
    // No action headers
    expect(
      screen.queryByTestId("ReviewTable-header-Edit"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-header-Delete"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-header-Approve"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-header-Reject"),
    ).not.toBeInTheDocument();
    // Data rows
    for (let i = 0; i < data.length; i++) {
      expect(
        screen.getByTestId(`ReviewTable-cell-row-${i}-col-itemsStars`),
      ).toHaveTextContent(String(data[i].itemsStars));
      expect(
        screen.getByTestId(`ReviewTable-cell-row-${i}-col-reviewerComments`),
      ).toHaveTextContent(data[i].reviewerComments);
      expect(
        screen.getByTestId(`ReviewTable-cell-row-${i}-col-dateItemServed`),
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
      />,
    );
    // Headers
    expect(screen.getByTestId("ReviewTable-header-Edit")).toHaveTextContent(
      "Edit",
    );
    expect(screen.getByTestId("ReviewTable-header-Delete")).toHaveTextContent(
      "Delete",
    );
    // Buttons
    for (let i = 0; i < data.length; i++) {
      const editBtn = screen.getByTestId(
        `ReviewTable-cell-row-${i}-col-Edit-button`,
      );
      const deleteBtn = screen.getByTestId(
        `ReviewTable-cell-row-${i}-col-Delete-button`,
      );
      expect(editBtn).toBeInTheDocument();
      expect(deleteBtn).toBeInTheDocument();
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
      />,
    );
    // Headers
    expect(screen.getByTestId("ReviewTable-header-Approve")).toHaveTextContent(
      "Approve",
    );
    expect(screen.getByTestId("ReviewTable-header-Reject")).toHaveTextContent(
      "Reject",
    );
    // Buttons
    for (let i = 0; i < data.length; i++) {
      const approveBtn = screen.getByTestId(
        `ReviewTable-cell-row-${i}-col-Approve-button`,
      );
      const rejectBtn = screen.getByTestId(
        `ReviewTable-cell-row-${i}-col-Reject-button`,
      );
      expect(approveBtn).toBeInTheDocument();
      expect(rejectBtn).toBeInTheDocument();
      fireEvent.click(approveBtn);
      fireEvent.click(rejectBtn);
    }
    expect(onApprove).toHaveBeenCalledTimes(data.length);
    expect(onReject).toHaveBeenCalledTimes(data.length);
  });

  test("minimal props shows no action buttons", () => {
    render(
      <ReviewTable data={data} userOptions={false} moderatorOptions={false} />,
    );
    expect(
      screen.queryByTestId("ReviewTable-cell-row-0-col-Edit-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-cell-row-0-col-Delete-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-cell-row-0-col-Approve-button"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("ReviewTable-cell-row-0-col-Reject-button"),
    ).not.toBeInTheDocument();
  });
});
