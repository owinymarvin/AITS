import React, { useState, useEffect } from "react";
import {
  getColleges,
  getDepartments,
  getUsers,
  getIssues,
  getCourses,
  logout,
  register,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaTable,
  FaGraduationCap,
  FaBriefcase,
  FaClipboardList,
  FaTools,
  FaBell,
  FaChartBar,
  FaBook,
} from "react-icons/fa";
import { Table, Modal, Form, Button } from "react-bootstrap";
import Colleges from "./Colleges";
import Departments from "./Departments";
import Courses from "./Courses";
import "./admin.css"; // Import the CSS file

const Admin = ({ user }) => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState([]);
  const [dept, setDept] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 16) return "Good afternoon";
      return "Good evening";
    };

    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await getColleges();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const data = await getDepartments();
        setDept(data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };

    fetchDepartment();
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

  // Menu items for the sidebar
  const menuItems = [
    { id: "dashboard", label: "Admin's Dashboard", icon: <FaTable /> },
    { id: "users", label: "Users", icon: <FaUsers /> },
    { id: "departments", label: "Departments", icon: <FaBriefcase /> },
    { id: "colleges", label: "Colleges", icon: <FaGraduationCap /> },
    { id: "issues", label: "Issues", icon: <FaClipboardList /> },
    { id: "courses", label: "Courses", icon: <FaBook /> },
    { id: "settings", label: "Settings", icon: <FaTools /> },
  ];

  // Function to render the active content based on menu selection
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent />;
      case "users":
        return <UsersContent users={users} />;
      case "departments":
        return <Departments dept={dept} />;
      case "colleges":
        return <Colleges dashboardData={dashboardData} />;
      case "issues":
        return <Issues />;
      case "courses":
        return <Courses />;
      case "settings":
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">Admin's Dashboard</div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeMenu === item.id ? "active" : ""}`}
              onClick={() => setActiveMenu(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="header">
          <h1 className="page-title">
            {menuItems.find((item) => item.id === activeMenu)?.label ||
              "Dashboard"}
          </h1>
          <div className="header-actions">
            <div className="flex items-center space-x-4">
              <span className="user-name">
                {" "}
                {user.first_name || user.username}
              </span>
              <button className="log_out" onClick={handleLogout}>
                Logout
              </button>
            </div>
            <button className="notification-btn">
              <FaBell />
            </button>
          </div>
        </header>
        <h2 className="welcome">
          {greeting}, {user.first_name} {user.last_name}
        </h2>
        <main className="content">{renderContent()}</main>
      </div>
    </div>
  );
};

// Enhanced DashboardContent component
const DashboardContent = () => {
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [courses, setCourses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [recentIssues, setRecentIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [usersData, issuesData, coursesData, collegesData, departmentsData] = await Promise.all([
          getUsers(),
          getIssues(),
          getCourses(),
          getColleges(),
          getDepartments()
        ]);
        
        setUsers(usersData);
        setIssues(issuesData);
        setCourses(coursesData);
        setColleges(collegesData);
        setDepartments(departmentsData);
        
        // Get 5 most recent issues
        const sortedIssues = [...issuesData].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentIssues(sortedIssues.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate statistics
  const studentCount = users.filter(user => user.role === 'STUDENT').length;
  const lecturerCount = users.filter(user => user.role === 'LECTURER').length;
  const hodCount = users.filter(user => user.role === 'HOD').length;
  const adminCount = users.filter(user => user.role === 'ADMIN').length;
  
  const pendingIssues = issues.filter(issue => issue.status === 'Pending').length;
  const inProgressIssues = issues.filter(issue => issue.status === 'InProgress').length;
  const resolvedIssues = issues.filter(issue => issue.status === 'Solved').length;

  // Calculate issue type distribution
  const missingMarksCount = issues.filter(issue => issue.issue_type === 'Missing Marks').length;
  const appealsCount = issues.filter(issue => issue.issue_type === 'Appeals').length;
  const correctionsCount = issues.filter(issue => issue.issue_type === 'Corrections').length;

  return (
    <div>
      <h2 className="section-title">System Overview</h2>
      
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Total Users</h2>
          <p className="card-value">{users.length}</p>
          <div className="card-footer">
            <div className="d-flex justify-content-between small-text">
              <span>Students: {studentCount}</span>
              <span>Lecturers: {lecturerCount}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Total Courses</h2>
          <p className="card-value">{courses.length}</p>
          <div className="card-footer">
            <div className="small-text">
              <span>Across {departments.length} departments</span>
            </div>
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Total Issues</h2>
          <p className="card-value">{issues.length}</p>
          <div className="card-footer">
            <div className="d-flex justify-content-between small-text">
              <span>Pending: {pendingIssues}</span>
              <span>Resolved: {resolvedIssues}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <h2 className="card-title">Users Distribution</h2>
            <div className="p-3">
              <div className="chart-container">
                <div className="chart-bar" style={{ height: '200px' }}>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-primary" style={{ height: `${(studentCount / users.length) * 100}%` }}></div>
                    <span className="chart-label">Students</span>
                    <span className="chart-value">{studentCount}</span>
                  </div>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-info" style={{ height: `${(lecturerCount / users.length) * 100}%` }}></div>
                    <span className="chart-label">Lecturers</span>
                    <span className="chart-value">{lecturerCount}</span>
                  </div>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-warning" style={{ height: `${(hodCount / users.length) * 100}%` }}></div>
                    <span className="chart-label">HODs</span>
                    <span className="chart-value">{hodCount}</span>
                  </div>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-success" style={{ height: `${(adminCount / users.length) * 100}%` }}></div>
                    <span className="chart-label">Admins</span>
                    <span className="chart-value">{adminCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <h2 className="card-title">Issue Status Distribution</h2>
            <div className="p-3">
              <div className="chart-container">
                <div className="chart-bar" style={{ height: '200px' }}>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-warning" style={{ height: `${(pendingIssues / issues.length) * 100}%` }}></div>
                    <span className="chart-label">Pending</span>
                    <span className="chart-value">{pendingIssues}</span>
                  </div>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-info" style={{ height: `${(inProgressIssues / issues.length) * 100}%` }}></div>
                    <span className="chart-label">In Progress</span>
                    <span className="chart-value">{inProgressIssues}</span>
                  </div>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-success" style={{ height: `${(resolvedIssues / issues.length) * 100}%` }}></div>
                    <span className="chart-label">Resolved</span>
                    <span className="chart-value">{resolvedIssues}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <h2 className="card-title">Issue Type Distribution</h2>
            <div className="p-3">
              <div className="chart-container">
                <div className="chart-bar" style={{ height: '200px' }}>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-danger" style={{ height: `${(missingMarksCount / issues.length) * 100}%` }}></div>
                    <span className="chart-label">Missing Marks</span>
                    <span className="chart-value">{missingMarksCount}</span>
                  </div>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-primary" style={{ height: `${(appealsCount / issues.length) * 100}%` }}></div>
                    <span className="chart-label">Appeals</span>
                    <span className="chart-value">{appealsCount}</span>
                  </div>
                  <div className="chart-column">
                    <div className="chart-bar-fill bg-secondary" style={{ height: `${(correctionsCount / issues.length) * 100}%` }}></div>
                    <span className="chart-label">Corrections</span>
                    <span className="chart-value">{correctionsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <h2 className="card-title">Recent Issues</h2>
            {isLoading ? (
              <p className="p-3">Loading recent issues...</p>
            ) : (
              <div className="p-3">
                {recentIssues.length > 0 ? (
                  <div className="recent-issues">
                    {recentIssues.map(issue => (
                      <div key={issue.id} className="activity-item">
                        <div className="d-flex justify-content-between">
                          <strong>{issue.title}</strong>
                          <span className={`badge bg-${
                            issue.status === 'Pending' ? 'warning' : 
                            issue.status === 'InProgress' ? 'info' : 'success'
                          }`}>{issue.status}</span>
                        </div>
                        <p className="small text-muted mb-0">{issue.issue_type} - {new Date(issue.created_at).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No recent issues found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersContent = ({ users }) => {
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "STUDENT",
    college_code: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    const loadColleges = async () => {
      try {
        const data = await getColleges();
        setColleges(data);
      } catch (error) {
        console.error("Error loading colleges:", error);
      }
    };
    loadColleges();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      await register(newUser);
      setFormSuccess("User created successfully!");
      setNewUser({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
        role: "STUDENT",
        college_code: "",
      });
      // Refresh user list
      window.location.reload();
    } catch (error) {
      setFormError(
        error.response?.data?.details?.email?.[0] || 
        "Error creating user. Please try again."
      );
    }
  };

  return (
    <div>
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Total Admins</h2>
          <p className="card-value">{users.filter(u => u.role === "ADMIN").length}</p>
        </div>
        <div className="card">
          <h2 className="card-title">Total Lecturers</h2>
          <p className="card-value">{users.filter(u => u.role === "LECTURER").length}</p>
        </div>
        <div className="card">
          <h2 className="card-title">Total Students</h2>
          <p className="card-value">{users.filter(u => u.role === "STUDENT").length}</p>
        </div>
      </div>

      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>List of users</h2>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddUserForm(!showAddUserForm)}
          >
            {showAddUserForm ? "Cancel" : "Add New User"}
          </button>
        </div>

        {showAddUserForm && (
          <div className="card mb-4 p-3">
            <h3>Create New User</h3>
            {formError && <div className="alert alert-danger">{formError}</div>}
            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="first_name"
                    value={newUser.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="last_name"
                    value={newUser.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="HOD">Head of Department</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">College</label>
                <select
                  className="form-select"
                  name="college_code"
                  value={newUser.college_code}
                  onChange={handleInputChange}
                  required={newUser.role === "STUDENT"}
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college.id} value={college.code}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-success">
                Create User
              </button>
            </form>
          </div>
        )}

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button className="btn btn-sm btn-info me-2">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [assignData, setAssignData] = useState({
    userId: '',
    issueId: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/issues/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        const data = await response.json();
        setIssues(data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    };

    const fetchLecturers = async () => {
      try {
        const data = await getUsers();
        // Filter out only lecturers and HODs
        const staffUsers = data.filter(user => 
          user.role === 'LECTURER' || user.role === 'HOD'
        );
        setLecturers(staffUsers);
      } catch (error) {
        console.error('Error fetching lecturers:', error);
      }
    };

    fetchIssues();
    fetchLecturers();
  }, []);

  const handleOpenAssignModal = (issue) => {
    setSelectedIssue(issue);
    setAssignData({ userId: '', issueId: issue.id });
    setAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedIssue(null);
  };

  const viewIssueDetails = (issue) => {
    setSelectedIssue(issue);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedIssue(null);
  };

  const handleAssignChange = (e) => {
    setAssignData({
      ...assignData,
      [e.target.name]: e.target.value
    });
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://localhost:8000/api/issues/${assignData.issueId}/assign/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ user_id: assignData.userId })
      });
      
      if (response.ok) {
        // Update the issue in the local state
        const updatedIssues = issues.map(issue => {
          if (issue.id === assignData.issueId) {
            return { 
              ...issue, 
              assigned_to: assignData.userId,
              status: 'InProgress'
            };
          }
          return issue;
        });
        
        setIssues(updatedIssues);
        setUpdateSuccess('Issue assigned successfully!');
        setTimeout(() => setUpdateSuccess(''), 3000);
        handleCloseAssignModal();
      }
    } catch (error) {
      console.error('Error assigning issue:', error);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/api/issues/${issueId}/update_status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update the issue in the local state
        const updatedIssues = issues.map(issue => {
          if (issue.id === issueId) {
            return { ...issue, status: newStatus };
          }
          return issue;
        });
        
        setIssues(updatedIssues);
        setUpdateSuccess('Status updated successfully!');
        setTimeout(() => setUpdateSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  const filteredIssues = statusFilter === 'all' 
    ? issues 
    : issues.filter(issue => issue.status === statusFilter);

  return (
    <div>
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Total Issues</h2>
          <p className="card-value">{issues.length}</p>
        </div>
        <div className="card">
          <h2 className="card-title">Pending Issues</h2>
          <p className="card-value">
            {issues.filter(issue => issue.status === 'Pending').length}
          </p>
        </div>
        <div className="card">
          <h2 className="card-title">Resolved Issues</h2>
          <p className="card-value">
            {issues.filter(issue => issue.status === 'Solved').length}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Issue Management</h2>
          <div className="d-flex">
            <select 
              className="form-select me-2" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Issues</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Solved">Resolved</option>
            </select>
          </div>
        </div>

        {updateSuccess && (
          <div className="alert alert-success">{updateSuccess}</div>
        )}

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Student</th>
              <th>Course</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.id} style={{ cursor: 'pointer' }} onClick={() => viewIssueDetails(issue)}>
                <td>{issue.id}</td>
                <td>{issue.title}</td>
                <td>{issue.student?.email || "N/A"}</td>
                <td>{issue.course?.course_name || "N/A"}</td>
                <td>{issue.issue_type}</td>
                <td>
                  <span className={`badge bg-${
                    issue.status === 'Pending' ? 'warning' :
                    issue.status === 'InProgress' ? 'primary' : 'success'
                  }`}>
                    {issue.status}
                  </span>
                </td>
                <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="info" 
                    size="sm" 
                    className="me-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewIssueDetails(issue);
                    }}
                  >
                    View Details
                  </Button>
                  {issue.status !== 'Solved' && (
                    <>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="me-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAssignModal(issue);
                        }}
                      >
                        Assign
                      </Button>
                      {issue.status !== 'Solved' && (
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIssueStatus(issue.id, 'Solved');
                          }}
                        >
                          Mark Solved
                        </Button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        {/* Assign Issue Modal */}
        <Modal show={assignModalOpen} onHide={handleCloseAssignModal}>
          <Modal.Header closeButton>
            <Modal.Title>Assign Issue</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAssignSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Select Lecturer or HOD</Form.Label>
                <Form.Select 
                  name="userId"
                  value={assignData.userId}
                  onChange={handleAssignChange}
                  required
                >
                  <option value="">Select staff member</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.first_name} {lecturer.last_name} ({lecturer.role})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={handleCloseAssignModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Assign
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Issue Details Modal */}
        <Modal 
          show={detailsModalOpen} 
          onHide={closeDetailsModal}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Issue Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedIssue && (
              <div>
                <h3 className="mb-3">{selectedIssue.title}</h3>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h5>Basic Information</h5>
                    <Table bordered>
                      <tbody>
                        <tr>
                          <th>Issue ID</th>
                          <td>{selectedIssue.id}</td>
                        </tr>
                        <tr>
                          <th>Status</th>
                          <td>
                            <span className={`badge bg-${
                              selectedIssue.status === 'Pending' ? 'warning' :
                              selectedIssue.status === 'InProgress' ? 'primary' : 'success'
                            }`}>
                              {selectedIssue.status}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <th>Type</th>
                          <td>{selectedIssue.issue_type}</td>
                        </tr>
                        <tr>
                          <th>Date Created</th>
                          <td>{new Date(selectedIssue.created_at).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <th>Last Updated</th>
                          <td>{new Date(selectedIssue.updated_at).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>

                  <div className="col-md-6">
                    <h5>People</h5>
                    <Table bordered>
                      <tbody>
                        <tr>
                          <th>Student</th>
                          <td>
                            {selectedIssue.student ? (
                              <div>
                                <div>{selectedIssue.student.first_name} {selectedIssue.student.last_name}</div>
                                <small>{selectedIssue.student.email}</small>
                              </div>
                            ) : 'N/A'}
                          </td>
                        </tr>
                        <tr>
                          <th>Assigned To</th>
                          <td>
                            {selectedIssue.assigned_to ? (
                              <div>
                                <div>{selectedIssue.assigned_to.first_name} {selectedIssue.assigned_to.last_name}</div>
                                <small>{selectedIssue.assigned_to.email}</small>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => {
                                  closeDetailsModal();
                                  handleOpenAssignModal(selectedIssue);
                                }}
                              >
                                Assign Now
                              </Button>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th>Course</th>
                          <td>
                            {selectedIssue.course ? (
                              <div>
                                <div>{selectedIssue.course.course_name}</div>
                                <small>Code: {selectedIssue.course.course_code}</small>
                              </div>
                            ) : 'N/A'}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>

                <h5>Description</h5>
                <div className="p-3 border rounded mb-3">
                  {selectedIssue.description}
                </div>

                <div className="d-flex justify-content-between">
                  <div>
                    <Button 
                      variant="primary" 
                      className="me-2"
                      onClick={() => {
                        closeDetailsModal();
                        handleOpenAssignModal(selectedIssue);
                      }}
                    >
                      Assign Issue
                    </Button>
                  </div>
                  <div>
                    {selectedIssue.status !== 'Solved' && (
                      <Button 
                        variant="success" 
                        onClick={() => {
                          updateIssueStatus(selectedIssue.id, 'Solved');
                          closeDetailsModal();
                        }}
                      >
                        Mark as Solved
                      </Button>
                    )}
                    {selectedIssue.status === 'Solved' && (
                      <Button 
                        variant="warning" 
                        onClick={() => {
                          updateIssueStatus(selectedIssue.id, 'InProgress');
                          closeDetailsModal();
                        }}
                      >
                        Reopen Issue
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

const SettingsContent = () => (
  <div className="card">
    <h2 className="card-title">Settings</h2>
    <p>Settings content goes here.</p>
  </div>
);

export default Admin;
