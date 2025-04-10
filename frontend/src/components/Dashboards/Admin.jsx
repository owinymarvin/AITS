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
  FaExclamationTriangle,
  FaUserTie,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield,
  FaUniversity,
  FaPencilAlt,
  FaCalendarAlt,
  FaTasks,
  FaCheckCircle,
  FaInfoCircle,
  FaSchool,
  FaClock,
  FaSearch,
  FaTag,
  FaExclamationCircle,
  FaCog,
  FaEye,
  FaUserPlus,
  FaFileAlt,
  FaRedo
} from "react-icons/fa";
import { BsPersonBadge, BsCheck2Circle, BsClockHistory, BsListTask, BsPersonCheck } from 'react-icons/bs';
import { Table, Modal, Form, Button } from "react-bootstrap";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Badge from "@mui/material/Badge";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Colleges from "./Colleges";
import Departments from "./Departments";
import Courses from "./Courses";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import "./admin.css"; // Import the CSS file

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Admin = ({ user }) => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState([]);
  const [dept, setDept] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New staff member registered", read: false },
    { id: 2, message: "New issue reported by a student", read: false },
  ]);

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user) return "A";
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "A";
  };

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

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget); // Toggle popper
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;
  const open = Boolean(anchorEl);
  const id = open ? "notification-popper" : undefined;

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
          <div className="sidebar-divider"></div>
          <div className="nav-item logout" onClick={handleLogout}>
            <span className="nav-icon"><FaExclamationTriangle /></span>
            <span>Logout</span>
          </div>
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
            {/* User Avatar */}
            <div className="user-avatar" title={user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || "User"}>
              {getUserInitials()}
            </div>

            {/* Notification Button with Badge */}
            <button className="notification-btn" onClick={handleClick}>
              <Badge badgeContent={unreadCount} color="error">
                <FaBell size={20} />
              </Badge>
            </button>
            
            {/* MUI Popper for Notifications */}
            <Popper
              id={id}
              open={open}
              anchorEl={anchorEl}
              placement="bottom-end"
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Paper sx={{ p: 2, width: 250, boxShadow: 3 }}>
                  <Typography variant="h6">Notifications</Typography>
                  <List>
                    {notifications.length > 0 ? (
                      notifications.map((notif, index) => (
                        <React.Fragment key={notif.id}>
                          <ListItem disablePadding>
                            {notif.read ? (
                              <ListItemButton disabled>
                                <ListItemText 
                                  primary={notif.message} 
                                  sx={{ color: 'text.secondary' }}
                                />
                              </ListItemButton>
                            ) : (
                              <ListItemButton
                                onClick={() => handleNotificationClick(notif.id)}
                              >
                                <ListItemText primary={notif.message} />
                              </ListItemButton>
                            )}
                          </ListItem>
                          {index < notifications.length - 1 && <Divider />}
                        </React.Fragment>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ textAlign: "center", mt: 2 }}
                      >
                        ✅ No new notifications
                      </Typography>
                    )}
                  </List>
                </Paper>
              </ClickAwayListener>
            </Popper>
          </div>
        </header>
        <h2 className="welcome">
          {greeting}, {user?.title || ''} {user?.first_name || ''} {user?.last_name || ''}
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

  // Data for the pie chart
  const issueStatusChartData = {
    labels: ['Solved', 'In Progress', 'Pending'],
    datasets: [
      {
        data: [resolvedIssues, inProgressIssues, pendingIssues],
        backgroundColor: ['#28a745', '#17a2b8', '#ffc107'],
        borderWidth: 0,
      },
    ],
  };

  // Data for the user distribution pie chart
  const userDistributionChartData = {
    labels: ['Students', 'Lecturers', 'HODs', 'Admins'],
    datasets: [
      {
        data: [studentCount, lecturerCount, hodCount, adminCount],
        backgroundColor: ['#4e73df', '#36b9cc', '#f6c23e', '#e74a3b'],
        borderWidth: 0,
      },
    ],
  };

  // Data for the issue type pie chart
  const issueTypeChartData = {
    labels: ['Missing Marks', 'Appeals', 'Corrections'],
    datasets: [
      {
        data: [missingMarksCount, appealsCount, correctionsCount],
        backgroundColor: ['#e74a3b', '#4e73df', '#858796'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
    },
  };

  return (
  <div>
      <h2 className="section-title">System Overview</h2>
      
    <div className="dashboard-grid">
        <div className="card dashboard-card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-primary">
                <FaUsers />
              </div>
              <div className="ms-3">
                <h6 className="card-subtitle text-muted">Total Users</h6>
                <h4 className="card-title mb-0">{users.length}</h4>
              </div>
            </div>
            <div className="card-footer">
              <div className="d-flex justify-content-between small-text">
                <span><FaUserGraduate className="me-1" /> Students: {studentCount}</span>
                <span><FaChalkboardTeacher className="me-1" /> Lecturers: {lecturerCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card dashboard-card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-info">
                <FaBook />
              </div>
              <div className="ms-3">
                <h6 className="card-subtitle text-muted">Total Courses</h6>
                <h4 className="card-title mb-0">{courses.length}</h4>
              </div>
            </div>
            <div className="card-footer">
              <div className="small-text">
                <span><FaUniversity className="me-1" /> Across {departments.length} departments</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card dashboard-card">
          <div className="card-body">
            <div className="d-flex align-items-center">
              <div className="icon-box bg-warning">
                <FaClipboardList />
              </div>
              <div className="ms-3">
                <h6 className="card-subtitle text-muted">Total Issues</h6>
                <h4 className="card-title mb-0">{issues.length}</h4>
              </div>
            </div>
            <div className="card-footer">
              <div className="d-flex justify-content-between small-text">
                <span><BsClockHistory className="me-1" /> Pending: {pendingIssues}</span>
                <span><BsCheck2Circle className="me-1" /> Resolved: {resolvedIssues}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0"><FaUsers className="me-2" />Users Distribution</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '240px' }}>
                <Pie data={userDistributionChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
      <div className="card">
            <div className="card-header">
              <h5 className="mb-0"><FaChartBar className="me-2" />Issue Status Distribution</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '240px' }}>
                <Pie data={issueStatusChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
      <div className="card">
            <div className="card-header">
              <h5 className="mb-0"><FaTasks className="me-2" />Issue Type Distribution</h5>
            </div>
            <div className="card-body">
              <div style={{ height: '240px' }}>
                <Pie data={issueTypeChartData} options={chartOptions} />
              </div>
      </div>
    </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0"><FaClock className="me-2" />Recent Issues</h5>
            </div>
            {isLoading ? (
              <div className="d-flex justify-content-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="card-body p-0">
                {recentIssues.length > 0 ? (
                  <div className="recent-issues">
                    {recentIssues.map(issue => (
                      <div key={issue.id} className="activity-item p-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{issue.title}</h6>
                            <p className="small text-muted mb-0">
                              <FaUserGraduate className="me-1" /> 
                              {issue.student?.email || "N/A"} | 
                              <FaCalendarAlt className="ms-2 me-1" /> 
                              {new Date(issue.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`badge bg-${
                            issue.status === 'Pending' ? 'warning' : 
                            issue.status === 'InProgress' ? 'info' : 'success'
                          }`}>{issue.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4">No recent issues found.</p>
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
  const [departments, setDepartments] = useState([]);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "STUDENT",
    college_code: "",
    department_code: ""
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch colleges and departments in parallel
        const [collegesData, departmentsData] = await Promise.all([
          getColleges(),
          getDepartments()
        ]);
        setColleges(collegesData);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error loading data:", error);
        setFormError("Failed to load colleges and departments. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    if (showAddUserForm) {
      fetchData();
    }
  }, [showAddUserForm]);

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
        department_code: ""
      });
      // Refresh user list
      window.location.reload();
    } catch (error) {
      setFormError(
        error.response?.data?.details?.email?.[0] || 
        error.response?.data?.department_code || 
        error.response?.data?.detail ||
        "Error creating user. Please try again."
      );
    }
  };

  return (
  <div>
    <div className="dashboard-grid">
      <div className="card dashboard-card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="icon-box bg-danger">
              <FaUserShield />
            </div>
            <div className="ms-3">
              <h6 className="card-subtitle text-muted">Total Admins</h6>
              <h4 className="card-title mb-0">{users.filter(u => u.role === "ADMIN").length}</h4>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card dashboard-card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="icon-box bg-info">
              <FaChalkboardTeacher />
            </div>
            <div className="ms-3">
              <h6 className="card-subtitle text-muted">Total Lecturers</h6>
              <h4 className="card-title mb-0">{users.filter(u => u.role === "LECTURER").length}</h4>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card dashboard-card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="icon-box bg-primary">
              <FaUserGraduate />
            </div>
            <div className="ms-3">
              <h6 className="card-subtitle text-muted">Total Students</h6>
              <h4 className="card-title mb-0">{users.filter(u => u.role === "STUDENT").length}</h4>
            </div>
          </div>
        </div>
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
              
              {isLoading ? (
                <div className="mb-3">
                  <div className="alert alert-info">
                    Loading colleges and departments...
                  </div>
                </div>
              ) : (
                <>
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
                      {colleges && colleges.length > 0 ? colleges.map((college) => (
                        <option key={college.id || college.code} value={college.code}>
                          {college.name}
                        </option>
                      )) : (
                        <option value="" disabled>No colleges available</option>
                      )}
                    </select>
                    {colleges.length === 0 && (
                      <small className="text-danger">
                        No colleges available. Please add a college first.
                      </small>
                    )}
                  </div>
                  
                  {newUser.role === "HOD" && (
                    <div className="mb-3">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        name="department_code"
                        value={newUser.department_code}
                        onChange={handleInputChange}
                        required={newUser.role === "HOD"}
                      >
                        <option value="">Select Department</option>
                        {departments && departments.length > 0 ? departments.map((department) => (
                          <option key={department.id} value={department.department_code}>
                            {department.department_name}
                          </option>
                        )) : (
                          <option value="" disabled>No departments available</option>
                        )}
                      </select>
                      {departments.length === 0 && (
                        <small className="text-danger">
                          No departments available. Please add a department first.
                        </small>
                      )}
                    </div>
                  )}
                </>
              )}
              
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={isLoading || 
                  (newUser.role === "STUDENT" && colleges.length === 0) ||
                  (newUser.role === "HOD" && departments.length === 0)
                }
              >
                {isLoading ? "Loading..." : "Create User"}
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
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
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

  // Extract unique issue types for the filter
  const issueTypes = ['all', ...new Set(issues.map(issue => issue.issue_type))].filter(Boolean);

  // Filter issues based on status, type, and search term
  const filteredIssues = issues.filter(issue => {
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesType = typeFilter === 'all' || issue.issue_type === typeFilter;
    const matchesSearch = 
      searchTerm === '' || 
      issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.course?.course_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  return (
  <div>
    <div className="dashboard-grid">
      <div className="card dashboard-card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="icon-box bg-primary">
              <FaClipboardList />
            </div>
            <div className="ms-3">
              <h6 className="card-subtitle text-muted">Total Issues</h6>
              <h4 className="card-title mb-0">{issues.length}</h4>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card dashboard-card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="icon-box bg-warning">
              <BsClockHistory />
            </div>
            <div className="ms-3">
              <h6 className="card-subtitle text-muted">Pending Issues</h6>
              <h4 className="card-title mb-0">{issues.filter(issue => issue.status === 'Pending').length}</h4>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card dashboard-card">
        <div className="card-body">
          <div className="d-flex align-items-center">
            <div className="icon-box bg-success">
              <BsCheck2Circle />
            </div>
            <div className="ms-3">
              <h6 className="card-subtitle text-muted">Resolved Issues</h6>
              <h4 className="card-title mb-0">{issues.filter(issue => issue.status === 'Solved').length}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0"><FaClipboardList className="me-2" /> Issue Management</h5>
      </div>
        
      <div className="card-body">
        {updateSuccess && (
          <div className="alert alert-success">{updateSuccess}</div>
        )}
        
        <div className="row mb-3">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search issues..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Solved">Resolved</option>
            </select>
          </div>
          <div className="col-md-3">
            <select 
              className="form-select" 
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {issueTypes.filter(type => type !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <span className="badge bg-info p-2 w-100 d-flex align-items-center justify-content-center">
              {filteredIssues.length} Issues
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="d-flex justify-content-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="alert alert-info">
            No issues found matching your filters.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="issue-table border-top">
              <thead className="bg-light">
                <tr>
                  <th><FaInfoCircle className="me-1" /> ID</th>
                  <th><FaPencilAlt className="me-1" /> Title</th>
                  <th><FaUserGraduate className="me-1" /> Student</th>
                  <th><FaBook className="me-1" /> Course</th>
                  <th><FaTag className="me-1" /> Type</th>
                  <th><FaExclamationCircle className="me-1" /> Status</th>
                  <th><FaCalendarAlt className="me-1" /> Date</th>
                  <th><FaCog className="me-1" /> Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue.id} className="issue-row" onClick={() => viewIssueDetails(issue)}>
                    <td>#{issue.id}</td>
                    <td className="text-truncate" style={{maxWidth: "200px"}}>{issue.title}</td>
                    <td className="text-truncate" style={{maxWidth: "150px"}}>
                      {issue.student?.email || "N/A"}
                    </td>
                    <td className="text-truncate" style={{maxWidth: "150px"}}>
                      {issue.course?.course_name || "N/A"}
                    </td>
                    <td>
                      <span className="badge bg-secondary">{issue.issue_type}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        issue.status === 'Pending' ? 'bg-warning' :
                        issue.status === 'InProgress' ? 'bg-primary' : 'bg-success'
                      }`}>
                        {issue.status}
                      </span>
                    </td>
                    <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="d-flex">
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          className="me-1"
                          title="View Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewIssueDetails(issue);
                          }}
                        >
                          <FaEye />
                        </Button>
                        {issue.status !== 'Solved' && (
                          <>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="me-1"
                              title="Assign to Staff"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAssignModal(issue);
                              }}
                            >
                              <FaUserPlus />
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              title="Mark as Solved"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateIssueStatus(issue.id, 'Solved');
                              }}
                            >
                              <FaCheckCircle />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* Assign Issue Modal */}
      <Modal show={assignModalOpen} onHide={handleCloseAssignModal}>
        <Modal.Header closeButton>
          <Modal.Title><FaUserPlus className="me-2" /> Assign Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAssignSubmit}>
            <Form.Group className="mb-3">
              <Form.Label><FaChalkboardTeacher className="me-1" /> Select Lecturer or HOD</Form.Label>
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
                <FaUserPlus className="me-1" /> Assign
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
        <Modal.Header closeButton className="bg-light">
          <Modal.Title><FaClipboardList className="me-2" /> Issue Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedIssue && (
            <div>
              <h3 className="mb-3">{selectedIssue.title}</h3>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h5 className="mb-0"><FaInfoCircle className="me-2" /> Basic Information</h5>
                    </div>
                    <div className="card-body p-0">
                      <Table bordered className="mb-0">
                        <tbody>
                          <tr>
                            <th className="bg-light">Issue ID</th>
                            <td>#{selectedIssue.id}</td>
                          </tr>
                          <tr>
                            <th className="bg-light">Status</th>
                            <td>
                              <span className={`badge ${
                                selectedIssue.status === 'Pending' ? 'bg-warning' :
                                selectedIssue.status === 'InProgress' ? 'bg-primary' : 'bg-success'
                              }`}>
                                {selectedIssue.status}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-light">Type</th>
                            <td>{selectedIssue.issue_type}</td>
                          </tr>
                          <tr>
                            <th className="bg-light">Date Created</th>
                            <td>{new Date(selectedIssue.created_at).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <th className="bg-light">Last Updated</th>
                            <td>{new Date(selectedIssue.updated_at).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h5 className="mb-0"><FaUsers className="me-2" /> People</h5>
                    </div>
                    <div className="card-body p-0">
                      <Table bordered className="mb-0">
                        <tbody>
                          <tr>
                            <th className="bg-light">Student</th>
                            <td>
                              {selectedIssue.student ? (
                                <div>
                                  <div>{selectedIssue.student.first_name} {selectedIssue.student.last_name}</div>
                                  <small className="text-muted">{selectedIssue.student.email}</small>
                                </div>
                              ) : 'N/A'}
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-light">Assigned To</th>
                            <td>
                              {selectedIssue.assigned_to ? (
                                <div>
                                  <div>{selectedIssue.assigned_to.first_name} {selectedIssue.assigned_to.last_name}</div>
                                  <small className="text-muted">{selectedIssue.assigned_to.email}</small>
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
                                  <FaUserPlus className="me-1" /> Assign Now
                                </Button>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-light">Course</th>
                            <td>
                              {selectedIssue.course ? (
                                <div>
                                  <div>{selectedIssue.course.course_name}</div>
                                  <small className="text-muted">Code: {selectedIssue.course.course_code}</small>
                                </div>
                              ) : 'N/A'}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header bg-light">
                  <h5 className="mb-0"><FaFileAlt className="me-2" /> Description</h5>
                </div>
                <div className="card-body">
                  {selectedIssue.description || "No description provided."}
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <div>
                  {!selectedIssue.assigned_to && (
                    <Button 
                      variant="primary" 
                      className="me-2"
                      onClick={() => {
                        closeDetailsModal();
                        handleOpenAssignModal(selectedIssue);
                      }}
                    >
                      <FaUserPlus className="me-1" /> Assign Issue
                    </Button>
                  )}
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
                      <FaCheckCircle className="me-1" /> Mark as Solved
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
                      <FaRedo className="me-1" /> Reopen Issue
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
    <div className="card-header">
      <h5 className="mb-0"><FaTools className="me-2" />Settings</h5>
    </div>
    <div className="card-body">
    <p>Settings content goes here.</p>
    </div>
  </div>
);

export default Admin;
