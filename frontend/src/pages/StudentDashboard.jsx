// frontend/src/pages/StudentDashboard.js
import React, { useState, useEffect } from "react";
import { getStudentDashboard, logout } from "../services/api";
import { useNavigate } from "react-router-dom";

function StudentDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getStudentDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  if (loading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.first_name || user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-indigo-700 px-3 py-1 rounded hover:bg-indigo-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">My Courses</h2>
            <div className="space-y-4">
              {dashboardData.courses.map((course) => (
                <div key={course.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span>{course.title}</span>
                    <span className="font-semibold">{course.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Announcements</h2>
            <div className="space-y-4">
              {dashboardData.announcements.map((announcement) => (
                <div key={announcement.id} className="border-b pb-2">
                  <div className="text-indigo-600 font-medium">
                    {announcement.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {announcement.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {dashboardData.upcoming_deadlines.map((deadline) => (
                <div key={deadline.id} className="border-b pb-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{deadline.title}</span>
                    <span className="text-red-500">{deadline.due_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
