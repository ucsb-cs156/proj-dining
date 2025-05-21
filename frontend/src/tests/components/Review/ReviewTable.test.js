import { render, screen, fireEvent } from "@testing-library/react";
import ReviewTable from "main/components/Review/ReviewTable";

describe("ReviewTable Tests", () => {
  const reviews = [
    {
      id: 1,
      score: 5,
      comments: "Delicious!",
      dateServed: "2023-05-01",
      itemName: "Taco",
    },
    {
      id: 2,
      score: 3,
      comments: "Okay",
      dateServed: "2023-05-02",
      itemName: "Burrito",
    },
  ];

  const extractId = (arg) => {
    if (!arg) return null;

    if (arg.row && arg.row.original && arg.row.original.id !== undefined) {
      return arg.row.original.id;
    }

    if (arg.original && arg.original.id !== undefined) {
      return arg.original.id;
    }

    if (arg.id !== undefined) {
      return arg.id;
    }

    console.warn("⚠️ Unknown structure in mock arg:", arg);
    return null;
  };

  test("renders table with basic headers and no buttons", () => {
    render(<ReviewTable reviews={reviews} />);

    expect(screen.getByTestId("ReviewTable-header-score")).toHaveTextContent(
      "Score",
    );
    expect(screen.getByTestId("ReviewTable-header-comments")).toHaveTextContent(
      "Comments",
    );
    expect(
      screen.getByTestId("ReviewTable-header-dateServed"),
    ).toHaveTextContent("Date Served");

    expect(
      screen.queryByTestId("ReviewTable-header-itemName"),
    ).not.toBeInTheDocument();
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

    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-score"),
    ).toHaveTextContent("5");
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-comments"),
    ).toHaveTextContent("Delicious!");
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-dateServed"),
    ).toHaveTextContent("2023-05-01");
  });

  test("renders with userOptions=true: shows Item Name and Edit/Delete buttons", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(
      <ReviewTable
        reviews={reviews}
        userOptions={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(
      screen.getByTestId("ReviewTable-cell-row-0-col-Edit-button"),
    );
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(extractId(onEdit.mock.calls[0][0])).toEqual(reviews[0].id);

    fireEvent.click(
      screen.getByTestId("ReviewTable-cell-row-1-col-Delete-button"),
    );
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(extractId(onDelete.mock.calls[0][0])).toEqual(reviews[1].id);
  });

  test("renders with moderatorOptions=true: shows Approve/Reject buttons", () => {
    const onApprove = jest.fn();
    const onReject = jest.fn();

    render(
      <ReviewTable
        reviews={reviews}
        moderatorOptions={true}
        onApprove={onApprove}
        onReject={onReject}
      />,
    );

    fireEvent.click(
      screen.getByTestId("ReviewTable-cell-row-0-col-Approve-button"),
    );
    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(extractId(onApprove.mock.calls[0][0])).toEqual(reviews[0].id);

    fireEvent.click(
      screen.getByTestId("ReviewTable-cell-row-1-col-Reject-button"),
    );
    expect(onReject).toHaveBeenCalledTimes(1);
    expect(extractId(onReject.mock.calls[0][0])).toEqual(reviews[1].id);
  });

  test("renders correct text for all fields in each row", () => {
    render(<ReviewTable reviews={reviews} userOptions={true} />);

    expect(screen.getByText("Taco")).toBeInTheDocument();
    expect(screen.getByText("Burrito")).toBeInTheDocument();
    expect(screen.getByText("Delicious!")).toBeInTheDocument();
    expect(screen.getByText("Okay")).toBeInTheDocument();
    expect(screen.getByText("2023-05-01")).toBeInTheDocument();
    expect(screen.getByText("2023-05-02")).toBeInTheDocument();
  });

  test("renders all expected column headers with correct labels", () => {
    render(
      <ReviewTable
        reviews={reviews}
        userOptions={true}
        moderatorOptions={true}
        onEdit={() => {}}
        onDelete={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
      />,
    );

    expect(screen.getByTestId("ReviewTable-header-itemName")).toHaveTextContent(
      "Item Name",
    );
    expect(screen.getByTestId("ReviewTable-header-Edit")).toHaveTextContent(
      "Edit",
    );
    expect(screen.getByTestId("ReviewTable-header-Delete")).toHaveTextContent(
      "Delete",
    );
    expect(screen.getByTestId("ReviewTable-header-Approve")).toHaveTextContent(
      "Approve",
    );
    expect(screen.getByTestId("ReviewTable-header-Reject")).toHaveTextContent(
      "Reject",
    );
  });

  test("buttons have correct Bootstrap styles", () => {
    render(
      <ReviewTable
        reviews={reviews}
        userOptions={true}
        moderatorOptions={true}
        onEdit={() => {}}
        onDelete={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
      />,
    );

    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-Edit-button"),
    ).toHaveClass("btn-primary");
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-Delete-button"),
    ).toHaveClass("btn-danger");
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-Approve-button"),
    ).toHaveClass("btn-success");
    expect(
      screen.getByTestId("ReviewTable-cell-row-0-col-Reject-button"),
    ).toHaveClass("btn-danger");
  });

  test("renders correct number of columns when all options enabled", () => {
    render(
      <ReviewTable
        reviews={reviews}
        userOptions={true}
        moderatorOptions={true}
        onEdit={() => {}}
        onDelete={() => {}}
        onApprove={() => {}}
        onReject={() => {}}
      />,
    );

    const headerRow = screen.getByTestId("ReviewTable-header-group-0");
    expect(headerRow.childElementCount).toBe(8); // 3 default + 1 itemName + 2 user + 2 moderator
  });
});
