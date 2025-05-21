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

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<GoogleCallbackHandler />} />
          <Route
            path="/auth/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/auth/verify-email"
            element={<EmailVerificationPage />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <></>
                {/* <Dashboard /> */}
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
