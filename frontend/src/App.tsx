// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import { GoogleCallbackHandler } from "./components/auth/GoogleCallbackHandler";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import WatchlistPage from "./pages/WatchlistPage";
import SearchPage from "./pages/SearchPage";
import FavoritesPage from "./pages/FavoritesPage";
import RatingsPage from "./pages/RatingsPage";
import UserProfilePage from "./pages/UserProfilePage";
import { MoviesProvider } from "./contexts/MoviesContext";
import { MovieModalProvider } from "./contexts/MovieModalContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import { MessageProvider } from "./contexts/MessageContext";
import { GlobalMessages } from "./components/common/GlobalMessages";

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Wrap entire app */}
        <MessageProvider>
          <UserProvider>
            <GlobalMessages />
            <MoviesProvider>
              <MovieModalProvider>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route
                    path="/auth/callback"
                    element={<GoogleCallbackHandler />}
                  />
                  <Route
                    path="/auth/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/auth/reset-password"
                    element={<ResetPasswordPage />}
                  />
                  <Route
                    path="/auth/verify-email"
                    element={<EmailVerificationPage />}
                  />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="watchlist" element={<WatchlistPage />} />
                    <Route path="favorites" element={<FavoritesPage />} />
                    <Route path="ratings" element={<RatingsPage />} />
                    <Route path="profile" element={<UserProfilePage />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </MovieModalProvider>
            </MoviesProvider>
          </UserProvider>
        </MessageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
