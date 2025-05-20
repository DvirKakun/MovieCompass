// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
// import Dashboard from "./pages/Dashboard";
import { GoogleCallbackHandler } from "./components/auth/GoogleCallbackHandler";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes - no auth required */}
        <Route path="/" element={<HomePage />} />

        {/* Auth-related routes - need UserProvider for login/redirect logic */}
        <Route
          path="/auth"
          element={
            <UserProvider>
              <AuthPage />
            </UserProvider>
          }
        />

        <Route
          path="/auth/callback"
          element={
            <UserProvider>
              <GoogleCallbackHandler />
            </UserProvider>
          }
        />

        {/* Protected routes - need UserProvider for auth checks */}
        <Route
          path="/dashboard/"
          element={
            <UserProvider>
              <ProtectedRoute>
                <></>
                {/* <Dashboard /> */}
              </ProtectedRoute>
            </UserProvider>
          }
        />

        {/* Add other protected routes here */}
      </Routes>
    </Router>
  );
}

export default App;
