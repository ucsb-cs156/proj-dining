// src/components/ReviewForm.jsx
import React from "react";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function ReviewForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
  itemName = "", // New prop for the item name
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });

  const navigate = useNavigate();

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents?.id && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            disabled
          />
        </Form.Group>
      )}

      {/* Disabled item name field */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="itemName">Item Being Reviewed</Form.Label>
        <Form.Control
          id="itemName"
          type="text"
          value={itemName}
          disabled
          placeholder="Item name will be displayed here"
        />
      </Form.Group>

      {/* Stars rating */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="stars">Stars</Form.Label>
        <Form.Control
          id="stars"
          type="number"
          step="1"
          min="1"
          max="5"
          placeholder="Please enter an integer from 1 to 5"
          title="Enter a whole number between 1 and 5"
          isInvalid={Boolean(errors.stars)}
          {...register("stars", {
            required: "Stars is required.",
            min: { value: 1, message: "Minimum 1 star" },
            max: { value: 5, message: "Maximum 5 stars" },
            validate: (v) =>
              Number.isInteger(Number(v)) || "Please enter a whole number.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.stars?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Comments field */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="comments">
          Comments <span className="text-muted">(optional)</span>
        </Form.Label>
        <Form.Control
          id="comments"
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.comments)}
          {...register("comments", {
            maxLength: {
              value: 255,
              message: "Max length is 255 characters",
            },
          })}
          placeholder="Write your thoughts... (optional)"
        />
        <Form.Control.Feedback type="invalid">
          {errors.comments?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Date-time picker for when item was served */}
      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateServed">Date & Time Served</Form.Label>
        <Form.Control
          id="dateServed"
          type="datetime-local"
          isInvalid={Boolean(errors.dateServed)}
          {...register("dateServed", {
            required: "Date and time served is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.dateServed?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit">{buttonLabel}</Button>
      <Button variant="secondary" className="ms-2" onClick={() => navigate(-1)}>
        Cancel
      </Button>
    </Form>
  );
}

export default ReviewForm;
