import React from "react";
import { Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";

export default function ReviewForm({ initialItemName, submitAction }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      comments: "",
      stars: 5,
      dateServed: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = (data) => {
    submitAction({
      reviewerComments: data.comments,
      itemsStars: data.stars,
      dateItemServed: data.dateServed,
    });
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
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
          isInvalid={Boolean(errors.comments)}
          {...register("comments", {
            maxLength: { value: 255, message: "Max length 255 characters" },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.comments?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="review-stars">Stars (1 to 5)</Form.Label>
        <Form.Select
          id="review-stars"
          isInvalid={Boolean(errors.stars)}
          {...register("stars", {
            valueAsNumber: true,
          })}
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
          isInvalid={Boolean(errors.dateServed)}
          {...register("dateServed", { required: "Date is required" })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateServed?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit">Submit Review</Button>
    </Form>
  );
}
