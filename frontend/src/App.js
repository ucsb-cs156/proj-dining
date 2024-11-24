import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";
import ModeratePage from "main/pages/ModeratePage";
import DiningCommonsIndexPage from "main/pages/Dining/DiningCommonsIndexPage";
import PlaceholderIndexPage from "main/pages/Placeholder/PlaceholderIndexPage";
import PlaceholderCreatePage from "main/pages/Placeholder/PlaceholderCreatePage";
import PlaceholderEditPage from "main/pages/Placeholder/PlaceholderEditPage";
import MyReviewsPage from "main/pages/MyReviews/MyReviewsPage";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/profile" element={<ProfilePage />} />
        <>
          <Route
            exact
            path="/diningcommons/:diningCommonsCode"
            element={<DiningCommonsIndexPage />}
          />
        </>
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route exact path="/admin/users" element={<AdminUsersPage />} />
            <Route exact path="/moderate" element={<ModeratePage />} />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route
              exact
              path="/placeholder"
              element={<PlaceholderIndexPage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route
              exact
              path="/placeholder/edit/:id"
              element={<PlaceholderEditPage />}
            />
            <Route
              exact
              path="/placeholder/create"
              element={<PlaceholderCreatePage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route exact path="/myreviews" element={<MyReviewsPage />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
