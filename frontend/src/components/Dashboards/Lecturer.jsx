import React, { useState, useEffect } from "react";
import { logout, getLecturers } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaTable,
  FaClipboardList,
  FaTools,
  FaBell,
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
import { Table } from "react-bootstrap";
import "./admin.css";

const Lecturer = ({ user }) => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");

  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    const res = await axios.get("http://localhost:8000/api/notifications/");
    setNotifications(res.data);
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
    const fetchUsers = async () => {
      const data = await getLecturers();
      setUsers(data);
      console.log(data);
    };
    fetchUsers();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  // Menu items for the sidebar
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaTable /> },
    { id: "users", label: "Users", icon: <FaUsers /> },
    { id: "issues", label: "Issues", icon: <FaClipboardList /> },
    { id: "settings", label: "Settings", icon: <FaTools /> },
  ];

  // Function to render the active content based on menu selection
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent />;
      case "users":
        return <UsersContent users={users} />;
      case "issues":
        return <Issues />;
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
            <button className="notification-btn" onClick={handleClick}>
              <Badge
                badgeContent={notifications.filter((n) => !n.is_read).length}
                color="error"
              >
                <FaBell />
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
                              <ReadNotification>
                                <ListItemText primary={notif.message} />
                              </ReadNotification>
                            ) : (
                              <ListItemButton
                              // onClick={() =>
                              //   handleNotificationClick(notif.id)
                              // }
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
          {greeting}, {user.first_name} {user.last_name}
        </h2>
        <main className="content">{renderContent()}</main>
      </div>
    </div>
  );
};

// Placeholder content components
const DashboardContent = () => (
  <div>
    <div className="dashboard-grid">
      <div className="card">
        <h2 className="card-title">Total Users</h2>
        <p className="card-value">1,234</p>
      </div>
      <div className="card">
        <h2 className="card-title">Total Course Units</h2>
        <p className="card-value">567</p>
      </div>
      <div className="card">
        <h2 className="card-title">Total Issues</h2>
        <p className="card-value">892</p>
      </div>
    </div>
    <div className="card">
      <h2 className="card-title">Recent Activity</h2>
      <div>
        <div className="activity-item">
          <p className="activity-text">User John Doe placed an order</p>
          <p className="activity-time">2 hours ago</p>
        </div>
        <div className="activity-item">
          <p className="activity-text">
            New product added: Wireless Headphones
          </p>
          <p className="activity-time">5 hours ago</p>
        </div>
        <div className="activity-item">
          <p className="activity-text">User Jane Smith updated their profile</p>
          <p className="activity-time">Yesterday</p>
        </div>
      </div>
    </div>
  </div>
);

const UsersContent = ({ users }) => (
  <div>
    <div className="dashboard-grid">
      <div className="card">
        <h2 className="card-title">Total Lecturers</h2>
        <p className="card-value">134</p>
      </div>
      <div className="card">
        <h2 className="card-title">Total Lecturers</h2>
        <p className="card-value">96</p>
      </div>
      <div className="card">
        <h2 className="card-title">Total Students</h2>
        <p className="card-value">2,892</p>
      </div>
    </div>
    <div className="card">
      <h2>List of users</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </div>
);

const Issues = () => (
  <div>
    <div className="dashboard-grid">
      <div className="card">
        <h2 className="card-title">Total Issues</h2>
        <p className="card-value">1,234</p>
      </div>
      <div className="card">
        <h2 className="card-title">Resolved Issues</h2>
        <p className="card-value">567</p>
      </div>
      <div className="card">
        <h2 className="card-title">Pending Issues</h2>
        <p className="card-value">892</p>
      </div>
    </div>
    <div className="card">
      <h2 className="card-title">Issues Management</h2>
      <p>Issues details goes here.</p>
    </div>
  </div>
);

const SettingsContent = () => (
  <div className="card">
    <h2 className="card-title">Settings</h2>
    <p>Settings content goes here.</p>
  </div>
);

export default Lecturer;
