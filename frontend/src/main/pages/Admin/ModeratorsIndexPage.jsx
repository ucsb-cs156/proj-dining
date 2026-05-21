import React from "react";
import { useBackend } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RoleEmailTable from "main/components/Users/RoleEmailTable";
import { Button } from "react-bootstrap";
import { Link } from "react-router";

export default function ModeratorsIndexPage() {
  const {
    data: moderators,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/admin/moderators/get"],
    { method: "GET", url: "/api/admin/moderators/get" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const createButton = () => {
    return (
      <Button
        variant="primary"
        as={Link}
        to="/admin/moderators/create"
        style={{ float: "right" }}
      >
        New Moderator
      </Button>
    );
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>Moderators</h1>
        <RoleEmailTable
          data={moderators}
          deleteEndpoint="/api/admin/moderators/delete"
          getEndpoint="/api/admin/moderators/get"
          testIdPrefix="ModeratorsIndexPage"
        />
      </div>
    </BasicLayout>
  );
}
