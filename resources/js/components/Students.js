// resources/js/components/Students.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../../sass/students.scss";
import axios from "axios";

// Material-UI Components
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

// Material-UI Icons
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

function StudentsContent() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newStudent, setNewStudent] = useState({
    student_id: "",
    full_name: "",
    email: "",
    phone: "",
    department: "",
    year_level: "",
    status: "active",
    enrollment_date: "",
    date_of_birth: "",
    address: "",
    guardian_name: "",
    guardian_phone: "",
  });

  useEffect(() => {
    fetchStudents();
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

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/students");
      const studentsWithAvatars = response.data.map(student => ({
        ...student,
        initials: student.full_name.charAt(0).toUpperCase(),
        avatarColor: getRandomColor()
      }));
      setStudents(studentsWithAvatars);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = ["#667eea", "#764ba2", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === "active").length,
    firstYear: students.filter(s => s.year_level === 1).length,
    secondYear: students.filter(s => s.year_level === 2).length,
    thirdYear: students.filter(s => s.year_level === 3).length,
    fourthYear: students.filter(s => s.year_level === 4).length,
  };

  const handleChange = (field, value) => {
    setNewStudent((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditChange = (field, value) => {
    setEditingStudent((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddStudent = async () => {
    if (
      !newStudent.student_id ||
      !newStudent.full_name ||
      !newStudent.email ||
      !newStudent.department ||
      !newStudent.year_level ||
      !newStudent.enrollment_date
    ) {
      setError("Please fill out all required fields!");
      return;
    }

    try {
      const response = await axios.post("/api/students", newStudent, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess("Student added successfully!");
        setShowModal(false);
        setNewStudent({
          student_id: "",
          full_name: "",
          email: "",
          phone: "",
          department: "",
          year_level: "",
          status: "active",
          enrollment_date: "",
          date_of_birth: "",
          address: "",
          guardian_name: "",
          guardian_phone: "",
        });
        await fetchStudents();
      } else {
        setError("Unexpected response from server. Please check your backend.");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(", ");
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || "Failed to add student. Please check your API connection.");
      }
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent({
      id: student.id,
      student_id: student.student_id,
      full_name: student.full_name,
      email: student.email,
      phone: student.phone || "",
      department: student.department,
      year_level: student.year_level,
      status: student.status,
      enrollment_date: student.enrollment_date,
      date_of_birth: student.date_of_birth || "",
      address: student.address || "",
      guardian_name: student.guardian_name || "",
      guardian_phone: student.guardian_phone || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent.student_id || !editingStudent.full_name || !editingStudent.email || 
        !editingStudent.department || !editingStudent.year_level) {
      setError("Please fill out all required fields!");
      return;
    }

    try {
      await axios.put(`/api/students/${editingStudent.id}`, editingStudent);
      setSuccess("Student updated successfully!");
      await fetchStudents();
      setShowEditModal(false);
      setEditingStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || "Failed to update student. Please try again.");
      }
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`/api/students/${studentId}`);
      setSuccess("Student deleted successfully!");
      await fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      setError(error.response?.data?.message || "Failed to delete student. Please try again.");
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || student.department === departmentFilter;
    const matchesYear = yearFilter === "all" || student.year_level === parseInt(yearFilter);
    return matchesSearch && matchesDepartment && matchesYear;
  });

  const handleExport = () => {
    const csvContent = [
      ["ID", "Student ID", "Name", "Email", "Department", "Year", "Status", "Enrollment Date"],
      ...filteredStudents.map(s => [
        s.id,
        s.student_id,
        `"${s.full_name}"`,
        s.email,
        s.department,
        `${s.year_level}${s.year_level === 1 ? 'st' : s.year_level === 2 ? 'nd' : s.year_level === 3 ? 'rd' : 'th'} Year`,
        s.status,
        s.enrollment_date
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getYearDisplay = (level) => {
    const years = {
      1: "1st Year",
      2: "2nd Year",
      3: "3rd Year",
      4: "4th Year"
    };
    return years[level] || "N/A";
  };

  if (loading) {
    return (
      <div className="students-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="students-page">
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
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card stat-active">
          <div className="stat-number">{stats.active}</div>
          <div className="stat-label">Active Students</div>
        </div>
        <div className="stat-card stat-first">
          <div className="stat-number">{stats.firstYear}</div>
          <div className="stat-label">1st Year</div>
        </div>
        <div className="stat-card stat-second">
          <div className="stat-number">{stats.secondYear}</div>
          <div className="stat-label">2nd Year</div>
        </div>
        <div className="stat-card stat-third">
          <div className="stat-number">{stats.thirdYear}</div>
          <div className="stat-label">3rd Year</div>
        </div>
        <div className="stat-card stat-fourth">
          <div className="stat-number">{stats.fourthYear}</div>
          <div className="stat-label">4th Year</div>
        </div>
      </div>

      <div className="students-content-card">
        <div className="card-header">
          <h2>Students Management</h2>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search students by name, ID or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <select
              className="department-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Engineering">Engineering</option>
              <option value="Business">Business</option>
            </select>
            <select
              className="year-filter"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
            <button className="btn-refresh" onClick={fetchStudents} title="Refresh">
              <RefreshIcon />
            </button>
            <button className="btn-export" onClick={handleExport}>
              <FileDownloadIcon />
              EXPORT
            </button>
            <button className="btn-add" onClick={() => setShowModal(true)}>
              <AddIcon />
              ADD STUDENT
            </button>
          </div>
        </div>

        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>STUDENT ID</th>
                <th>DEPARTMENT</th>
                <th>YEAR</th>
                <th>STATUS</th>
                <th>ENROLLMENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <p>No students found</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="student-name-cell">
                        <div
                          className="student-avatar"
                          style={{ backgroundColor: student.avatarColor }}
                        >
                          {student.initials}
                        </div>
                        <div className="student-info">
                          <div className="student-name">{student.full_name}</div>
                          <div className="student-email">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="student-id-badge">{student.student_id}</span>
                    </td>
                    <td>{student.department}</td>
                    <td>
                      <span className="year-badge">
                        {getYearDisplay(student.year_level)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="text-muted">
                      {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : "N/A"}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon btn-edit" 
                          onClick={() => handleEditStudent(student)}
                          title="Edit student"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => handleDeleteStudent(student.id)}
                          title="Delete student"
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
            <span>Showing {filteredStudents.length} of {students.length} students</span>
          </div>
        </div>
      </div>

      {/* Add Student Modal - Material-UI Dialog */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
            <TextField
              label="Student ID"
              value={newStudent.student_id}
              onChange={(e) => handleChange("student_id", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Full Name"
              value={newStudent.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              type="email"
              value={newStudent.email}
              onChange={(e) => handleChange("email", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              value={newStudent.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              fullWidth
            />
            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                value={newStudent.department}
                label="Department"
                onChange={(e) => handleChange("department", e.target.value)}
              >
                <MenuItem value="">Select department</MenuItem>
                <MenuItem value="Computer Science">Computer Science</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Year Level</InputLabel>
              <Select
                value={newStudent.year_level}
                label="Year Level"
                onChange={(e) => handleChange("year_level", e.target.value)}
              >
                <MenuItem value="">Select year</MenuItem>
                <MenuItem value="1">1st Year</MenuItem>
                <MenuItem value="2">2nd Year</MenuItem>
                <MenuItem value="3">3rd Year</MenuItem>
                <MenuItem value="4">4th Year</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Enrollment Date"
              type="date"
              value={newStudent.enrollment_date}
              onChange={(e) => handleChange("enrollment_date", e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={newStudent.date_of_birth}
              onChange={(e) => handleChange("date_of_birth", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Guardian Name"
              value={newStudent.guardian_name}
              onChange={(e) => handleChange("guardian_name", e.target.value)}
              fullWidth
            />
            <TextField
              label="Guardian Phone"
              value={newStudent.guardian_phone}
              onChange={(e) => handleChange("guardian_phone", e.target.value)}
              fullWidth
            />
            <TextField
              label="Address"
              value={newStudent.address}
              onChange={(e) => handleChange("address", e.target.value)}
              fullWidth
              multiline
              rows={3}
              sx={{ gridColumn: "1 / -1" }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStudent.status}
                label="Status"
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleAddStudent} variant="contained">
            Add Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Student Modal - Material-UI Dialog */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Student</DialogTitle>
        <DialogContent>
          {editingStudent && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
              <TextField
                label="Student ID"
                value={editingStudent.student_id}
                onChange={(e) => handleEditChange("student_id", e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Full Name"
                value={editingStudent.full_name}
                onChange={(e) => handleEditChange("full_name", e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Email Address"
                type="email"
                value={editingStudent.email}
                onChange={(e) => handleEditChange("email", e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Phone Number"
                value={editingStudent.phone}
                onChange={(e) => handleEditChange("phone", e.target.value)}
                fullWidth
              />
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={editingStudent.department}
                  label="Department"
                  onChange={(e) => handleEditChange("department", e.target.value)}
                >
                  <MenuItem value="">Select department</MenuItem>
                  <MenuItem value="Computer Science">Computer Science</MenuItem>
                  <MenuItem value="Mathematics">Mathematics</MenuItem>
                  <MenuItem value="Physics">Physics</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Year Level</InputLabel>
                <Select
                  value={editingStudent.year_level}
                  label="Year Level"
                  onChange={(e) => handleEditChange("year_level", e.target.value)}
                >
                  <MenuItem value="">Select year</MenuItem>
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  <MenuItem value="3">3rd Year</MenuItem>
                  <MenuItem value="4">4th Year</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Enrollment Date"
                type="date"
                value={editingStudent.enrollment_date}
                onChange={(e) => handleEditChange("enrollment_date", e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Date of Birth"
                type="date"
                value={editingStudent.date_of_birth}
                onChange={(e) => handleEditChange("date_of_birth", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Guardian Name"
                value={editingStudent.guardian_name}
                onChange={(e) => handleEditChange("guardian_name", e.target.value)}
                fullWidth
              />
              <TextField
                label="Guardian Phone"
                value={editingStudent.guardian_phone}
                onChange={(e) => handleEditChange("guardian_phone", e.target.value)}
                fullWidth
              />
              <TextField
                label="Address"
                value={editingStudent.address}
                onChange={(e) => handleEditChange("address", e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{ gridColumn: "1 / -1" }}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingStudent.status}
                  label="Status"
                  onChange={(e) => handleEditChange("status", e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="graduated">Graduated</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateStudent} variant="contained">
            Update Student
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default function Students() {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Students");
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

  if (!user) return null;

  const mainMenuItems = [
    { label: "Dashboard", subtitle: "Overview & Analytics", icon: DashboardIcon, route: "/dashboard" },
    { label: "Users", subtitle: "User Management", icon: PeopleIcon, route: "/users" },
    { label: "Students", subtitle: "Student Records", icon: SchoolIcon, route: "/students" },
    { label: "Faculty", subtitle: "Faculty Management", icon: PersonIcon, route: "/faculty" },
    { label: "Courses", subtitle: "Course Catalog", icon: AssignmentIcon, route: "/courses" },
    { label: "Academic Years", subtitle: "Academic Periods", icon: CalendarMonthIcon, route: "/academic-years" },
    { label: "Departments", subtitle: "Department Structure", icon: BusinessIcon, route: "/departments" },
  ];

  return (
    <Box className="students-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header" onClick={() => window.location.href = "/dashboard"} style={{ cursor: 'pointer' }}>
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

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">MAIN MENU</div>
            {mainMenuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeMenu === item.label;
              return (
                <a
                  key={item.label}
                  href={item.route || "#"}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={(e) => {
                    if (!item.route) {
                      e.preventDefault();
                      setActiveMenu(item.label);
                    }
                  }}
                >
                  <IconComponent className="nav-icon" />
                  <div className="nav-text">
                    <span className="nav-title">{item.label}</span>
                    <span className="nav-subtitle">{item.subtitle}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="footer-links">
            <button className="footer-link">
              <SettingsIcon />
              Settings
            </button>
            <span className="footer-divider">·</span>
            <button className="footer-link">
              <HelpIcon />
              Help & Support
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div>
            <h2 className="page-title">Students</h2>
            <span className="page-subtitle">Student Records</span>
          </div>

          <div className="header-actions">
            <Chip label={user.role?.toUpperCase() || "ADMIN"} size="small" className="user-role-chip" />

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
                <Box display="flex" flexDirection="column">
                  <strong>{user.full_name}</strong>
                  <small className="text-muted">{user.role}</small>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose}>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} /> Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Logout
              </MenuItem>
            </Menu>
          </div>
        </header>

        {/* Students Main Content */}
        <div className="content-body">
          <StudentsContent />
        </div>
      </main>
    </Box>
  );
}

// Mount React Component
document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("app");
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<Students />);
  }
});