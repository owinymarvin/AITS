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
import HeadOfDepartment from "./components/Dashboards/HeadOfDepartment";
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

  // Helper function to convert role to lowercase and handle special cases
  const getRolePath = (role) => {
    if (!role) return "login";
    
    // Convert role to lowercase
    const lowerRole = role.toLowerCase();
    
    // Handle special case for HOD (Head of Department)
    if (lowerRole === "hod") {
      return "hod";
    }
    
    return lowerRole;
  };

  // Protected Route component to check role-based access
  const ProtectedRoute = ({ element, allowedRole }) => {
    // If no user or not authenticated, redirect to login
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    // If user doesn't have the allowed role, redirect to their dashboard
    const userRole = user.role?.toLowerCase();
    if (userRole !== allowedRole.toLowerCase() && 
        !(userRole === "hod" && allowedRole.toLowerCase() === "hod")) {
      return <Navigate to={`/dashboard/${getRolePath(user.role)}`} replace />;
    }
    
    // If user has the correct role, render the element
    return element;
  };

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
              <Navigate to={`/dashboard/${getRolePath(user.role)}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Define specific dashboard routes with role protection */}
        <Route 
          path="/dashboard/student" 
          element={<ProtectedRoute element={<Student user={user} />} allowedRole="student" />} 
        />
        <Route 
          path="/dashboard/lecturer" 
          element={<ProtectedRoute element={<Lecturer user={user} />} allowedRole="lecturer" />} 
        />
        <Route 
          path="/dashboard/hod" 
          element={<ProtectedRoute element={<HeadOfDepartment user={user} />} allowedRole="hod" />} 
        />
        <Route 
          path="/dashboard/admin" 
          element={<ProtectedRoute element={<Admin user={user} />} allowedRole="admin" />} 
        />

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
