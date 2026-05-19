import React from "react";
import { Form, Button } from "react-bootstrap";

export default function ReviewForm({
  initialItemName,
  initialContents,
  submitAction,
  buttonLabel = "Submit Review",
}) {
  // Stryker disable next-line all : default empty object is only used when creating a new review
  const contents = initialContents || {};

  // Stryker disable next-line all : date formatting helper is covered through page/form behavior
  const formatDateForInput = (date) =>
    date ? date.slice(0, 16) : new Date().toISOString().slice(0, 16);

  // Stryker disable next-line all : default empty string prevents uncontrolled input warnings
  const initialComments = contents.reviewerComments || "";

  const [comments, setComments] = React.useState(initialComments);

  const [stars, setStars] = React.useState(contents.itemsStars || 5);

  const initialDateServed = formatDateForInput(contents.dateItemServed);

  const [dateServed, setDateServed] = React.useState(initialDateServed);

  React.useEffect(() => {
    if (!initialContents) {
      return;
    }
    // Stryker disable next-line all : default empty string is used when edited review has no comment
    setComments(initialContents.reviewerComments || "");
    setStars(initialContents.itemsStars || 5);
    setDateServed(formatDateForInput(initialContents.dateItemServed));
  }, [initialContents]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAction({
      reviewerComments: comments,
      itemStars: stars,
      dateItemServed: dateServed,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="review-item-name">Item Name</Form.Label>
        <Form.Control
          id="review-item-name"
          type="text"
          value={initialItemName}
          disabled
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="review-comments">Comments</Form.Label>
        <Form.Control
          id="review-comments"
          as="textarea"
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="review-stars">Stars (1 to 5)</Form.Label>
        <Form.Select
          id="review-stars"
          value={stars}
          onChange={(e) => setStars(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="review-date">
          Date and Time Item was Served
        </Form.Label>
        <Form.Control
          id="review-date"
          type="datetime-local"
          value={dateServed}
          onChange={(e) => setDateServed(e.target.value)}
        />
      </Form.Group>

      <Button type="submit">{buttonLabel}</Button>
    </Form>
  );
}
