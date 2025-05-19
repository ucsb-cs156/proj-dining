// src/components/ReviewForm.jsx
import React from "react";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function ReviewForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
  hideItemId = false,
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });

  const navigate = useNavigate();

  const renderItemInput = () => {
    if (hideItemId) return null;

    return (
      <Form.Group className="mb-3">
        <Form.Label htmlFor="itemId">Menu Item ID</Form.Label>
        <Form.Control
          id="itemId"
          type="number"
          min="1"
          step="1"
          isInvalid={Boolean(errors.itemId)}
          {...register("itemId", {
            required: "Menu item ID is required.",
            validate: (value) =>
              Number.isInteger(Number(value)) && Number(value) > 0
                ? true
                : "Item ID must be a positive integer.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.itemId?.message}
        </Form.Control.Feedback>
      </Form.Group>
    );
  };

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

      {renderItemInput()}

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

      <Button type="submit">{buttonLabel}</Button>
      <Button variant="secondary" className="ms-2" onClick={() => navigate(-1)}>
        Cancel
      </Button>
    </Form>
  );
}

export default ReviewForm;
