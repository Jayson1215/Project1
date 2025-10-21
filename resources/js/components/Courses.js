import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "../../sass/courses.scss";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";

// Material UI Components
import {
  Box,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";

// Icons
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
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

const drawerWidth = 260;

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Departments for department selector in the course modal
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);

  const [formData, setFormData] = useState({
    id: null,
    course_code: "",
    course_name: "",
    description: "",
    credits: "",
    department_id: "",
    department_name: "",
    semester: "",
    year_level: "",
    status: "active",
  });
  const openMenu = Boolean(anchorEl);

  // Load user
  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : { full_name: "System Administrator", role: "admin" });
  }, []);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log("[Courses] Fetching courses from /api/courses");
      const res = await axios.get("/api/courses");
      console.log("[Courses] API Response:", res.data);
      
      // Handle both {success: true, data: [...]} and {data: [...]} formats
      const list = res?.data?.data || res?.data || [];
      console.log("[Courses] Parsed courses:", list);
      
      setCourses(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("❌ fetchCourses error:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch departments with fallback
  const fetchDepartments = async () => {
    try {
      setDeptLoading(true);
      console.log("[Courses] fetching departments /api/departments");
      const res = await axios.get("/api/departments");
      console.log("[Courses] /api/departments response:", res);
      let list = res?.data?.data || res?.data || [];

      if (!Array.isArray(list) || list.length === 0) {
        list = [
          { id: 1, name: "Computer Science" },
          { id: 2, name: "Mathematics" },
          { id: 3, name: "Engineering" },
        ];
        console.warn("[Courses] departments API returned empty — using fallback list");
      }

      setDepartments(list);
    } catch (err) {
      console.error("[Courses] error fetching departments:", err);
      const fallback = [
        { id: 1, name: "Computer Science" },
        { id: 2, name: "Mathematics" },
        { id: 3, name: "Engineering" },
      ];
      setDepartments(fallback);
    } finally {
      setDeptLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  // Calculate stats
  const stats = {
    total: courses.length,
    active: courses.filter(c => c.status === "active").length,
    inactive: courses.filter(c => c.status === "inactive").length,
    credits: courses.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0),
  };

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredCourses.length);
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Handle modal open/close
  const handleOpenModal = (course = null) => {
    if (course) {
      setFormData({
        ...course,
        department_name: course.department_name || 
                        departments.find((d) => d.id === course.department_id)?.name || ""
      });
    } else {
      setFormData({
        id: null,
        course_code: "",
        course_name: "",
        description: "",
        credits: "",
        department_id: "",
        department_name: "",
        semester: "",
        year_level: "",
        status: "active",
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      id: null,
      course_code: "",
      course_name: "",
      description: "",
      credits: "",
      department_id: "",
      department_name: "",
      semester: "",
      year_level: "",
      status: "active",
    });
  };

  // Handle save (Add/Edit)
  const handleSaveCourse = async () => {
    // Validate required fields
    if (!formData.course_code || !formData.course_name) {
      alert("Please fill in Course Code and Course Name");
      return;
    }

    try {
      // Find matching department by name if department_name is provided
      let deptId = formData.department_id;
      if (formData.department_name && !deptId) {
        const matchingDept = departments.find(
          d => (d.name || d.department_name || "").toLowerCase() === 
               formData.department_name.toLowerCase()
        );
        if (matchingDept) {
          deptId = matchingDept.id;
        }
      }

      const payload = {
        course_code: formData.course_code.trim(),
        course_name: formData.course_name.trim(),
        description: formData.description?.trim() || "",
        credits: formData.credits || null,
        department_name: formData.department_name?.trim() || null,
        department_id: deptId || null,
        semester: formData.semester || "",
        year_level: formData.year_level || "",
        status: formData.status || "active",
      };

      console.log("Saving course with payload:", payload);

      let res;
      if (formData.id) {
        // Editing existing course
        res = await axios.put(`/api/courses/${formData.id}`, payload);
        console.log("Updated course:", res.data);
      } else {
        // Creating new course
        res = await axios.post("/api/courses", payload);
        console.log("Created course:", res.data);
      }

      // Refresh courses list to show the new/updated course
      await fetchCourses();

      // Close modal and reset form
      handleCloseModal();

      // Success message
      const message = formData.id ? "Course updated successfully!" : "Course added successfully!";
      alert(message);
    } catch (error) {
      console.error("Error saving course:", error);
      const resp = error.response;
      
      if (resp) {
        // Handle different error responses
        if (resp.status === 422) {
          // Validation errors
          const msgs = resp.data?.messages || resp.data?.errors;
          if (msgs) {
            const flattened = Array.isArray(msgs) ? msgs : Object.values(msgs).flat();
            alert("Please fix the following errors:\n\n" + flattened.join("\n"));
          } else {
            alert("Validation error. Please check your input.");
          }
        } else if (resp.status === 409) {
          // Conflict - duplicate course code
          alert("This course code already exists. Please use a different code or edit the existing course.");
        } else {
          const serverMsg = resp.data?.message || resp.data?.error || "Unknown server error";
          alert("Error: " + serverMsg);
        }
      } else if (error.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Error: " + (error.message || "Unknown error"));
      }
    }
  };

  // Handle delete
  const handleDeleteCourse = async (id) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await axios.delete(`/api/courses/${id}`);
      await fetchCourses();
      setActionMenuAnchor(null);
      alert("Course deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting course:", error);
      alert("Error deleting course");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Export function
  const handleExport = () => {
    const csvContent = [
      ["Code", "Course", "Credits", "Description", "Status"],
      ...filteredCourses.map(c => [
        c.course_code,
        `"${c.course_name}"`,
        c.credits,
        `"${c.description || 'N/A'}"`,
        c.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `courses_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Action menu handlers
  const handleActionMenuOpen = (event, course) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
    setSelectedCourse(null);
  };

  // Sidebar
  const menuItems = [
    { label: "Dashboard", subtitle: "Overview & Analytics", icon: DashboardIcon, route: "/dashboard" },
    { label: "Users", subtitle: "User Management", icon: PeopleIcon, route: "/users" },
    { label: "Students", subtitle: "Student Records", icon: SchoolIcon, route: "/students" },
    { label: "Faculty", subtitle: "Faculty Management", icon: PersonIcon, route: "/faculty" },
    { label: "Courses", subtitle: "Course Catalog", icon: AssignmentIcon, route: "/courses" },
    { label: "Academic Years", subtitle: "Academic Periods", icon: CalendarMonthIcon, route: "/academic-years" },
    { label: "Departments", subtitle: "Department Structure", icon: BusinessIcon, route: "/departments" },
  ];

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post("/logout");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } catch {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const handleSettings = () => {
    alert("Settings feature coming soon!");
  };

  const handleHelp = () => {
    alert("Help & Support feature coming soon!");
  };

  if (!user)
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );

  return (
    <Box className="dashboard-layout">
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        className="sidebar"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <div
          className="sidebar-header"
          onClick={() => (window.location.href = "/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-container">
            <div className="logo-icon">E</div>
            <div className="logo-text">
              <span className="logo-title">EduPortal</span>
              <span className="logo-subtitle">Academic Management</span>
            </div>
          </div>
        </div>
        <Divider />

        {/* Search in Sidebar */}
        <Box className="sidebar-search">
          <TextField
            placeholder="Search..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Typography className="sidebar-section-title">MAIN MENU</Typography>
        <List>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  selected={item.label === "Courses"}
                  onClick={() => item.route && (window.location.href = item.route)}
                  className={item.label === "Courses" ? "selected" : ""}
                >
                  <ListItemIcon className="menu-icon">
                    <Icon />
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

        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <div className="sidebar-footer">
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

      {/* Main content */}
      <Box className="main-content-wrapper">
        <AppBar position="fixed" className="top-appbar" elevation={0}>
          <Toolbar>
            <IconButton className="mobile-menu-btn">
              <MenuIcon />
            </IconButton>
            <div className="breadcrumb">
              <Typography variant="h6" className="page-title">Courses</Typography>
              <Typography variant="caption" className="page-subtitle">Course Catalog</Typography>
            </div>
            <div style={{ flexGrow: 1 }} />
            <Chip label={user.role || "Student"} size="small" className="user-role-chip" />
            <IconButton className="notification-btn">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar className="user-avatar">{user.full_name.charAt(0)}</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={() => setAnchorEl(null)}
              onClick={() => setAnchorEl(null)}
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
          <div className="courses-container">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Courses</div>
              </div>
              <div className="stat-card active">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active Courses</div>
              </div>
              <div className="stat-card inactive">
                <div className="stat-value">{stats.inactive}</div>
                <div className="stat-label">Inactive Courses</div>
              </div>
              <div className="stat-card credits">
                <div className="stat-value">{stats.credits}</div>
                <div className="stat-label">Total Credits</div>
              </div>
            </div>

            {/* Page Header */}
            <div className="page-header">
              <h1>Courses Management</h1>
              <div className="header-actions">
                <button className="btn-secondary" onClick={handleExport}>
                  <FileDownloadIcon /> EXPORT
                </button>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                  <AddIcon /> ADD COURSE
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="filters-section">
              <div className="filters-grid">
                <div className="form-group search-group">
                  <TextField
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </div>
                <div className="form-group">
                  <FormControl fullWidth size="small">
                    <InputLabel>Status Filter</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status Filter"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <button className="btn-filter">
                  <FilterListIcon /> MORE FILTERS
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="loading-state">
                <CircularProgress />
                <p>Loading courses...</p>
              </div>
            ) : (
              <>
                <div className="table-container">
                  {filteredCourses.length === 0 ? (
                    <div className="no-data" style={{ 
                      padding: '60px 20px', 
                      textAlign: 'center',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      color: '#6b7280'
                    }}>
                      <SchoolIcon style={{ fontSize: '64px', opacity: 0.3, marginBottom: '16px' }} />
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>No courses found</h3>
                      <p style={{ margin: 0, fontSize: '14px' }}>Click "ADD COURSE" to create your first course</p>
                    </div>
                  ) : (
                    <table>
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Code</th>
                        <th>Credits</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCourses.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <div className="course-cell">
                              <div className="course-icon">
                                <SchoolIcon />
                              </div>
                              <span className="course-name">{c.course_name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="course-code-badge">{c.course_code}</span>
                          </td>
                          <td>{c.credits}</td>
                          <td className="description-cell">{c.description || "N/A"}</td>
                          <td>
                            <span className={`status-badge status-${c.status.toLowerCase()}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="actions">
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleOpenModal(c)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteCourse(c.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleActionMenuOpen(e, c)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  )}
                </div>

                {/* Pagination */}
                {filteredCourses.length > 0 && (
                  <div className="pagination-container">
                  <div className="pagination-info">
                    Rows per page: 
                    <Select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(e.target.value);
                        setCurrentPage(1);
                      }}
                      size="small"
                      className="rows-select"
                    >
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={25}>25</MenuItem>
                      <MenuItem value={50}>50</MenuItem>
                    </Select>
                    <span className="page-range">{startIndex + 1}-{endIndex} of {filteredCourses.length}</span>
                  </div>
                  <div className="pagination-controls">
                    <IconButton
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      size="small"
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                    <IconButton
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      size="small"
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </div>
                </div>
                )}
              </>
            )}
          </div>
        </Box>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => {
          handleOpenModal(selectedCourse);
          handleActionMenuClose();
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          handleDeleteCourse(selectedCourse?.id);
        }}>
          <DeleteIcon sx={{ mr: 1, color: "#ef4444" }} fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      {/* Modal Form */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{formData.id ? "Edit Course" : "Add New Course"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Course Code"
            name="course_code"
            value={formData.course_code}
            onChange={handleChange}
            fullWidth
            margin="normal"
            size="small"
            autoFocus
            required
          />
          <TextField
            label="Course Name"
            name="course_name"
            value={formData.course_name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            size="small"
            required
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            size="small"
            multiline
            rows={3}
          />
          <TextField
            label="Credits"
            name="credits"
            type="number"
            value={formData.credits}
            onChange={handleChange}
            fullWidth
            margin="normal"
            size="small"
          />

          <Autocomplete
            freeSolo
            options={departments.map((d) => d.name || d.department_name || `Dept ${d.id}`)}
            value={formData.department_name || ""}
            onChange={(_, newValue) => {
              setFormData((prev) => ({ ...prev, department_name: newValue || "" }));
            }}
            onInputChange={(_, newInput) => {
              setFormData((prev) => ({ ...prev, department_name: newInput || "" }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Department"
                margin="normal"
                fullWidth
                size="small"
                helperText="Type to create new department or pick existing"
              />
            )}
          />

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Semester</InputLabel>
            <Select
              name="semester"
              value={formData.semester || ""}
              label="Semester"
              onChange={handleChange}
            >
              <MenuItem value=""><em>Choose...</em></MenuItem>
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="summer">Summer</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Year Level</InputLabel>
            <Select
              name="year_level"
              value={formData.year_level || ""}
              label="Year Level"
              onChange={handleChange}
            >
              <MenuItem value=""><em>Choose...</em></MenuItem>
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="3">3</MenuItem>
              <MenuItem value="4">4</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCourse}>{formData.id ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const root = document.getElementById("app");
if (root) ReactDOM.createRoot(root).render(<CoursesPage />);

export default CoursesPage;