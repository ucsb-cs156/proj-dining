import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "main/pages/HomePage";
import ProfilePage from "main/pages/ProfilePage";
import AdminUsersPage from "main/pages/AdminUsersPage";
import ModeratorsCreatePage from "main/pages/Admin/ModeratorsCreatePage";

import ReviewsPage from "main/pages/Reviews/ReviewsPage";

import MyReviewsIndexPage from "main/pages/MyReviews/MyReviewsIndexPage";
import PostReviewPage from "main/pages/Reviews/PostReviewPage";

import EditReviewPage from "main/pages/Reviews/EditReviewPage";

import MealTimesPage from "main/pages/Meal/MealTimesPage";

import ModerateReviews from "main/pages/ModerateReviewsPage";
import ModerateAliases from "main/pages/ModerateAliasesPage";

import StatisticsIndexPage from "main/pages/Statistics/StatisticsIndexPage";
import BestItemsPage from "main/pages/Statistics/BestItemsPage";
import WorstItemsPage from "main/pages/Statistics/WorstItemsPage";
import CommonsAveragesPage from "main/pages/Statistics/CommonsAveragesPage";
import CommonsAveragesOverTimePage from "main/pages/Statistics/CommonsAveragesOverTimePage";
import CommonsMealAveragesPage from "main/pages/Statistics/CommonsMealAveragesPage";

import { hasRole, useCurrentUser } from "main/utils/currentUser";

import "bootstrap/dist/css/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import MenuItemPage from "main/pages/MenuItem/MenuItemPage";

function App() {
  const { data: currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/profile" element={<ProfilePage />} />
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <>
            <Route exact path="/admin/users" element={<AdminUsersPage />} />
            <Route
              exact
              path="/admin/moderators/create"
              element={<ModeratorsCreatePage />}
            />
          </>
        )}
        {hasRole(currentUser, "ROLE_USER") && (
          <>
            <Route exact path="/myreviews" element={<MyReviewsIndexPage />} />
            <Route
              exact
              path="/reviews/post/:id"
              element={<PostReviewPage />}
            />

            <Route
              exact
              path="/reviews/edit/:id"
              element={<EditReviewPage />}
            />

            <Route exact path="/reviews/:itemid" element={<ReviewsPage />} />

            <Route exact path="/statistics" element={<StatisticsIndexPage />} />
            <Route
              exact
              path="/statistics/items/best"
              element={<BestItemsPage />}
            />
            <Route
              exact
              path="/statistics/items/worst"
              element={<WorstItemsPage />}
            />
            <Route
              exact
              path="/statistics/commons/averages"
              element={<CommonsAveragesPage />}
            />
            <Route
              exact
              path="/statistics/commons/overtime"
              element={<CommonsAveragesOverTimePage />}
            />
            <Route
              exact
              path="/statistics/commons/meals"
              element={<CommonsMealAveragesPage />}
            />
          </>
        )}
        {(hasRole(currentUser, "ROLE_ADMIN") ||
          hasRole(currentUser, "ROLE_MODERATOR")) && (
          <>
            <Route exact path="/moderation" element={<ModerateReviews />} />
            <Route exact path="/moderate" element={<ModerateReviews />} />
            <Route
              exact
              path="/moderate/aliases"
              element={<ModerateAliases />}
            />
          </>
        )}
        <>
          <Route
            exact
            path="/diningcommons/:date-time/:dining-commons-code"
            element={<MealTimesPage />}
          />
        </>
        <>
          <Route
            exact
            path="/diningcommons/:date-time/:dining-commons-code/:meal"
            element={<MenuItemPage />}
          />
        </>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
