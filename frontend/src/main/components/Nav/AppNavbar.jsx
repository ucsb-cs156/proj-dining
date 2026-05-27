import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router";
import { hasRole } from "main/utils/currentUser";
import AppNavbarLocalhost from "main/components/Nav/AppNavbarLocalhost";

export default function AppNavbar({
  currentUser,
  systemInfo,
  doLogout,
  currentUrl = window.location.href,
}) {
  var oauthLogin = systemInfo?.oauthLogin || "/oauth2/authorization/google";

  return (
    <>
      {(currentUrl.startsWith("http://localhost:3000") ||
        currentUrl.startsWith("http://127.0.0.1:3000")) && (
        <AppNavbarLocalhost url={currentUrl} />
      )}

      <Navbar
        expand="xl"
        variant="dark"
        bg="dark"
        sticky="top"
        data-testid="AppNavbar"
      >
        <Container>
          <Navbar.Brand as={Link} to="/">
            UCSB Dining
          </Navbar.Brand>

          <Navbar.Toggle />

          <Nav className="me-auto">
            {systemInfo?.springH2ConsoleEnabled && (
              <Nav.Link href="/h2-console">H2Console</Nav.Link>
            )}

            {systemInfo?.showSwaggerUILink && (
              <Nav.Link href="/swagger-ui/index.html">Swagger</Nav.Link>
            )}
          </Nav>

          <>
            {/* be sure that each NavDropdown has a unique id and data-testid */}
          </>

          <Navbar.Collapse className="justify-content-between">
            <Nav className="mr-auto">
              {hasRole(currentUser, "ROLE_ADMIN") && (
                <NavDropdown
                  title="Admin"
                  id="appnavbar-admin-dropdown"
                  data-testid="appnavbar-admin-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/admin/users">
                    Users
                  </NavDropdown.Item>
                </NavDropdown>
              )}

              {(hasRole(currentUser, "ROLE_ADMIN") ||
                hasRole(currentUser, "ROLE_MODERATOR")) && (
                <NavDropdown
                  title="Moderate"
                  id="appnavbar-moderate-dropdown"
                  data-testid="appnavbar-moderate-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/moderate/aliases">
                    Moderator Page
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/moderate">
                    Moderate Reviews
                  </NavDropdown.Item>
                </NavDropdown>
              )}

              {currentUser && currentUser.loggedIn ? (
               <>
                  <Nav.Link as={Link} to="/myreviews">
                    My Reviews
                  </Nav.Link>
                  <NavDropdown
                    title="Statistics"
                    id="appnavbar-statistics-dropdown"
                    data-testid="appnavbar-statistics-dropdown"
                  >
                    <NavDropdown.Item
                      as={Link}
                      to="/statistics"
                      data-testid="appnavbar-statistics-overview"
                    >
                      Overview
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      as={Link}
                      to="/statistics/items/best"
                      data-testid="appnavbar-statistics-best-items"
                    >
                      Best Rated Items
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      as={Link}
                      to="/statistics/items/worst"
                      data-testid="appnavbar-statistics-worst-items"
                    >
                      Worst Rated Items
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      as={Link}
                      to="/statistics/commons/averages"
                      data-testid="appnavbar-statistics-commons-averages"
                    >
                      Commons Averages
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      as={Link}
                      to="/statistics/commons/overtime"
                      data-testid="appnavbar-statistics-commons-overtime"
                    >
                      Commons Over Time
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      as={Link}
                      to="/statistics/commons/meals"
                      data-testid="appnavbar-statistics-commons-meals"
                    >
                      Commons Meal Averages
                    </NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <></>
              )}
            </Nav>

            <Nav className="ml-auto">
              {currentUser && currentUser.loggedIn ? (
                <>
                  <Navbar.Text className="me-3" as={Link} to="/profile">
                    Welcome, {currentUser.root.user.email}
                  </Navbar.Text>

                  <Button onClick={doLogout}>Log Out</Button>
                </>
              ) : (
                <Button href={oauthLogin}>Log In</Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
