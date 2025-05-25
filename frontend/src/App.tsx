// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
// import Dashboard from "./pages/Dashboard";
import { GoogleCallbackHandler } from "./components/auth/GoogleCallbackHandler";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import WatchlistPage from "./pages/WatchlistPage";
import { MoviesProvider } from "./contexts/MoviesContext";
import { MovieModalProvider } from "./contexts/MovieModalContext";
import SearchPage from "./pages/SearchPage";
import SearchNavbar from "./components/search/SearchNavbar";

function App() {
  return (
    <Router>
      <UserProvider>
        <MoviesProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<GoogleCallbackHandler />} />
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
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <MovieModalProvider>
                    <div className="min-h-screen bg-background text-foreground">
                      <SearchNavbar />
                      <Routes>
                        <Route index element={<DashboardPage />} />
                        <Route path="search" element={<SearchPage />} />
                        {/* <Route path="profile" element={<ProfilePage />} /> */}
                        <Route path="watchlist" element={<WatchlistPage />} />
                        {/* <Route path="favorites" element={<FavoritesPage />} /> */}
                        {/* <Route path="ratings" element={<RatingsPage />} /> */}
                      </Routes>
                    </div>
                  </MovieModalProvider>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MoviesProvider>
      </UserProvider>
    </Router>
  );
}

export default App;
