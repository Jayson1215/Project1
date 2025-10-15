// resources/js/components/Users.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../../sass/users.scss";
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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

// Material-UI Icons
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";

const drawerWidth = 260;

function UsersContent() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    status: "active",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/users");
      const usersWithAvatars = response.data.map(user => ({
        ...user,
        initials: (user.full_name || user.name || "U").charAt(0).toUpperCase(),
        avatarColor: getRandomColor()
      }));
      setUsers(usersWithAvatars);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = ["#667eea", "#764ba2", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    faculty: users.filter(u => u.role === "faculty").length,
    students: users.filter(u => u.role === "student").length,
    active: users.filter(u => u.status === "active").length,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      setError("Please fill out all required fields!");
      return;
    }

    if (newUser.password.length < 8) {
      setError("Password must be at least 8 characters long!");
      return;
    }

    try {
      await axios.post("/api/users", newUser);
      setSuccess("User added successfully!");
      await fetchUsers();
      setShowModal(false);
      setNewUser({
        name: "",
        email: "",
        role: "",
        password: "",
        status: "active",
      });
    } catch (error) {
      console.error("Error adding user:", error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || "Failed to add user. Please try again.");
      }
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      name: user.full_name || user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: ""
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser.name || !editingUser.email || !editingUser.role) {
      setError("Please fill out all required fields!");
      return;
    }

    try {
      const updateData = {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status
      };

      if (editingUser.password && editingUser.password.length > 0) {
        if (editingUser.password.length < 8) {
          setError("Password must be at least 8 characters long!");
          return;
        }
        updateData.password = editingUser.password;
      }

      await axios.put(`/api/users/${editingUser.id}`, updateData);
      setSuccess("User updated successfully!");
      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || "Failed to update user. Please try again.");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`/api/users/${userId}`);
      setSuccess("User deleted successfully!");
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.response?.data?.message || "Failed to delete user. Please try again.");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
      setShowEditModal(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.full_name || user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExport = () => {
    const csvContent = [
      ["ID", "Name", "Email", "Role", "Status", "Created"],
      ...filteredUsers.map(u => [
        u.id,
        `"${u.full_name || u.name}"`,
        u.email,
        u.role,
        u.status,
        u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card stat-admin">
          <div className="stat-number">{stats.admins}</div>
          <div className="stat-label">Administrators</div>
        </div>
        <div className="stat-card stat-faculty">
          <div className="stat-number">{stats.faculty}</div>
          <div className="stat-label">Faculty</div>
        </div>
        <div className="stat-card stat-student">
          <div className="stat-number">{stats.students}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Active Users</div>
        </div>
      </div>

      <div className="users-content-card">
        <div className="card-header">
          <h2>Users Management</h2>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <select
              className="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
            <button className="btn-refresh" onClick={fetchUsers} title="Refresh">
              <RefreshIcon />
            </button>
            <button className="btn-export" onClick={handleExport}>
              <FileDownloadIcon />
              EXPORT
            </button>
            <button className="btn-add" onClick={() => setShowModal(true)}>
              <AddIcon />
              ADD USER
            </button>
          </div>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>LAST LOGIN</th>
                <th>CREATED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-name-cell">
                        <div
                          className="user-avatar"
                          style={{ backgroundColor: user.avatarColor }}
                        >
                          {user.initials}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.full_name || user.name}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="text-muted">{user.last_login || "Never"}</td>
                    <td className="text-muted">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-edit" 
                          onClick={() => handleEditUser(user)}
                          title="Edit user"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete user"
                        >
                          <DeleteIcon />
                        </button>
                        <button className="btn-icon btn-more" title="More options">
                          <MoreVertIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="pagination-info">
            <span>Showing {filteredUsers.length} of {users.length} users</span>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Add New User</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role <span className="required">*</span></label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password <span className="required">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter password (min. 8 characters)"
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label>Status <span className="required">*</span></label>
                <select
                  name="status"
                  value={newUser.status}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleAddUser}>
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={editingUser.name}
                  onChange={handleEditChange}
                  className="form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={editingUser.email}
                  onChange={handleEditChange}
                  className="form-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role <span className="required">*</span></label>
                <select
                  name="role"
                  value={editingUser.role}
                  onChange={handleEditChange}
                  className="form-input"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="faculty">Faculty</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="form-group">
                <label>New Password <span className="optional">(leave blank to keep current)</span></label>
                <input
                  type="password"
                  name="password"
                  value={editingUser.password}
                  onChange={handleEditChange}
                  className="form-input"
                  placeholder="Enter new password (min. 8 characters)"
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label>Status <span className="required">*</span></label>
                <select
                  name="status"
                  value={editingUser.status}
                  onChange={handleEditChange}
                  className="form-input"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleUpdateUser}>
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Users() {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Users");
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

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      localStorage.removeItem("user");
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem("user");
      window.location.href = '/login';
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSettings = () => {
    handleMenuClose();
    alert("Settings feature coming soon!");
  };

  const handleHelp = () => {
    handleMenuClose();
    alert("Help & Support feature coming soon!");
  };

  if (!user) return null;

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

      <Box className="main-content-wrapper">
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

        <Box className="page-content">
          <Toolbar />
          <UsersContent />
        </Box>
      </Box>
    </Box>
  );
}

const root = document.getElementById("app");
if (root) ReactDOM.createRoot(root).render(<Users />);