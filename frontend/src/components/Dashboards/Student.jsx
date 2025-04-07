import React, { useState, useEffect } from "react";
import { getStudentDashboard, logout } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  FaTable,
  FaGraduationCap,
  FaComments,
  FaClipboardList,
  FaTools,
  FaBell,
} from "react-icons/fa";
import StudentsIssues from "../Issues/StudentsIssues";
import "./admin.css";
import DashboardContent from "../Issues/DashboardContent";
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
import { styled } from "@mui/material/styles";

const ReadNotification = styled(ListItemButton)({
  backgroundColor: "#f0f0f0", // Light gray background
  color: "#6b6b6b", // Dimmed text color
  pointerEvents: "none", // Prevent clicking on already read messages
});

const Student = ({ user }) => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState([]);
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New course update available", read: false },
    { id: 2, message: "Assignment deadline extended", read: false },
  ]);

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
        const data = await getStudentDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  // Menu items for the sidebar
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <FaTable /> },
    { id: "courses", label: "Courses", icon: <FaGraduationCap /> },
    { id: "updates", label: "Updates", icon: <FaComments /> },
    { id: "issues", label: "Issues", icon: <FaClipboardList /> },
    { id: "settings", label: "Settings", icon: <FaTools /> },
  ];

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

  // Function to render the active content based on menu selection
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <DashboardContent />;
      case "courses":
        return <Courses dashboardData={dashboardData} />;
      case "updates":
        return <Updates />;
      case "issues":
        return <StudentsIssues />;
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
        <div className="sidebar-header">Student Dashboard</div>
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
                {user.last_name || user.username}
              </span>
              <button className="log_out" onClick={handleLogout}>
                Logout
              </button>
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
                              <ReadNotification>
                                <ListItemText primary={notif.message} />
                              </ReadNotification>
                            ) : (
                              <ListItemButton
                                onClick={() =>
                                  handleNotificationClick(notif.id)
                                }
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
          {greeting}, {user.last_name} {user.first_name}
        </h2>
        <main className="content">{renderContent()}</main>
      </div>
    </div>
  );
};

const Updates = () => (
  <div>
    <div className="card">
      <h2 className="card-title">Course Work Results</h2>
      <p>Semester's course work result goes here.</p>
    </div>
    <div className="card">
      <h2 className="card-title">Semester Announcement</h2>
      <p>Announcement goes here.</p>
    </div>
    <div className="card">
      <h2 className="card-title">Upcoming Deadlines</h2>
      <p>Deadlines to met goes here.</p>
    </div>
  </div>
);

const Courses = ({ dashboardData = [] }) => (
  <div>
    <div className="card">
      <h2 className="card-title"> Semester's Course Unit</h2>
      <div>
        {dashboardData.length > 0 ? (
          dashboardData.map((item) => (
            <div key={item.id} className="course-unit">
              <h3>{item.title}</h3>
              <p>{item.grade}</p>
            </div>
          ))
        ) : (
          <p>No courses available.</p> // ✅ Prevents the app from crashing
        )}
      </div>
    </div>
  </div>
);

// const IssuesContent = () => (
//   <div className="card">
//     <h2 className="card-title">Issues Management</h2>
//     <p>Issue content goes here.</p>
//   </div>
// );

const SettingsContent = () => (
  <div className="card">
    <h2 className="card-title">Settings</h2>
    <p>Settings content goes here.</p>
  </div>
);

export default Student;
