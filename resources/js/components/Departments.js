// Departments.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../../sass/Departments.scss";
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
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

// Material-UI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FilterListIcon from "@mui/icons-material/FilterList";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const drawerWidth = 260;

function Departments() {
  const [user, setUser] = useState({ full_name: "User", role: "Student" });
  const [activeMenu, setActiveMenu] = useState("Departments");
  const [anchorEl, setAnchorEl] = useState(null);
  const [departments, setDepartments] = useState([
    { id: 1, name: "Computer Science", head: "Dr. Jane Smith", faculty: 15, students: 450, established: 1995, status: "active" },
    { id: 2, name: "Mathematics", head: "Prof. Michael Johnson", faculty: 12, students: 320, established: 1980, status: "active" },
    { id: 3, name: "Physics", head: "Dr. Sarah Wilson", faculty: 10, students: 280, established: 1985, status: "active" },
    { id: 4, name: "Chemistry", head: "Dr. Robert Brown", faculty: 8, students: 200, established: 1990, status: "active" },
    { id: 5, name: "Biology", head: "Dr. Emily Davis", faculty: 11, students: 350, established: 1988, status: "active" },
    { id: 6, name: "English Literature", head: "Prof. William Taylor", faculty: 6, students: 150, established: 1975, status: "inactive" },
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    head: "",
    faculty: 0,
    students: 0,
    established: "",
    status: "active"
  });

  const open = Boolean(anchorEl);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    window.location.href = "/login";
  };

  const mainMenuItems = [
    { label: "Dashboard", subtitle: "Overview & Analytics", icon: DashboardIcon, route: "/dashboard" },
    { label: "Users", subtitle: "User Management", icon: PeopleIcon, route: "/users" },
    { label: "Students", subtitle: "Student Records", icon: SchoolIcon, route: "/students" },
    { label: "Faculty", subtitle: "Faculty Management", icon: PersonIcon, route: "/faculty" },
    { label: "Courses", subtitle: "Course Catalog", icon: AssignmentIcon, route: "/courses" },
    { label: "Academic Years", subtitle: "Academic Periods", icon: CalendarMonthIcon, route: "/academic-years" },
    { label: "Departments", subtitle: "Department Structure", icon: BusinessIcon, route: "/departments" },
  ];

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.head.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || dept.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, startIndex + itemsPerPage);

  const stats = [
    { value: departments.length, label: "Total Departments" },
    { value: departments.filter((d) => d.status === "active").length, label: "Active Departments" },
    { value: departments.reduce((sum, d) => sum + d.faculty, 0), label: "Total Faculty" },
    { value: departments.reduce((sum, d) => sum + d.students, 0), label: "Total Students" },
  ];

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments(departments.filter((d) => d.id !== id));
    }
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      head: dept.head,
      faculty: dept.faculty,
      students: dept.students,
      established: dept.established,
      status: dept.status
    });
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      head: "",
      faculty: 0,
      students: 0,
      established: "",
      status: "active"
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (editingDept) {
      setDepartments(departments.map((d) => d.id === editingDept.id ? { ...d, ...formData } : d));
    } else {
      setDepartments([...departments, { id: Date.now(), ...formData }]);
    }
    setShowModal(false);
    setEditingDept(null);
  };

  return (
    <Box className="departments-layout">
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        className="sidebar"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <div className="sidebar-header" onClick={() => window.location.href = "/dashboard"}>
          <div className="logo-container">
            <div className="logo-icon">E</div>
            <div className="logo-text">
              <span className="logo-title">EduPortal</span>
              <span className="logo-subtitle">Academic Management</span>
            </div>
          </div>
        </div>

        <div className="sidebar-search">
          <SearchIcon className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>

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
                      primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: "0.75rem" }}
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
            <button className="footer-link">
              <SettingsIcon style={{ fontSize: "1rem", marginRight: "4px" }} />
              Settings
            </button>
            <span className="footer-divider">·</span>
            <button className="footer-link">
              <HelpIcon style={{ fontSize: "1rem", marginRight: "4px" }} />
              Help & Support
            </button>
          </div>
        </div>
      </Drawer>

      {/* Main Content */}
      <Box className="main-content-wrapper">
        {/* Top App Bar */}
        <AppBar position="fixed" className="top-appbar" elevation={0}>
          <Toolbar>
            <Typography variant="h6" className="page-title">
              Departments
            </Typography>
            <Typography variant="body2" className="page-subtitle">
              Department Structure
            </Typography>

            <div style={{ flexGrow: 1 }} />

            <Chip label={user.role || "Student"} size="small" className="user-role-chip" />

            <IconButton className="notification-btn">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={handleAvatarClick}>
              <Avatar className="user-avatar">{user.full_name ? user.full_name.charAt(0) : "U"}</Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" style={{ marginRight: "12px", color: "#ef4444" }} />
                <span style={{ color: "#ef4444", fontWeight: 600 }}>Logout</span>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box className="page-content">
          <Toolbar />

          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Management Section */}
          <div className="management-section">
            <div className="section-header">
              <h2>Departments Management</h2>
              <div className="header-actions">
                <button className="btn-export">
                  <DownloadIcon /> EXPORT
                </button>
                <button className="btn-add" onClick={handleAddNew}>
                  <AddIcon /> ADD DEPARTMENT
                </button>
              </div>
            </div>

            <div className="filters-bar">
              <div className="search-box">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-actions">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="status-filter"
                >
                  <option value="all">Status Filter</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button className="btn-more-filters">
                  <FilterListIcon /> MORE FILTERS
                </button>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="departments-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Head</th>
                    <th>Faculty</th>
                    <th>Students</th>
                    <th>Established</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDepartments.map((dept) => (
                    <tr key={dept.id}>
                      <td>
                        <div className="dept-info">
                          <BusinessIcon className="dept-icon" />
                          {dept.name}
                        </div>
                      </td>
                      <td>
                        <div className="head-info">
                          <PersonIcon />
                          {dept.head}
                        </div>
                      </td>
                      <td>{dept.faculty}</td>
                      <td>
                        <div className="students-info">
                          <SchoolIcon />
                          {dept.students}
                        </div>
                      </td>
                      <td>{dept.established}</td>
                      <td>
                        <span className={`status-badge status-${dept.status}`}>
                          {dept.status}
                        </span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="btn-icon btn-edit" onClick={() => handleEdit(dept)}>
                            <EditIcon />
                          </button>
                          <button className="btn-icon btn-delete" onClick={() => handleDelete(dept.id)}>
                            <DeleteIcon />
                          </button>
                          <button className="btn-icon">
                            <MoreVertIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <div className="rows-per-page">
                <span>Rows per page:</span>
                <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="pagination">
                <span className="pagination-info">
                  1-6 of {filteredDepartments.length}
                </span>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Box>
      </Box>

      {/* Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDept ? "Edit Department" : "Add New Department"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
            <TextField
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Department Head"
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Faculty Count"
              type="number"
              value={formData.faculty}
              onChange={(e) => setFormData({ ...formData, faculty: parseInt(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Student Count"
              type="number"
              value={formData.students}
              onChange={(e) => setFormData({ ...formData, students: parseInt(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Established Year"
              type="number"
              value={formData.established}
              onChange={(e) => setFormData({ ...formData, established: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingDept ? "Update" : "Save"} Department
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Departments;