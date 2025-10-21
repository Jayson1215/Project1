// resources/js/components/Faculty.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../../sass/faculty.scss";
import axios from "axios";

// Material-UI Components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

// Material-UI Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
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
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";

function FacultyContent() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [newFaculty, setNewFaculty] = useState({
    faculty_id: "",
    full_name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    specialization: "",
    employment_type: "full-time",
    status: "active",
    hire_date: "",
    date_of_birth: "",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    qualifications: "",
    years_of_experience: "",
  });

  const mainMenuItems = [
    { label: "Dashboard", subtitle: "Overview & Analytics", icon: DashboardIcon, route: "/dashboard" },
    { label: "Users", subtitle: "User Management", icon: PeopleIcon, route: "/users" },
    { label: "Students", subtitle: "Student Records", icon: SchoolIcon, route: "/students" },
    { label: "Faculty", subtitle: "Faculty Management", icon: PersonIcon, route: "/faculty" },
    { label: "Courses", subtitle: "Course Catalog", icon: AssignmentIcon, route: "/courses" },
    { label: "Academic Years", subtitle: "Academic Periods", icon: CalendarMonthIcon, route: "/dashboard/academic-years" },
    { label: "Departments", subtitle: "Department Structure", icon: DashboardIcon, route: "/dashboard/departments" },
  ];

  const [activeMenu, setActiveMenu] = useState(() => {
    const p = window.location.pathname;
    const match = mainMenuItems.find((m) => m.route && p.startsWith(m.route));
    return match ? match.label : "Faculty";
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const extractData = (res) => {
    if (!res) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.data)) return res.data.data;
    return res.data ?? [];
  };

  const fetchFaculty = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/faculty");
      const raw = extractData(response);
      const facultyWithAvatars = raw.map((member) => ({
        ...member,
        full_name: member.full_name || member.name || "Unnamed",
        initials: (member.full_name || "U").charAt(0).toUpperCase(),
        avatarColor: getRandomColor(),
      }));
      setFaculty(facultyWithAvatars);
    } catch (err) {
      console.error("Error fetching faculty:", err);
      setError("Failed to load faculty. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      "#667eea", "#764ba2", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const stats = {
    total: faculty.length,
    active: faculty.filter((f) => f.status === "active").length,
    fullTime: faculty.filter((f) => f.employment_type === "full-time").length,
    partTime: faculty.filter((f) => f.employment_type === "part-time").length,
    contract: faculty.filter((f) => f.employment_type === "contract").length,
  };

  const handleLogout = async () => {
    try {
      await axios.post("/logout");
    } catch (err) {
      console.warn("logout error", err);
    } finally {
      window.location.href = "/login";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewFaculty((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingFaculty((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFaculty = async () => {
    if (
      !newFaculty.faculty_id ||
      !newFaculty.full_name ||
      !newFaculty.email ||
      !newFaculty.department ||
      !newFaculty.position ||
      !newFaculty.hire_date
    ) {
      setError("Please fill out all required fields!");
      return;
    }

    try {
      const response = await axios.post("/api/faculty", newFaculty, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201 || response.status === 200) {
        setSuccess("Faculty member added successfully!");
        setShowModal(false);
        setNewFaculty({
          faculty_id: "",
          full_name: "",
          email: "",
          phone: "",
          department: "",
          position: "",
          specialization: "",
          employment_type: "full-time",
          status: "active",
          hire_date: "",
          date_of_birth: "",
          address: "",
          emergency_contact: "",
          emergency_phone: "",
          qualifications: "",
          years_of_experience: "",
        });
        await fetchFaculty();
      } else {
        setError("Unexpected response from server. Please check your backend.");
      }
    } catch (err) {
      console.error("Error adding faculty:", err);
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(", ");
        setError(messages);
      } else {
        setError(err.response?.data?.message || "Failed to add faculty member. Please check your API connection.");
      }
    }
  };

  const handleEditFaculty = (member) => {
    setEditingFaculty({
      id: member.id,
      faculty_id: member.faculty_id,
      full_name: member.full_name,
      email: member.email,
      phone: member.phone || "",
      department: member.department || "",
      position: member.position || "",
      specialization: member.specialization || "",
      employment_type: member.employment_type || "full-time",
      status: member.status || "active",
      hire_date: member.hire_date || "",
      date_of_birth: member.date_of_birth || "",
      address: member.address || "",
      emergency_contact: member.emergency_contact || "",
      emergency_phone: member.emergency_phone || "",
      qualifications: member.qualifications || "",
      years_of_experience: member.years_of_experience || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateFaculty = async () => {
    if (
      !editingFaculty ||
      !editingFaculty.id ||
      !editingFaculty.faculty_id ||
      !editingFaculty.full_name ||
      !editingFaculty.email ||
      !editingFaculty.department ||
      !editingFaculty.position
    ) {
      setError("Please fill out all required fields!");
      return;
    }

    try {
      await axios.put(`/api/faculty/${editingFaculty.id}`, editingFaculty);
      setSuccess("Faculty member updated successfully!");
      await fetchFaculty();
      setShowEditModal(false);
      setEditingFaculty(null);
    } catch (err) {
      console.error("Error updating faculty:", err);
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(", ");
        setError(messages);
      } else {
        setError(err.response?.data?.message || "Failed to update faculty member. Please try again.");
      }
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty member? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`/api/faculty/${facultyId}`);
      setSuccess("Faculty member deleted successfully!");
      await fetchFaculty();
    } catch (err) {
      console.error("Error deleting faculty:", err);
      setError(err.response?.data?.message || "Failed to delete faculty member. Please try again.");
    }
  };

  const filteredFaculty = faculty.filter((member) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (member.full_name && member.full_name.toLowerCase().includes(q)) ||
      (member.faculty_id && member.faculty_id.toLowerCase().includes(q)) ||
      (member.email && member.email.toLowerCase().includes(q));
    const matchesDepartment = departmentFilter === "all" || (member.department === departmentFilter);
    const matchesStatus = statusFilter === "all" || (member.status === statusFilter);
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleExport = () => {
    const csvContent = [
      ["ID", "Faculty ID", "Name", "Email", "Department", "Position", "Employment Type", "Status", "Hire Date"],
      ...filteredFaculty.map((f) => [
        f.id,
        f.faculty_id,
        `"${(f.full_name || "").replace(/"/g, '""')}"`,
        f.email,
        f.department,
        f.position,
        f.employment_type,
        f.status,
        f.hire_date ?? "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faculty_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">E</div>
              <div className="logo-text">
                <h1>EduPortal</h1>
                <p>Academic Management</p>
              </div>
            </div>
          </div>
        </aside>
        <main className="main-content">
          <div className="content-area">
            <div className="loading">
              <div className="loading-spinner" />
              <p>Loading faculty members...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">E</div>
            <div className="logo-text">
              <h1>EduPortal</h1>
              <p>Academic Management</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">MAIN MENU</h3>
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === activeMenu;
              return (
                <a
                  key={item.label}
                  href={item.route || "#"}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveMenu(item.label)}
                >
                  <Icon className="nav-icon" />
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
          <a href="/settings" className="footer-item">
            <SettingsIcon />
            <span>Settings</span>
          </a>
          <a href="/help" className="footer-item">
            <HelpIcon />
            <span>Help</span>
          </a>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <h2 className="page-title">Faculty Management</h2>
          <div className="header-actions">
            <button className="header-btn">
              <span className="admin-badge">ADMIN</span>
            </button>
            <button className="header-btn notification-btn">
              <NotificationsIcon />
              <span className="notification-badge">4</span>
            </button>
            <div className="user-menu" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <div className="user-avatar">U</div>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <a href="/profile" className="dropdown-item">
                    <PersonIcon />
                    <span>Profile</span>
                  </a>
                  <a href="/settings" className="dropdown-item">
                    <SettingsIcon />
                    <span>Settings</span>
                  </a>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    <LogoutIcon />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content-area">
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
              <div className="stat-label">Total Faculty</div>
            </div>
            <div className="stat-card stat-active">
              <div className="stat-number">{stats.active}</div>
              <div className="stat-label">Active Faculty</div>
            </div>
            <div className="stat-card stat-fulltime">
              <div className="stat-number">{stats.fullTime}</div>
              <div className="stat-label">Full-Time</div>
            </div>
            <div className="stat-card stat-parttime">
              <div className="stat-number">{stats.partTime}</div>
              <div className="stat-label">Part-Time</div>
            </div>
            <div className="stat-card stat-contract">
              <div className="stat-number">{stats.contract}</div>
              <div className="stat-label">Contract</div>
            </div>
          </div>

          <div className="faculty-content-card">
            <div className="card-header">
              <h2>Faculty Management</h2>
            </div>

            <div className="filters-section">
              <div className="search-box">
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder="Search faculty by name, ID or email..."
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
                  <option value="Engineering">Engineering</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
                <select
                  className="employment-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                  <option value="retired">Retired</option>
                </select>
                <button className="btn-refresh" onClick={fetchFaculty} title="Refresh">
                  <RefreshIcon />
                </button>
                <button className="btn-export" onClick={handleExport}>
                  <FileDownloadIcon />
                  EXPORT
                </button>
                <button className="btn-add" onClick={() => setShowModal(true)}>
                  <AddIcon />
                  ADD FACULTY
                </button>
              </div>
            </div>

            <div className="faculty-table-wrapper">
              <table className="faculty-table">
                <thead>
                  <tr>
                    <th>FACULTY MEMBER</th>
                    <th>FACULTY ID</th>
                    <th>DEPARTMENT</th>
                    <th>POSITION</th>
                    <th>EMPLOYMENT</th>
                    <th>STATUS</th>
                    <th>HIRE DATE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFaculty.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-state">
                        <p>No faculty members found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredFaculty.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <div className="faculty-name-cell">
                            <div className="faculty-avatar" style={{ backgroundColor: member.avatarColor }}>
                              {member.initials}
                            </div>
                            <div className="faculty-info">
                              <div className="faculty-name">{member.full_name}</div>
                              <div className="faculty-email">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="faculty-id-badge">{member.faculty_id}</span>
                        </td>
                        <td>{member.department}</td>
                        <td>
                          <span className="position-badge">{member.position}</span>
                        </td>
                        <td>
                          <span className={`employment-badge employment-${member.employment_type}`}>
                            {member.employment_type}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${member.status}`}>{member.status}</span>
                        </td>
                        <td className="text-muted">
                          {member.hire_date ? new Date(member.hire_date).toLocaleDateString() : "N/A"}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon btn-edit" onClick={() => handleEditFaculty(member)} title="Edit faculty">
                              <EditIcon />
                            </button>
                            <button className="btn-icon btn-delete" onClick={() => handleDeleteFaculty(member.id)} title="Delete faculty">
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
                <span>Showing {filteredFaculty.length} of {faculty.length} faculty members</span>
              </div>
            </div>
          </div>

          {/* Add Faculty Modal - Material-UI Dialog */}
          <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>Add New Faculty Member</DialogTitle>
            <DialogContent>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
                <TextField
                  label="Faculty ID"
                  name="faculty_id"
                  value={newFaculty.faculty_id}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Full Name"
                  name="full_name"
                  value={newFaculty.full_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={newFaculty.email}
                  onChange={handleChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={newFaculty.phone}
                  onChange={handleChange}
                  fullWidth
                />
                <FormControl fullWidth required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={newFaculty.department}
                    label="Department"
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select department</MenuItem>
                    <MenuItem value="Computer Science">Computer Science</MenuItem>
                    <MenuItem value="Mathematics">Mathematics</MenuItem>
                    <MenuItem value="Engineering">Engineering</MenuItem>
                    <MenuItem value="Physics">Physics</MenuItem>
                    <MenuItem value="Chemistry">Chemistry</MenuItem>
                    <MenuItem value="Biology">Biology</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Position</InputLabel>
                  <Select
                    name="position"
                    value={newFaculty.position}
                    label="Position"
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select position</MenuItem>
                    <MenuItem value="Professor">Professor</MenuItem>
                    <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                    <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                    <MenuItem value="Lecturer">Lecturer</MenuItem>
                    <MenuItem value="Instructor">Instructor</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Specialization"
                  name="specialization"
                  value={newFaculty.specialization}
                  onChange={handleChange}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Employment Type</InputLabel>
                  <Select
                    name="employment_type"
                    value={newFaculty.employment_type}
                    label="Employment Type"
                    onChange={handleChange}
                  >
                    <MenuItem value="full-time">Full-Time</MenuItem>
                    <MenuItem value="part-time">Part-Time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Hire Date"
                  name="hire_date"
                  type="date"
                  value={newFaculty.hire_date}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={newFaculty.date_of_birth}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Emergency Contact Name"
                  name="emergency_contact"
                  value={newFaculty.emergency_contact}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Emergency Contact Phone"
                  name="emergency_phone"
                  value={newFaculty.emergency_phone}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Qualifications"
                  name="qualifications"
                  value={newFaculty.qualifications}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Years of Experience"
                  name="years_of_experience"
                  type="number"
                  value={newFaculty.years_of_experience}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  label="Address"
                  name="address"
                  value={newFaculty.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  sx={{ gridColumn: "1 / -1" }}
                />
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={newFaculty.status}
                    label="Status"
                    onChange={handleChange}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="on-leave">On Leave</MenuItem>
                    <MenuItem value="retired">Retired</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleAddFaculty} variant="contained">
                Add Faculty Member
              </Button>
            </DialogActions>
          </Dialog>

          {/* Edit Faculty Modal - Material-UI Dialog */}
          <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
            <DialogTitle>Edit Faculty Member</DialogTitle>
            <DialogContent>
              {editingFaculty && (
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
                  <TextField
                    label="Faculty ID"
                    name="faculty_id"
                    value={editingFaculty.faculty_id}
                    onChange={handleEditChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Full Name"
                    name="full_name"
                    value={editingFaculty.full_name}
                    onChange={handleEditChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={editingFaculty.email}
                    onChange={handleEditChange}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Phone Number"
                    name="phone"
                    value={editingFaculty.phone}
                    onChange={handleEditChange}
                    fullWidth
                  />
                  <FormControl fullWidth required>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department"
                      value={editingFaculty.department}
                      label="Department"
                      onChange={handleEditChange}
                    >
                      <MenuItem value="">Select department</MenuItem>
                      <MenuItem value="Computer Science">Computer Science</MenuItem>
                      <MenuItem value="Mathematics">Mathematics</MenuItem>
                      <MenuItem value="Engineering">Engineering</MenuItem>
                      <MenuItem value="Physics">Physics</MenuItem>
                      <MenuItem value="Chemistry">Chemistry</MenuItem>
                      <MenuItem value="Biology">Biology</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel>Position</InputLabel>
                    <Select
                      name="position"
                      value={editingFaculty.position}
                                            label="Position"
                      onChange={handleEditChange}
                    >
                      <MenuItem value="">Select position</MenuItem>
                      <MenuItem value="Professor">Professor</MenuItem>
                      <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                      <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                      <MenuItem value="Lecturer">Lecturer</MenuItem>
                      <MenuItem value="Instructor">Instructor</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Specialization"
                    name="specialization"
                    value={editingFaculty.specialization}
                    onChange={handleEditChange}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      name="employment_type"
                      value={editingFaculty.employment_type}
                      label="Employment Type"
                      onChange={handleEditChange}
                    >
                      <MenuItem value="full-time">Full-Time</MenuItem>
                      <MenuItem value="part-time">Part-Time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Hire Date"
                    name="hire_date"
                    type="date"
                    value={editingFaculty.hire_date}
                    onChange={handleEditChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={editingFaculty.date_of_birth}
                    onChange={handleEditChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Emergency Contact Name"
                    name="emergency_contact"
                    value={editingFaculty.emergency_contact}
                    onChange={handleEditChange}
                    fullWidth
                  />
                  <TextField
                    label="Emergency Contact Phone"
                    name="emergency_phone"
                    value={editingFaculty.emergency_phone}
                    onChange={handleEditChange}
                    fullWidth
                  />
                  <TextField
                    label="Qualifications"
                    name="qualifications"
                    value={editingFaculty.qualifications}
                    onChange={handleEditChange}
                    fullWidth
                  />
                  <TextField
                    label="Years of Experience"
                    name="years_of_experience"
                    type="number"
                    value={editingFaculty.years_of_experience}
                    onChange={handleEditChange}
                    fullWidth
                  />
                  <TextField
                    label="Address"
                    name="address"
                    value={editingFaculty.address}
                    onChange={handleEditChange}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ gridColumn: "1 / -1" }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={editingFaculty.status}
                      label="Status"
                      onChange={handleEditChange}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="on-leave">On Leave</MenuItem>
                      <MenuItem value="retired">Retired</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={handleUpdateFaculty} variant="contained">
                Update Faculty Member
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

// Mount component to DOM
document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("app");
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<FacultyContent />);
  }
});

export default FacultyContent;
