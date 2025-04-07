import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Lecturer from "./components/Dashboards/Lecturer";
import Student from "./components/Dashboards/Student";
import { getCurrentUser } from "./services/api";
import Admin from "./components/Dashboards/Admin";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData || null);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login setUser={setUser} />
            )
          }
        />
        <Route path="/register" element={<Register />} />

        {/* Redirect users based on their role */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Navigate to={`/dashboard/${user.role.toLowerCase()}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Define specific dashboard routes */}
        <Route path="/dashboard/student" element={<Student user={user} />} />
        <Route path="/dashboard/lecturer" element={<Lecturer user={user} />} />
        <Route path="/dashboard/admin" element={<Admin user={user} />} />

        {/* Default redirect to dashboard */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
