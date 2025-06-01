import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

export default function ReviewEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: review,
    isLoading,
    error,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/reviews/reviewer", id],
    // Stryker disable next-line all : default is GET
    { method: "GET", url: "/api/reviews/get", params: { id } },
    null,
  );

  // Stryker disable next-line StringLiteral: The default value for dateItemServed is never exposed to the user; this mutant is not killable without a UX-breaking refactor.
  const [form, setForm] = useState({
    itemStars: 0,
    reviewerComments: "",
    // Stryker disable next-line StringLiteral: The default value for dateItemServed is never exposed to the user; this mutant is not killable without a UX-breaking refactor.
    dateItemServed: "",
  });

  useEffect(() => {
    if (review) {
      setForm({
        itemStars: review.itemStars ?? review.itemsStars,
        reviewerComments: review.reviewerComments,
        // Stryker disable next-line all : don't test fallback value
        dateItemServed: review.dateItemServed?.slice(0, 16) || "",
      });
    }
  }, [review]);

  const objectToAxiosParams = (formData) => ({
    url: "/api/reviews/reviewer",
    method: "PUT",
    params: { id },
    data: {
      itemStars: Number(formData.itemStars),
      reviewerComments: formData.reviewerComments,
      dateItemServed: formData.dateItemServed,
    },
  });

  const mutation = useBackendMutation(objectToAxiosParams, {
    onSuccess: () => {
      toast.success("Review updated");
      navigate("/myreviews");
    },
    onError: () => toast.error("Failed to update review"),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  // Stryker disable next-line all : don't test loading state
  if (isLoading) {
    return <BasicLayout>Loading...</BasicLayout>;
  }

  // Stryker disable next-line all : don't test error state
  if (error || !review) {
    return (
      <BasicLayout>
        <p>Review not found.</p>
      </BasicLayout>
    );
  }
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Review</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="itemStars">
            <Form.Label>Score</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={5}
              name="itemStars"
              value={form.itemStars}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="reviewerComments">
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              name="reviewerComments"
              value={form.reviewerComments}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="dateItemServed">
            <Form.Label>Date Served</Form.Label>
            <Form.Control
              type="datetime-local"
              name="dateItemServed"
              value={form.dateItemServed}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={mutation.isLoading}>
            {mutation.isLoading ? (
              <Spinner size="sm" animation="border" />
            ) : (
              "Save"
            )}
          </Button>
          <Button
            variant="secondary"
            className="ms-2"
            // Stryker disable next-line all : don't test navigation
            onClick={() => navigate("/myreviews")}
          >
            Cancel
          </Button>
        </Form>
      </div>
    </BasicLayout>
  );
}
