// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { getAdminDashboard, logout, getUsers } from "../services/api";
import { useNavigate } from "react-router-dom";

function AdminDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getAdminDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  if (loading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="bg-purple-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user.first_name || user.username}</span>
            <button
              onClick={handleLogout}
              className="bg-purple-700 px-3 py-1 rounded hover:bg-purple-800"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Statistics Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-semibold">
                  {dashboardData.users.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Students:</span>
                <span>{dashboardData.users.students}</span>
              </div>
              <div className="flex justify-between">
                <span>Lecturers:</span>
                <span>{dashboardData.users.lecturers}</span>
              </div>
              <div className="flex justify-between">
                <span>Admins:</span>
                <span>{dashboardData.users.admins}</span>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
                Manage Users
              </button>
            </div>
          </div>

          {/* Course Statistics Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Course Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Active Courses:</span>
                <span className="font-semibold">
                  {dashboardData.courses.active}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Archived Courses:</span>
                <span>{dashboardData.courses.archived}</span>
              </div>
              <div className="mt-8">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{
                      width: `${
                        (dashboardData.courses.active /
                          (dashboardData.courses.active +
                            dashboardData.courses.archived)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round(
                    (dashboardData.courses.active /
                      (dashboardData.courses.active +
                        dashboardData.courses.archived)) *
                      100
                  )}
                  % Active
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
                Manage Courses
              </button>
            </div>
          </div>

          {/* System Health Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Health</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-semibold ${
                    dashboardData.system_health.status === "Good"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {dashboardData.system_health.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span>{dashboardData.system_health.uptime}</span>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium">Recent Issues:</div>
                {dashboardData.system_health.recent_issues.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                    {dashboardData.system_health.recent_issues.map(
                      (issue, index) => (
                        <li key={index}>{issue}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-600 mt-2">
                    No recent issues
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
                System Settings
              </button>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recent_activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.details}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-2">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                View All Activities
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="user-container">
        <h2 className="text-xl font-semibold mb-4">Registered Users</h2>
        <div className="container">
          <table className="user-table">
            <thead className="table-header">
              <tr>
                <th className="px-6 py-3 whitespace-nowrap">First Name</th>
                <th className="px-6 py-3 whitespace-nowrap">Last Name</th>
                <th className="px-6 py-3 whitespace-nowrap">Email</th>
                <th className="px-6 py-3 whitespace-nowrap">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-3 whitespace-nowrap">
                    {user.first_name}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    {user.last_name}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-3 whitespace-nowrap">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
