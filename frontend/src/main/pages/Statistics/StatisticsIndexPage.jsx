import React from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { STATISTICS_PAGES } from "main/pages/Statistics/statisticsConstants";

export default function StatisticsIndexPage() {
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Review Statistics</h1>
        <p>
          Pick a statistic below to help you decide where to eat your next meal.
        </p>
        <Row>
          {STATISTICS_PAGES.map((page) => (
            <Col
              key={page.testid}
              md={6}
              lg={4}
              className="mb-3"
              data-testid={`${page.testid}-col`}
            >
              <Card>
                <Card.Body>
                  <Card.Title>{page.title}</Card.Title>
                  <Card.Text>{page.description}</Card.Text>
                  <Button variant="primary" disabled data-testid={page.testid}>
                    Coming Soon
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </BasicLayout>
  );
}
