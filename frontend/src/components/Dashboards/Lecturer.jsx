import React, { useState, useEffect } from "react";
import { logout, getIssues, getCourses } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaTable,
  FaClipboardList,
  FaTools,
  FaBell,
  FaBook,
  FaExclamationTriangle
} from "react-icons/fa";
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
import axios from "axios";
import { Table, Modal, Button, Form, Badge as BootstrapBadge } from "react-bootstrap";
import "./admin.css";

const Lecturer = ({ user }) => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/notifications/");
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user) return "L";
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`;
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return "L";
  };

  const handleClick = (event) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const id = open ? "notification-popper" : undefined;

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

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 16) return "Good afternoon";
      return "Good evening";
    };

    setGreeting(getGreeting());
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  // Menu items for the sidebar - simplified for lecturer
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaTable /> },
    { id: "courses", label: "My Courses", icon: <FaBook /> },
    { id: "issues", label: "Assigned Issues", icon: <FaClipboardList /> },
    { id: "settings", label: "Settings", icon: <FaTools /> },
  ];

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  // Function to render the active content based on menu selection
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent user={user} />;
      case "courses":
        return <CoursesContent user={user} />;
      case "issues":
        return <Issues user={user} />;
      case "settings":
        return <SettingsContent user={user} />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">Lecturer's Dashboard</div>
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

// Dashboard content specific to lecturer
const DashboardContent = ({ user }) => {
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    inProgressIssues: 0
  });
  
  useEffect(() => {
    const fetchAssignedIssues = async () => {
      setIsLoading(true);
      try {
        const allIssues = await getIssues();
        console.log("All issues:", allIssues);
        console.log("Current user:", user);
        
        // Try a direct API call to get lecturer-specific issues
        try {
          // This could be implemented on the backend for better performance
          const lecturerIssuesResponse = await fetch(`http://localhost:8000/api/issues/?assigned_to=${user.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          });
          
          if (lecturerIssuesResponse.ok) {
            const lecturerIssuesData = await lecturerIssuesResponse.json();
            console.log("Direct API call for lecturer issues:", lecturerIssuesData);
            if (Array.isArray(lecturerIssuesData) && lecturerIssuesData.length > 0) {
              setAssignedIssues(lecturerIssuesData);
              
              // Calculate statistics
              setStats({
                totalAssigned: lecturerIssuesData.length,
                pendingIssues: lecturerIssuesData.filter(issue => issue.status === 'Pending').length,
                inProgressIssues: lecturerIssuesData.filter(issue => issue.status === 'InProgress').length,
                resolvedIssues: lecturerIssuesData.filter(issue => issue.status === 'Solved').length
              });
              
              setIsLoading(false);
              return; // Skip the filtering below if we got data from the API
            }
          }
        } catch (directApiError) {
          console.log("Direct API call failed, falling back to client-side filtering:", directApiError);
        }
        
        // Filter issues assigned to this lecturer - handle different possible response formats
        const lecturerIssues = allIssues.filter(issue => {
          // Check the assigned_to field structure and handle different formats
          if (!issue.assigned_to) return false;
          
          // For debugging - log the structure of assigned_to
          console.log("Issue ID:", issue.id, "assigned_to:", JSON.stringify(issue.assigned_to));
          
          // If assigned_to is an object with id
          if (typeof issue.assigned_to === 'object' && issue.assigned_to.id) {
            return issue.assigned_to.id.toString() === user.id.toString();
          }
          
          // If assigned_to is just the ID itself
          if (typeof issue.assigned_to === 'number' || typeof issue.assigned_to === 'string') {
            return issue.assigned_to.toString() === user.id.toString();
          }
          
          return false;
        });
        
        console.log("Filtered lecturer issues:", lecturerIssues);
        setAssignedIssues(lecturerIssues);
        
        // Calculate statistics
        setStats({
          totalAssigned: lecturerIssues.length,
          pendingIssues: lecturerIssues.filter(issue => issue.status === 'Pending').length,
          inProgressIssues: lecturerIssues.filter(issue => issue.status === 'InProgress').length,
          resolvedIssues: lecturerIssues.filter(issue => issue.status === 'Solved').length
        });
      } catch (error) {
        console.error("Error fetching assigned issues:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssignedIssues();
  }, [user.id]);
  
  // Get recent issues (last 5)
  const recentIssues = [...assignedIssues]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  
  return (
    <div>
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">My Assigned Issues</h2>
          <p className="card-value">{stats.totalAssigned}</p>
        </div>
        <div className="card">
          <h2 className="card-title">In Progress</h2>
          <p className="card-value">{stats.inProgressIssues}</p>
        </div>
        <div className="card">
          <h2 className="card-title">Resolved Issues</h2>
          <p className="card-value">{stats.resolvedIssues}</p>
        </div>
      </div>
      
      <div className="card">
        <h2 className="card-title">Recent Assigned Issues</h2>
        {isLoading ? (
          <p>Loading your assigned issues...</p>
        ) : recentIssues.length > 0 ? (
          <div>
            {recentIssues.map(issue => (
              <div className="activity-item" key={issue.id}>
                <div className="d-flex justify-content-between">
                  <p className="activity-text">
                    <strong>{issue.title}</strong>
                    <span className={`ms-2 badge bg-${
                      issue.status === 'Pending' ? 'warning' :
                      issue.status === 'InProgress' ? 'primary' : 'success'
                    }`}>
                      {issue.status}
                    </span>
                  </p>
                  <p className="activity-time">{new Date(issue.created_at).toLocaleDateString()}</p>
                </div>
                <p className="small text-muted">{issue.issue_type} - {issue.course?.course_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p>No issues have been assigned to you yet.</p>
            <div className="alert alert-info">
              <strong>Note:</strong> Issues will appear here when an administrator assigns them to you.
              <br />
              <small>If you believe this is an error, please check with your administrator.</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Courses content
const CoursesContent = ({ user }) => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would have an API to get courses assigned to this lecturer
        // For now, we'll just get all courses as a placeholder
        const allCourses = await getCourses();
        setCourses(allCourses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, [user.id]);
  
  return (
    <div>
      <div className="card">
        <h2 className="card-title">My Courses</h2>
        {isLoading ? (
          <p>Loading your courses...</p>
        ) : courses.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Department</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.course_code}</td>
                  <td>{course.course_name}</td>
                  <td>{course.department?.department_name}</td>
                  <td>{course.details}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No courses have been assigned to you yet.</p>
        )}
      </div>
    </div>
  );
};

// Issues component specifically for assigned issues
const Issues = ({ user }) => {
  const [assignedIssues, setAssignedIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  useEffect(() => {
    const fetchAssignedIssues = async () => {
      setIsLoading(true);
      try {
        const allIssues = await getIssues();
        console.log("All issues:", allIssues);
        console.log("Current user:", user);
        
        // Try a direct API call to get lecturer-specific issues
        try {
          // This could be implemented on the backend for better performance
          const lecturerIssuesResponse = await fetch(`http://localhost:8000/api/issues/?assigned_to=${user.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          });
          
          if (lecturerIssuesResponse.ok) {
            const lecturerIssuesData = await lecturerIssuesResponse.json();
            console.log("Direct API call for lecturer issues:", lecturerIssuesData);
            if (Array.isArray(lecturerIssuesData) && lecturerIssuesData.length > 0) {
              setAssignedIssues(lecturerIssuesData);
              return; // Skip the filtering below if we got data from the API
            }
          }
        } catch (directApiError) {
          console.log("Direct API call failed, falling back to client-side filtering:", directApiError);
        }
        
        // Filter issues assigned to this lecturer - handle different possible response formats
        const lecturerIssues = allIssues.filter(issue => {
          // Check the assigned_to field structure and handle different formats
          if (!issue.assigned_to) return false;
          
          // If assigned_to is an object with id
          if (typeof issue.assigned_to === 'object' && issue.assigned_to.id) {
            return issue.assigned_to.id === user.id;
          }
          
          // If assigned_to is just the ID itself
          if (typeof issue.assigned_to === 'number' || typeof issue.assigned_to === 'string') {
            return issue.assigned_to.toString() === user.id.toString();
          }
          
          return false;
        });
        
        console.log("Filtered lecturer issues:", lecturerIssues);
        setAssignedIssues(lecturerIssues);
      } catch (error) {
        console.error("Error fetching assigned issues:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssignedIssues();
  }, [user.id]);
  
  const handleViewDetails = (issue) => {
    setSelectedIssue(issue);
    setShowDetailsModal(true);
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
        const updatedIssues = assignedIssues.map(issue => {
          if (issue.id === issueId) {
            return { ...issue, status: newStatus };
          }
          return issue;
        });
        
        setAssignedIssues(updatedIssues);
        setUpdateSuccess('Status updated successfully!');
        setTimeout(() => setUpdateSuccess(''), 3000);
        
        // If in detail view, update the selected issue
        if (selectedIssue && selectedIssue.id === issueId) {
          setSelectedIssue({...selectedIssue, status: newStatus});
        }
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };
  
  // Filter issues based on status
  const filteredIssues = statusFilter === 'all' 
    ? assignedIssues 
    : assignedIssues.filter(issue => issue.status === statusFilter);
  
  return (
    <div>
      <div className="dashboard-grid">
        <div className="card">
          <h2 className="card-title">Total Assigned</h2>
          <p className="card-value">{assignedIssues.length}</p>
        </div>
        <div className="card">
          <h2 className="card-title">In Progress</h2>
          <p className="card-value">
            {assignedIssues.filter(issue => issue.status === 'InProgress').length}
          </p>
        </div>
        <div className="card">
          <h2 className="card-title">Resolved</h2>
          <p className="card-value">
            {assignedIssues.filter(issue => issue.status === 'Solved').length}
          </p>
        </div>
      </div>
      
      <div className="card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>My Assigned Issues</h2>
          <div>
            <select 
              className="form-select" 
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
        
        {isLoading ? (
          <p>Loading your assigned issues...</p>
        ) : filteredIssues.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Issue Title</th>
                <th>Student</th>
                <th>Course</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map(issue => (
                <tr key={issue.id} style={{ cursor: 'pointer' }} onClick={() => handleViewDetails(issue)}>
                  <td>{issue.title}</td>
                  <td>{issue.student?.email || "N/A"}</td>
                  <td>{issue.course?.course_name || "N/A"}</td>
                  <td>{issue.issue_type}</td>
                  <td>
                    <BootstrapBadge bg={
                      issue.status === 'Pending' ? 'warning' :
                      issue.status === 'InProgress' ? 'primary' : 'success'
                    }>
                      {issue.status}
                    </BootstrapBadge>
                  </td>
                  <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="info" 
                      size="sm" 
                      className="me-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(issue);
                      }}
                    >
                      View Details
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
                    {issue.status === 'Solved' && (
                      <Button 
                        variant="warning" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateIssueStatus(issue.id, 'InProgress');
                        }}
                      >
                        Reopen
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No issues have been assigned to you{statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}.</p>
        )}
      </div>
      
      {/* Issue Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
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
                          <BootstrapBadge bg={
                            selectedIssue.status === 'Pending' ? 'warning' :
                            selectedIssue.status === 'InProgress' ? 'primary' : 'success'
                          }>
                            {selectedIssue.status}
                          </BootstrapBadge>
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
                    </tbody>
                  </Table>
                </div>
                
                <div className="col-md-6">
                  <h5>Student Information</h5>
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
              
              <div className="d-flex justify-content-end">
                {selectedIssue.status !== 'Solved' ? (
                  <Button 
                    variant="success" 
                    onClick={() => {
                      updateIssueStatus(selectedIssue.id, 'Solved');
                      setShowDetailsModal(false);
                    }}
                  >
                    Mark as Solved
                  </Button>
                ) : (
                  <Button 
                    variant="warning" 
                    onClick={() => {
                      updateIssueStatus(selectedIssue.id, 'InProgress');
                      setShowDetailsModal(false);
                    }}
                  >
                    Reopen Issue
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

const SettingsContent = ({ user }) => (
  <div className="card">
    <h2 className="card-title">Profile Settings</h2>
    <div className="p-3">
      <Form>
        <div className="row mb-3">
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" defaultValue={user.first_name} disabled />
            </Form.Group>
          </div>
          <div className="col-md-6">
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" defaultValue={user.last_name} disabled />
            </Form.Group>
          </div>
        </div>
        
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" defaultValue={user.email} disabled />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control type="text" defaultValue={user.phone || ''} disabled />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Control type="text" defaultValue={user.role} disabled />
        </Form.Group>
        
        <div className="mt-4">
          <h4>Change Password</h4>
          <div className="border rounded p-3">
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control type="password" />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control type="password" />
            </Form.Group>
            
            <Button variant="primary">Update Password</Button>
          </div>
        </div>
      </Form>
    </div>
  </div>
);

export default Lecturer;
