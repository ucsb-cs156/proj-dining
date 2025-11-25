import React from "react";
import { Card, Button } from "react-bootstrap";
import { Link } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

const ModerateMenuPage = () => {
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Moderator Actions</h1>
        <Card className="mt-3" data-testid="moderate-menu-reviews-card">
          <Card.Body>
            <Card.Title>Moderate Reviews</Card.Title>
            <Card.Text>
              Review and approve or reject pending menu item reviews.
            </Card.Text>
            <Button as={Link} to="/moderate/reviews" variant="primary">
              Go to Moderate Reviews
            </Button>
          </Card.Body>
        </Card>
        <Card className="mt-3" data-testid="moderate-menu-aliases-card">
          <Card.Body>
            <Card.Title>Moderate Aliases</Card.Title>
            <Card.Text>
              Review and approve or reject pending user alias requests.
            </Card.Text>
            <Button as={Link} to="/moderate/aliases" variant="primary">
              Go to Moderate Aliases
            </Button>
          </Card.Body>
        </Card>
      </div>
    </BasicLayout>
  );
};

export default ModerateMenuPage;
