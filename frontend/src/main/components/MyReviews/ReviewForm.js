import React from "react";
import { Form, Button } from "react-bootstrap";

export default function ReviewForm({ initialItemName, submitAction }) {
  const [comments, setComments] = React.useState("");
  const [stars, setStars] = React.useState(5);
  const [dateServed, setDateServed] = React.useState(() => {
    return new Date().toISOString().slice(0, 16); // Default to now, in YYYY-MM-DDTHH:mm format
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAction({
      reviewerComments: comments,
      itemsStars: stars,
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

      <Button type="submit">Submit Review</Button>
    </Form>
  );
}
