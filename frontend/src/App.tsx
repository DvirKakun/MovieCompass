import HomePage from "./pages/HomePage";

function App() {
  // Future: Add React Router here
  // For now, just render HomePage
  return <HomePage />;

  // Future routing structure:
  /*
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
  */
}

export default App;
