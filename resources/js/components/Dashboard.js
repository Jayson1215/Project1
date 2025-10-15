// resources/js/components/Dashboard.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../../sass/dashboard.scss";
import axios from "axios";

// Material-UI Components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// Material-UI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import EventNoteIcon from "@mui/icons-material/EventNote";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";

const drawerWidth = 260;

function DashboardOverview({ user }) {
  const stats = [
    { 
      title: "Total Students", 
      subtitle: "Active enrollments",
      value: "50", 
      icon: SchoolIcon,
      color: "#2196F3", 
      change: "+12% from last month",
      bgGradient: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)"
    },
    { 
      title: "Faculty Members", 
      subtitle: "Teaching staff",
      value: "90", 
      icon: PersonIcon,
      color: "#9C27B0", 
      change: "+6% from last month",
      bgGradient: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)"
    },
    { 
      title: "Active Courses", 
      subtitle: "This semester",
      value: "5", 
      icon: AssignmentIcon,
      color: "#FF5722", 
      change: "+8% from last month",
      bgGradient: "linear-gradient(135deg, #FF5722 0%, #E64A19 100%)"
    },
    { 
      title: "Departments", 
      subtitle: "Academic divisions",
      value: "9", 
      icon: BusinessIcon,
      color: "#4CAF50", 
      change: "+0% from last month",
      bgGradient: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)"
    },
  ];

  const recentActivities = [
    { 
      initials: "JS", 
      bgColor: "#E3F2FD",
      textColor: "#1976D2",
      action: "New student enrolled", 
      details: "Jayson T. Velasco - Computer Science", 
      time: "2 hours ago" 
    },
    { 
      initials: "CS", 
      bgColor: "#FCE4EC",
      textColor: "#C2185B",
      action: "Course updated", 
      details: "Data Structures - CS101", 
      time: "4 hours ago" 
    },
    { 
      initials: "JD", 
      bgColor: "#F3E5F5",
      textColor: "#7B1FA2",
      action: "Faculty added", 
      details: "Dr. Jane Doe - Mathematics Dept", 
      time: "1 day ago" 
    },
    { 
      initials: "AY", 
      bgColor: "#FFF3E0",
      textColor: "#E65100",
      action: "Academic year created", 
      details: "2025-2026 Academic Year", 
      time: "2 days ago" 
    },
  ];

  const upcomingEvents = [
    { 
      event: "Registration Deadline", 
      date: "March 15, 2024 - 3 days left",
      status: "urgent",
      icon: EventNoteIcon 
    },
    { 
      event: "Semester Exams", 
      date: "April 15, 2024 - 18 days left",
      status: "upcoming",
      icon: AssignmentIcon 
    },
    { 
      event: "Faculty Meeting", 
      date: "March 20, 2024 - 8 days left",
      status: "scheduled",
      icon: PeopleIcon 
    },
  ];

  const systemStatusData = [
    { label: "Database Performance", value: 85, color: "#4CAF50" },
    { label: "Server Load", value: 60, color: "#FF9800" },
    { label: "Storage Usage", value: 40, color: "#2196F3" },
  ];

  const [progress, setProgress] = useState(systemStatusData.map(() => 0));

  useEffect(() => {
    const timers = systemStatusData.map((s, i) =>
      setTimeout(() => {
        setProgress((prev) => {
          const updated = [...prev];
          updated[i] = s.value;
          return updated;
        });
      }, 200 * (i + 1))
    );
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div className="dashboard-overview">
      {/* Welcome Header */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Welcome back, {user?.full_name || 'System Administrator'}! 👋</h1>
          <p>Here's what's happening in your academic portal today.</p>
        </div>
        <button className="view-reports-btn">View Reports</button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div className="stat-card" key={idx} style={{ background: stat.bgGradient }}>
              <div className="stat-icon">
                <IconComponent />
              </div>
              <div className="stat-content">
                <h2>{stat.value}</h2>
                <h3>{stat.title}</h3>
                <p>{stat.subtitle}</p>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lower Section */}
      <div className="dashboard-grid">
        {/* Recent Activities */}
        <div className="dashboard-card activities-card">
          <div className="card-header">
            <h3>Recent Activities</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity, i) => (
              <div className="activity-item" key={i}>
                <div 
                  className="activity-avatar" 
                  style={{ 
                    background: activity.bgColor,
                    color: activity.textColor 
                  }}
                >
                  {activity.initials}
                </div>
                <div className="activity-info">
                  <h4>{activity.action}</h4>
                  <p>{activity.details}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events & System Status */}
        <div className="dashboard-card events-card">
          {/* Upcoming Events */}
          <div className="card-header">
            <h3>Upcoming Events</h3>
          </div>
          <div className="events-list">
            {upcomingEvents.map((event, i) => {
              const EventIcon = event.icon;
              return (
                <div className="event-item" key={i}>
                  <div className="event-info">
                    <div className="event-icon">
                      <EventIcon />
                    </div>
                    <div>
                      <h4>{event.event}</h4>
                      <p>{event.date}</p>
                    </div>
                  </div>
                  <span className={`event-badge ${event.status}`}>
                    {event.status}
                  </span>
                </div>
              );
            })}
          </div>

          {/* System Status */}
          <div className="system-status">
            <h3>System Status</h3>
            <div className="status-list">
              {systemStatusData.map((status, i) => (
                <div className="status-item" key={i}>
                  <div className="status-info">
                    <span className="status-label">{status.label}</span>
                    <span className="status-value">{progress[i]}%</span>
                  </div>
                  <div className="status-bar">
                    <div 
                      className="status-progress" 
                      style={{ 
                        width: `${progress[i]}%`,
                        backgroundColor: status.color 
                      }}
                    />
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

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      setUser({ full_name: "User", role: "admin" });
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  // Detect current route and set active menu
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/users') {
      setActiveMenu('Users');
    } else if (path === '/dashboard') {
      setActiveMenu('Dashboard');
    }
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      localStorage.removeItem("user");
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the request fails, clear local storage and redirect
      localStorage.removeItem("user");
      window.location.href = '/login';
    }
  };

  // Handle Avatar Click
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle Settings
  const handleSettings = () => {
    handleMenuClose();
    alert("Settings feature coming soon!");
  };

  // Handle Help
  const handleHelp = () => {
    handleMenuClose();
    alert("Help & Support feature coming soon!");
  };

  if (!user)
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );

  const mainMenuItems = [
    { label: "Dashboard", subtitle: "Overview & Analytics", icon: DashboardIcon, route: "/dashboard" },
    { label: "Users", subtitle: "User Management", icon: PeopleIcon, route: "/users" },
    { label: "Students", subtitle: "Student Records", icon: SchoolIcon, route: null },
    { label: "Faculty", subtitle: "Faculty Management", icon: PersonIcon, route: null },
    { label: "Courses", subtitle: "Course Catalog", icon: AssignmentIcon, route: null },
    { label: "Academic Years", subtitle: "Academic Periods", icon: CalendarMonthIcon, route: null },
    { label: "Departments", subtitle: "Department Structure", icon: BusinessIcon, route: null },
  ];

  return (
    <Box className="dashboard-layout">
      {/* Sidebar */}
      <Drawer 
        variant="permanent" 
        className="sidebar"
        sx={{ 
          width: drawerWidth,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
        }}
      >
        <div className="sidebar-header" onClick={() => window.location.href = '/dashboard'} style={{ cursor: 'pointer' }}>
          <div className="logo-container">
            <div className="logo-icon">E</div>
            <div className="logo-text">
              <span className="logo-title">EduPortal</span>
              <span className="logo-subtitle">Academic Management</span>
            </div>
          </div>
        </div>

        <Divider />

        <div className="sidebar-section">
          <div className="section-label">MAIN MENU</div>
          <List>
            {mainMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton 
                    selected={activeMenu === item.label} 
                    onClick={() => {
                      if (item.route) {
                        window.location.href = item.route;
                      } else {
                        setActiveMenu(item.label);
                      }
                    }}
                    className="sidebar-menu-item"
                  >
                    <ListItemIcon className="menu-icon">
                      <IconComponent />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.label}
                      secondary={item.subtitle}
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </div>

        <div style={{ flex: 1 }} />
        
        <div className="sidebar-footer">
          <Divider />
          <div className="footer-links">
            <button className="footer-link" onClick={handleSettings}>
              <SettingsIcon style={{ fontSize: '1rem', marginRight: '4px' }} />
              Settings
            </button>
            <span className="footer-divider">·</span>
            <button className="footer-link" onClick={handleHelp}>
              <HelpIcon style={{ fontSize: '1rem', marginRight: '4px' }} />
              Help
            </button>
          </div>
        </div>
      </Drawer>

      {/* Main Content Area */}
      <Box className="main-content-wrapper">
        {/* Top App Bar */}
        <AppBar position="fixed" className="top-appbar" elevation={0}>
          <Toolbar>
            <IconButton className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" className="page-title">
              {activeMenu}
            </Typography>

            <div style={{ flexGrow: 1 }} />

            <Chip 
              label={user.role || "admin"} 
              size="small" 
              className="user-role-chip"
            />

            <IconButton className="notification-btn">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={handleAvatarClick}>
              <Avatar className="user-avatar">
                {user.full_name ? user.full_name.charAt(0) : "U"}
              </Avatar>
            </IconButton>

            {/* User Menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  minWidth: 200,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Avatar sx={{ bgcolor: '#4f46e5' }}>
                  {user.full_name ? user.full_name.charAt(0) : "U"}
                </Avatar>
                <div style={{ marginLeft: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.full_name || "User"}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user.email || "user@example.com"}</div>
                </div>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSettings}>
                <SettingsIcon fontSize="small" style={{ marginRight: '12px', color: '#6b7280' }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleHelp}>
                <HelpIcon fontSize="small" style={{ marginRight: '12px', color: '#6b7280' }} />
                Help & Support
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" style={{ marginRight: '12px', color: '#ef4444' }} />
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Logout</span>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box className="page-content">
          <Toolbar />
          {activeMenu === "Dashboard" && <DashboardOverview user={user} />}
          {activeMenu === "Users" && <Users />}
          {activeMenu !== "Dashboard" && activeMenu !== "Users" && (
            <Box sx={{ p: 3 }}>
              <div className="coming-soon">
                <h2>"{activeMenu}" Section</h2>
                <p>This section is currently under development.</p>
              </div>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const root = document.getElementById("app");
if (root) ReactDOM.createRoot(root).render(<Dashboard />);

export default Dashboard;