/**
 * Enhanced Departments Management Component - Modern Design
 * 
 * FEATURES:
 * =========
 * 1. Auto-generated Department Codes (DEPT-001 format)
 * 2. Real-time student and faculty count tracking
 * 3. Modern Material-UI design matching Courses.js
 * 4. Responsive layout with proper spacing
 * 5. Integration statistics and analytics
 * 6. Settings dropdown in sidebar (Academic Years & Departments)
 */

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../../sass/Departments.scss";
import axios from "axios";

// Material-UI Components
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
  Card,
  CardContent,
  Alert,
  Snackbar,
  Collapse,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
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
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import MenuIcon from "@mui/icons-material/Menu";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LockIcon from "@mui/icons-material/Lock";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const drawerWidth = 260;

function DepartmentsPage() {
  // Core State
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  
  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Integration State
  const [allStudents, setAllStudents] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingIntegration, setLoadingIntegration] = useState(false);
  
  // Selected Data
  const [editingDept, setEditingDept] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [departmentStudents, setDepartmentStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(true);
  
  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // New Department Form
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    head_faculty_id: "",
    building: "",
    contact_email: "",
    contact_phone: "",
    status: "Active"
  });

  const openMenu = Boolean(anchorEl);

  // Generate next department code
  const generateNextDeptCode = () => {
    if (departments.length === 0) return "DEPT-001";

    const numericCodes = departments
      .map(d => {
        const match = d.code?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      })
      .filter(code => !isNaN(code));

    const maxCode = numericCodes.length > 0 ? Math.max(...numericCodes) : 0;
    const nextCode = maxCode + 1;
    return `DEPT-${String(nextCode).padStart(3, '0')}`;
  };

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    setUser(stored ? JSON.parse(stored) : { full_name: "System Administrator", role: "admin" });
  }, []);

  // Initial data load
  useEffect(() => {
    fetchDepartments();
    fetchIntegrationData();
  }, []);

  // Auto-generate department code when modal opens
  useEffect(() => {
    if (showModal && !formData.code) {
      const nextCode = generateNextDeptCode();
      setFormData(prev => ({ ...prev, code: nextCode }));
    }
  }, [showModal, departments]);

  // API Calls
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/departments");
      const data = response.data.success ? response.data.data : response.data;
      setDepartments(Array.isArray(data) ? data : []);
      setSnackbar({ open: true, message: "Departments loaded successfully", severity: "success" });
    } catch (error) {
      console.error("Error fetching departments:", error);
      setSnackbar({ open: true, message: "Failed to load departments", severity: "error" });
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrationData = async () => {
    setLoadingIntegration(true);
    try {
      const [studentsRes, facultyRes, coursesRes] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/faculty"),
        axios.get("/api/courses")
      ]);
      
      setAllStudents(studentsRes.data.data || studentsRes.data || []);
      setAllFaculty(facultyRes.data.data || facultyRes.data || []);
      setCourses(coursesRes.data.data || coursesRes.data || []);
    } catch (error) {
      console.error("Error fetching integration data:", error);
    } finally {
      setLoadingIntegration(false);
    }
  };

  // Utility Functions
  const getDepartmentCounts = (deptName) => {
    const studentsCount = allStudents.filter(
      student => student.department === deptName
    ).length;
    
    const facultyCount = allFaculty.filter(
      faculty => faculty.department === deptName
    ).length;

    const coursesCount = courses.filter(
      course => course.department_name === deptName
    ).length;
    
    return { studentsCount, facultyCount, coursesCount };
  };

  // Statistics
  const stats = {
    total: departments.length,
    active: departments.filter(d => d.status?.toLowerCase() === "active").length,
    inactive: departments.filter(d => d.status?.toLowerCase() === "inactive").length,
    totalStudents: departments.reduce((sum, d) => {
      const counts = getDepartmentCounts(d.name);
      return sum + counts.studentsCount;
    }, 0),
    totalFaculty: departments.reduce((sum, d) => {
      const counts = getDepartmentCounts(d.name);
      return sum + counts.facultyCount;
    }, 0),
    totalCourses: departments.reduce((sum, d) => {
      const counts = getDepartmentCounts(d.name);
      return sum + counts.coursesCount;
    }, 0),
  };

  // Filtering & Pagination
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = 
      dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || dept.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDepartments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, filteredDepartments.length);
  const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

  // Modal Handlers
  const handleViewDetails = (dept) => {
    setSelectedDept(dept);
    setShowDetailsModal(true);
  };

  const handleViewStudents = async (dept) => {
    setSelectedDept(dept);
    setShowStudentsModal(true);
    setLoadingStudents(true);
    
    try {
      const studentsInDept = allStudents.filter(
        student => student.department === dept.name
      );
      setDepartmentStudents(studentsInDept);
    } catch (error) {
      console.error("Error fetching students:", error);
      setSnackbar({ open: true, message: "Failed to load students", severity: "error" });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleOpenModal = () => {
    const nextCode = generateNextDeptCode();
    setFormData({
      code: nextCode,
      name: "",
      description: "",
      head_faculty_id: "",
      building: "",
      contact_email: "",
      contact_phone: "",
      status: "Active"
    });
    setShowModal(true);
  };

  const handleEditDept = (dept) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code || "",
      name: dept.name || "",
      description: dept.description || "",
      head_faculty_id: dept.head_faculty_id || "",
      building: dept.building || "",
      contact_email: dept.contact_email || "",
      contact_phone: dept.contact_phone || "",
      status: dept.status || "Active"
    });
    setShowEditModal(true);
  };

  // Form Handlers
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // CRUD Operations
  const handleAddDepartment = async () => {
    if (!formData.code || !formData.name) {
      setSnackbar({ open: true, message: "Department code and name are required!", severity: "error" });
      return;
    }

    try {
      await axios.post("/api/departments", formData);
      setSnackbar({ open: true, message: `Department ${formData.code} added successfully!`, severity: "success" });
      
      if (window.addNotification) {
        window.addNotification('department', 'New Department Added', 
          `${formData.name} (${formData.code}) has been created`);
      }
      
      setShowModal(false);
      await fetchDepartments();
      await fetchIntegrationData();
    } catch (error) {
      console.error("Error adding department:", error);
      const errorMsg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(", ")
        : error.response?.data?.message || "Failed to add department";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
    }
  };

  const handleUpdateDepartment = async () => {
    if (!formData.code || !formData.name) {
      setSnackbar({ open: true, message: "Department code and name are required!", severity: "error" });
      return;
    }

    try {
      await axios.put(`/api/departments/${editingDept.id}`, formData);
      setSnackbar({ open: true, message: `Department ${formData.code} updated successfully!`, severity: "success" });
      await fetchDepartments();
      await fetchIntegrationData();
      setShowEditModal(false);
      setEditingDept(null);
    } catch (error) {
      console.error("Error updating department:", error);
      const errorMsg = error.response?.data?.message || "Failed to update department";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      await axios.delete(`/api/departments/${deptId}`);
      setSnackbar({ open: true, message: "Department deleted successfully!", severity: "success" });
      await fetchDepartments();
      await fetchIntegrationData();
    } catch (error) {
      console.error("Error deleting department:", error);
      setSnackbar({ open: true, message: "Failed to delete department", severity: "error" });
    }
  };

  // Export & Refresh
  const handleExport = () => {
    const csvContent = [
      ["Code", "Name", "Description", "Building", "Faculty Count", "Students Count", "Courses Count", "Status"],
      ...filteredDepartments.map(d => {
        const counts = getDepartmentCounts(d.name);
        return [
          d.code, `"${d.name}"`, `"${d.description || 'N/A'}"`, d.building || "N/A",
          counts.facultyCount, counts.studentsCount, counts.coursesCount, d.status
        ];
      })
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `departments_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    setSnackbar({ open: true, message: "Departments exported successfully", severity: "success" });
  };

  const handleRefresh = async () => {
    setSnackbar({ open: true, message: "Refreshing data...", severity: "info" });
    await Promise.all([fetchDepartments(), fetchIntegrationData()]);
  };

  // Navigation
  const menuItems = [
    { label: "Dashboard", subtitle: "Overview & Analytics", icon: DashboardIcon, route: "/dashboard" },
    { label: "Users", subtitle: "User Management", icon: PeopleIcon, route: "/users" },
    { label: "Students", subtitle: "Student Records", icon: SchoolIcon, route: "/students" },
    { label: "Faculty", subtitle: "Faculty Management", icon: PersonIcon, route: "/faculty" },
    { label: "Courses", subtitle: "Course Catalog", icon: AssignmentIcon, route: "/courses" },
  ];

  // Settings submenu items
  const settingsMenuItems = [
    { label: "Academic Years", subtitle: "Academic Periods", icon: CalendarMonthIcon, route: "/AcademicYears" },
    { label: "Departments", subtitle: "Department Structure", icon: BusinessIcon, route: "/departments" },
  ];

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
    setSnackbar({ open: true, message: "Settings feature coming soon!", severity: "info" });
  };

  const handleHelp = () => {
    setSnackbar({ open: true, message: "Help & Support feature coming soon!", severity: "info" });
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            borderRight: '1px solid #e5e7eb'
          },
        }}
      >
        <Box
          onClick={() => (window.location.href = "/dashboard")}
          sx={{ p: 2, cursor: 'pointer', borderBottom: '1px solid #e5e7eb' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: '#4f46e5', width: 40, height: 40 }}>E</Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>EduPortal</Typography>
              <Typography variant="caption" color="text.secondary">Academic Management</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
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

        <Typography sx={{ px: 2, py: 1, fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
          MAIN MENU
        </Typography>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={item.label === "Departments"}
                  onClick={() => item.route && (window.location.href = item.route)}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: '#eef2ff',
                      color: '#4f46e5',
                      '& .MuiListItemIcon-root': { color: '#4f46e5' }
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    secondary={item.subtitle}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* Settings Dropdown Section */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={true}
              onClick={() => setSettingsOpen(!settingsOpen)}
              sx={{
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: '#eef2ff',
                  color: '#4f46e5',
                  '& .MuiListItemIcon-root': { color: '#4f46e5' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Settings"
                secondary="System Configuration"
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
              {settingsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          {/* Settings Submenu */}
          <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {settingsMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={item.label === "Departments"}
                      onClick={() => item.route && (window.location.href = item.route)}
                      sx={{
                        pl: 4,
                        borderRadius: 1,
                        '&.Mui-selected': {
                          bgcolor: '#eef2ff',
                          color: '#4f46e5',
                          '& .MuiListItemIcon-root': { color: '#4f46e5' }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Icon sx={{ fontSize: '1.25rem' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        secondary={item.subtitle}
                        primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: '0.7rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Button size="small" startIcon={<HelpIcon />} onClick={handleHelp}>
            Help
          </Button>
        </Box>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: '#f9fafb', minHeight: '100vh' }}>
        {/* Top AppBar */}
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{ bgcolor: 'white', color: 'text.primary', borderBottom: '1px solid #e5e7eb' }}
        >
          <Toolbar>
            <IconButton sx={{ mr: 2, display: { sm: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Departments</Typography>
              <Typography variant="caption" color="text.secondary">Department Structure</Typography>
            </Box>
            
            <Chip 
              icon={<SchoolIcon />} 
              label={`${stats.totalStudents} Students`} 
              size="small" 
              sx={{ mr: 1 }}
              color="success"
            />
            <Chip 
              icon={<PersonIcon />} 
              label={`${stats.totalFaculty} Faculty`} 
              size="small" 
              sx={{ mr: 2 }}
              color="primary"
            />
            
            <Chip label={user.role || "Admin"} size="small" sx={{ mr: 1 }} />
            <IconButton sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#4f46e5' }}>
                {user.full_name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={() => setAnchorEl(null)}
              onClick={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Avatar sx={{ bgcolor: '#4f46e5', mr: 1, width: 32, height: 32 }}>
                  {user.full_name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{user.full_name || "User"}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.email || "user@example.com"}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSettings}>
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleHelp}>
                <HelpIcon fontSize="small" sx={{ mr: 1 }} />
                Help & Support
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1, color: '#ef4444' }} />
                <Typography color="#ef4444" fontWeight={600}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: 3 }}>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total Departments</Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: '#ecfdf5' }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#059669">{stats.active}</Typography>
                <Typography variant="body2" color="text.secondary">Active Departments</Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: '#eff6ff' }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#2563eb">{stats.totalStudents}</Typography>
                <Typography variant="body2" color="text.secondary">Total Students</Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: '#fef3c7' }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#d97706">{generateNextDeptCode()}</Typography>
                <Typography variant="body2" color="text.secondary">Next Department Code</Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>Departments Management</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
                Refresh
              </Button>
              <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
                Export
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={handleOpenModal}
              >
                Add Department
              </Button>
            </Box>
          </Box>

          {/* Search and Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr auto' }, gap: 2 }}>
                <TextField
                  placeholder="Search departments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <FormControl size="small" fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <Button variant="outlined" startIcon={<FilterListIcon />}>
                  More Filters
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">Loading departments...</Typography>
            </Box>
          ) : (
            <>
              <Card>
                <Box sx={{ overflowX: 'auto' }}>
                  {filteredDepartments.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: 'center' }}>
                      <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No departments found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || statusFilter
                          ? 'Try adjusting your filters'
                          : 'Click "ADD DEPARTMENT" to create your first department'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                      <Box component="thead">
                        <Box component="tr" sx={{ bgcolor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Code</Box>
                          <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Department</Box>
                          <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Building</Box>
                          <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Faculty</Box>
                          <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Students</Box>
                          <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Courses</Box>
                          <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Status</Box>
                          <Box component="th" sx={{ p: 2, textAlign: 'left', fontWeight: 600, fontSize: '0.875rem' }}>Actions</Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {paginatedDepartments.map((dept) => {
                          const counts = getDepartmentCounts(dept.name);
                          
                          return (
                            <Box 
                              component="tr" 
                              key={dept.id}
                              sx={{ 
                                borderBottom: '1px solid #e5e7eb',
                                '&:hover': { bgcolor: '#f9fafb' }
                              }}
                            >
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip 
                                  icon={<BusinessIcon />}
                                  label={dept.code} 
                                  size="small" 
                                  variant="outlined" 
                                  color="primary" 
                                />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {dept.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {dept.description || 'No description'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ApartmentIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                                  <Typography variant="body2">{dept.building || 'N/A'}</Typography>
                                </Box>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip 
                                  icon={<PersonIcon />}
                                  label={counts.facultyCount} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Button
                                  size="small"
                                  onClick={() => handleViewStudents(dept)}
                                  disabled={counts.studentsCount === 0}
                                  sx={{
                                    minWidth: 'auto',
                                    color: counts.studentsCount > 0 ? '#4f46e5' : 'text.disabled',
                                    '&:hover': { bgcolor: counts.studentsCount > 0 ? '#f3f4f6' : 'transparent' }
                                  }}
                                >
                                  <SchoolIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                                  {counts.studentsCount}
                                </Button>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip 
                                  icon={<AssignmentIcon />}
                                  label={counts.coursesCount} 
                                  size="small" 
                                  variant="outlined"
                                />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip 
                                  label={dept.status} 
                                  size="small"
                                  color={dept.status?.toLowerCase() === 'active' ? 'success' : 'default'}
                                />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton size="small" color="info" onClick={() => handleViewDetails(dept)}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="primary" onClick={() => handleEditDept(dept)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleDeleteDepartment(dept.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={(e) => {
                                    setActionMenuAnchor(e.currentTarget);
                                    setSelectedDept(dept);
                                  }}>
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Pagination */}
                {filteredDepartments.length > 0 && (
                  <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Rows per page:
                      </Typography>
                      <Select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(e.target.value);
                          setCurrentPage(1);
                        }}
                        size="small"
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                      <Typography variant="body2" color="text.secondary">
                        {startIndex + 1}-{endIndex} of {filteredDepartments.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        size="small"
                      >
                        <NavigateBeforeIcon />
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        Page {currentPage} of {totalPages}
                      </Typography>
                      <IconButton
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        size="small"
                      >
                        <NavigateNextIcon />
                      </IconButton>
                    </Box>
                  </Box>
                )}
              </Card>
            </>
          )}
        </Box>
      </Box>

      {/* ADD DEPARTMENT MODAL */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <BusinessIcon />
            Add New Department
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
            <TextField
              label="Department Code"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              fullWidth
              required
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AutorenewIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <LockIcon fontSize="small" color="disabled" />
                  </InputAdornment>
                ),
              }}
              helperText="Auto-generated • Read-only"
              sx={{ '& .MuiInputBase-root': { backgroundColor: '#f9fafb' } }}
            />
            <TextField
              label="Department Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              fullWidth
              required
              helperText="Full department name"
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: "1 / -1" }}
              helperText="Brief description of the department"
            />
            <TextField
              label="Building"
              value={formData.building}
              onChange={(e) => handleChange("building", e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ApartmentIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              helperText="Building location"
            />
            <TextField
              label="Head Faculty ID"
              value={formData.head_faculty_id}
              onChange={(e) => handleChange("head_faculty_id", e.target.value)}
              fullWidth
              helperText="Optional: Department head"
            />
            <TextField
              label="Contact Email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              helperText="Department email"
            />
            <TextField
              label="Contact Phone"
              value={formData.contact_phone}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              helperText="Department phone"
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            💡 <strong>Note:</strong> Student and Faculty counts will be automatically calculated when you assign students and faculty members to this department.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleAddDepartment} variant="contained">
            Add Department
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DEPARTMENT MODAL */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon />
            Edit Department
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
            <TextField
              label="Department Code"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              fullWidth
              required
              helperText="Unique department code"
            />
            <TextField
              label="Department Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: "1 / -1" }}
            />
            <TextField
              label="Building"
              value={formData.building}
              onChange={(e) => handleChange("building", e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ApartmentIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Head Faculty ID"
              value={formData.head_faculty_id}
              onChange={(e) => handleChange("head_faculty_id", e.target.value)}
              fullWidth
            />
            <TextField
              label="Contact Email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Contact Phone"
              value={formData.contact_phone}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            {editingDept && (
              <>
                <TextField
                  label="Total Students"
                  value={getDepartmentCounts(editingDept.name).studentsCount}
                  fullWidth
                  disabled
                  helperText="Auto-calculated"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Total Faculty"
                  value={getDepartmentCounts(editingDept.name).facultyCount}
                  fullWidth
                  disabled
                  helperText="Auto-calculated"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateDepartment} variant="contained">
            Update Department
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW DETAILS MODAL */}
      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <BusinessIcon />
              <span>Department Details</span>
            </Box>
            <IconButton onClick={() => setShowDetailsModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDept && (
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: '#4f46e5', width: 64, height: 64 }}>
                      <BusinessIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h5" fontWeight={600}>
                        {selectedDept.name}
                      </Typography>
                      <Chip 
                        label={selectedDept.code} 
                        size="small" 
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    <Chip 
                      label={selectedDept.status} 
                      color={selectedDept.status?.toLowerCase() === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Description</Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedDept.description || "No description"}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <ApartmentIcon fontSize="small" /> Building
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedDept.building || "N/A"}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <EmailIcon fontSize="small" /> Contact Email
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedDept.contact_email || "N/A"}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <PhoneIcon fontSize="small" /> Contact Phone
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedDept.contact_phone || "N/A"}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <SchoolIcon fontSize="small" /> Total Students
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={600}>
                        {getDepartmentCounts(selectedDept.name).studentsCount}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <PersonIcon fontSize="small" /> Total Faculty
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={600}>
                        {getDepartmentCounts(selectedDept.name).facultyCount}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <AssignmentIcon fontSize="small" /> Total Courses
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={600}>
                        {getDepartmentCounts(selectedDept.name).coursesCount}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={() => {
              setShowDetailsModal(false);
              handleEditDept(selectedDept);
            }}
          >
            Edit Department
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW STUDENTS MODAL */}
      <Dialog
        open={showStudentsModal}
        onClose={() => setShowStudentsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                <SchoolIcon /> Students in {selectedDept?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedDept?.code}
              </Typography>
            </Box>
            <IconButton onClick={() => setShowStudentsModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingStudents ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : departmentStudents.length === 0 ? (
            <Box textAlign="center" py={4}>
              <SchoolIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No students enrolled
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This department doesn't have any students yet.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  {departmentStudents.length} student{departmentStudents.length !== 1 ? 's' : ''} enrolled
                </Typography>
              </Alert>
              <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                {departmentStudents.map((student) => (
                  <Box
                    key={student.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: "1px solid #e5e7eb",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "primary.main",
                        transform: "translateX(4px)"
                      }
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#4f46e5" }}>
                      {student.full_name?.charAt(0) || 'S'}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {student.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {student.student_id} • {student.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Year {student.year_level} • Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Chip 
                      label={student.status} 
                      size="small"
                      color={student.status === 'active' ? 'success' : 'default'}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStudentsModal(false)}>Close</Button>
          {departmentStudents.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => {
                const csv = [
                  ["Student ID", "Name", "Email", "Year", "Enrollment Date", "Status"],
                  ...departmentStudents.map(s => [
                    s.student_id, s.full_name, s.email, s.year_level, 
                    new Date(s.enrollment_date).toLocaleDateString(), s.status
                  ])
                ].map(row => row.join(",")).join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${selectedDept?.code}_students.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
            >
              Export List
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICATIONS */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ACTION MENU */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          handleViewDetails(selectedDept);
          setActionMenuAnchor(null);
        }}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          handleViewStudents(selectedDept);
          setActionMenuAnchor(null);
        }}>
          <SchoolIcon sx={{ mr: 1 }} fontSize="small" />
          View Students
        </MenuItem>
        <MenuItem onClick={() => {
          handleEditDept(selectedDept);
          setActionMenuAnchor(null);
        }}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          handleDeleteDepartment(selectedDept?.id);
          setActionMenuAnchor(null);
        }}>
          <DeleteIcon sx={{ mr: 1, color: "#ef4444" }} fontSize="small" />
          <Typography color="#ef4444">Delete</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}

// Component Mounting
const root = document.getElementById("app");
if (root) ReactDOM.createRoot(root).render(<DepartmentsPage />);

export default DepartmentsPage;