import React from "react";
import { Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";

export default function ReviewForm({ initialItemName, submitAction }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reviewerComments: "",
      itemsStars: 5,
      dateItemServed: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = (data) => {
    submitAction({
      reviewerComments: data.reviewerComments,
      itemsStars: Number(data.itemsStars),
      dateItemServed: data.dateItemServed,
    });

    reset();
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Label>Item Name</Form.Label>
        <Form.Control type="text" value={initialItemName} disabled />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="reviewerComments">Comments</Form.Label>

        <Form.Control
          id="reviewerComments"
          as="textarea"
          rows={3}
          isInvalid={Boolean(errors.reviewerComments)}
          {...register("reviewerComments", {
            required: "Comments are required",
          })}
        />

        <Form.Control.Feedback type="invalid">
          {errors.reviewerComments?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="itemsStars">Stars (1 to 5)</Form.Label>
        <Form.Select id="itemsStars" {...register("itemsStars")}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="dateItemServed">
          Date and Time Item was Served
        </Form.Label>

        <Form.Control
          id="dateItemServed"
          type="datetime-local"
          {...register("dateItemServed")}
        />
      </Form.Group>

      <Button type="submit">{buttonLabel}</Button>
    </Form>
  );
}
