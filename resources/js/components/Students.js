// resources/js/components/Students.js
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "../../sass/students.scss";
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
      const response = await axios.get("http://127.0.0.1:8000/api/students")
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStudent = async () => {
  // Validate required fields
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
    // ✅ Ensure you use the full backend URL
    const response = await axios.post("http://127.0.0.1:8000/api/students", newStudent, {
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
        await fetchStudents(); // Refresh table
     } else {
        setError("Unexpected response from server. Please check your backend.");
     }
   } catch (error) {
     console.error("Error adding student:", error);

     if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join(", ");
        setError(errorMessages);
     } else {
        setError(
          error.response?.data?.message ||
           "Failed to add student. Please check your API connection."
        );
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
      setShowEditModal(false);
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

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-dialog modal-large">
            <div className="modal-header">
              <h3>Add New Student</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Student ID <span className="required">*</span></label>
                  <input
                    type="text"
                    name="student_id"
                    value={newStudent.student_id}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., STU001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="full_name"
                    value={newStudent.full_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={newStudent.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newStudent.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department <span className="required">*</span></label>
                  <select
                    name="department"
                    value={newStudent.department}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Year Level <span className="required">*</span></label>
                  <select
                    name="year_level"
                    value={newStudent.year_level}
                    onChange={handleChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Enrollment Date <span className="required">*</span></label>
                  <input
                    type="date"
                    name="enrollment_date"
                    value={newStudent.enrollment_date}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={newStudent.date_of_birth}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={newStudent.address}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Guardian Name</label>
                  <input
                    type="text"
                    name="guardian_name"
                    value={newStudent.guardian_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter guardian's name"
                  />
                </div>
                <div className="form-group">
                  <label>Guardian Phone</label>
                  <input
                    type="tel"
                    name="guardian_phone"
                    value={newStudent.guardian_phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter guardian's phone"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={newStudent.status}
                  onChange={handleChange}
                  className="form-input"
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
              <button className="btn-submit" onClick={handleAddStudent}>
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-dialog modal-large">
            <div className="modal-header">
              <h3>Edit Student</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Student ID <span className="required">*</span></label>
                  <input
                    type="text"
                    name="student_id"
                    value={editingStudent.student_id}
                    onChange={handleEditChange}
                    className="form-input"
                    placeholder="e.g., STU001"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="full_name"
                    value={editingStudent.full_name}
                    onChange={handleEditChange}
                    className="form-input"
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={editingStudent.email}
                    onChange={handleEditChange}
                    className="form-input"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editingStudent.phone}
                    onChange={handleEditChange}
                    className="form-input"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department <span className="required">*</span></label>
                  <select
                    name="department"
                    value={editingStudent.department}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Year Level <span className="required">*</span></label>
                  <select
                    name="year_level"
                    value={editingStudent.year_level}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Enrollment Date <span className="required">*</span></label>
                  <input
                    type="date"
                    name="enrollment_date"
                    value={editingStudent.enrollment_date}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editingStudent.date_of_birth}
                    onChange={handleEditChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={editingStudent.address}
                  onChange={handleEditChange}
                  className="form-input"
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Guardian Name</label>
                  <input
                    type="text"
                    name="guardian_name"
                    value={editingStudent.guardian_name}
                    onChange={handleEditChange}
                    className="form-input"
                    placeholder="Enter guardian's name"
                  />
                </div>
                <div className="form-group">
                  <label>Guardian Phone</label>
                  <input
                    type="tel"
                    name="guardian_phone"
                    value={editingStudent.guardian_phone}
                    onChange={handleEditChange}
                    className="form-input"
                    placeholder="Enter guardian's phone"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={editingStudent.status}
                  onChange={handleEditChange}
                  className="form-input"
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
              <button className="btn-submit" onClick={handleUpdateStudent}>
                Update Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Students() {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Students");
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
    { label: "Students", subtitle: "Student Records", icon: SchoolIcon, route: "/students" },
    { label: "Faculty", subtitle: "Faculty Management", icon: PersonIcon, route: null },
    { label: "Courses", subtitle: "Course Catalog", icon: AssignmentIcon, route: null },
    { label: "Academic Years", subtitle: "Academic Periods", icon: CalendarMonthIcon, route: null },
    { label: "Departments", subtitle: "Department Structure", icon: BusinessIcon, route: null },
  ];

  const bottomMenuItems = [
    { label: "Settings", icon: SettingsIcon, action: handleSettings },
    { label: "Help & Support", icon: HelpIcon, action: handleHelp },
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
          <StudentsContent />
        </Box>
      </Box>
    </Box>
  );
}

const root = document.getElementById("app");
if (root) ReactDOM.createRoot(root).render(<Students />);