"use client"

/**
 * Enhanced Faculty Management Component - Modern Design
 *
 * FEATURES:
 * =========
 * 1. Auto-generated Faculty IDs (FAC-0001 format)
 * 2. Department integration with filtering
 * 3. Course assignment tracking
 * 4. Modern Material-UI design matching Courses.js
 * 5. Responsive layout with proper spacing
 * 6. FIXED: Status normalization - inactive status now works correctly
 */

import { useState, useEffect } from "react"
import axios from "axios"
import { Autocomplete } from "@mui/material"
import ReactDOM from "react-dom/client"

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
  FormHelperText,
  Collapse,
} from "@mui/material"

// Icons
import SearchIcon from "@mui/icons-material/Search"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import RefreshIcon from "@mui/icons-material/Refresh"
import DashboardIcon from "@mui/icons-material/Dashboard"
import PeopleIcon from "@mui/icons-material/People"
import SchoolIcon from "@mui/icons-material/School"
import PersonIcon from "@mui/icons-material/Person"
import AssignmentIcon from "@mui/icons-material/Assignment"
import BusinessIcon from "@mui/icons-material/Business"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import NotificationsIcon from "@mui/icons-material/Notifications"
import LogoutIcon from "@mui/icons-material/Logout"
import SettingsIcon from "@mui/icons-material/Settings"
import HelpIcon from "@mui/icons-material/Help"
import VisibilityIcon from "@mui/icons-material/Visibility"
import CloseIcon from "@mui/icons-material/Close"
import LockIcon from "@mui/icons-material/Lock"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import FilterListIcon from "@mui/icons-material/FilterList"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import MenuIcon from "@mui/icons-material/Menu"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import WorkIcon from "@mui/icons-material/Work"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

const drawerWidth = 260

function FacultyPage() {
  // Core State
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Integration state
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Selected Data
  const [editingFaculty, setEditingFaculty] = useState(null)
  const [selectedFaculty, setSelectedFaculty] = useState(null)

  // Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  // New Faculty Form
  const [newFaculty, setNewFaculty] = useState({
    faculty_id: "",
    full_name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    hire_date: "",
    status: "active",
    course_id: null,
  })

  const [settingsOpen, setSettingsOpen] = useState(false)

  const openMenu = Boolean(anchorEl)

  // Generate next faculty ID
  const generateNextFacultyId = () => {
    if (faculty.length === 0) return "FAC-0001"

    const numericIds = faculty
      .map((f) => {
        const match = f.faculty_id?.match(/\d+/)
        return match ? Number.parseInt(match[0]) : 0
      })
      .filter((id) => !isNaN(id))

    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0
    const nextId = maxId + 1
    return `FAC-${String(nextId).padStart(4, "0")}`
  }

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user")
    setUser(stored ? JSON.parse(stored) : { full_name: "System Administrator", role: "admin" })
  }, [])

  // Initial data load
  useEffect(() => {
    fetchFaculty()
    fetchDepartments()
    fetchCourses()
  }, [])

  // Auto-generate faculty ID when modal opens
  useEffect(() => {
    if (showModal && !newFaculty.faculty_id) {
      const nextId = generateNextFacultyId()
      setNewFaculty((prev) => ({ ...prev, faculty_id: nextId }))
    }
  }, [showModal, faculty])

  // API Calls
  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/faculty")
      const facultyData = response.data.data || response.data || []
      
      // FIXED: normalize status values so filters and UI work reliably
      const normalizeStatus = (s) => {
        if (!s && s !== 0) return "inactive"
        const st = String(s).toLowerCase().trim()
        
        // Check for exact matches first
        if (st === "active") return "active"
        if (st === "inactive") return "inactive"
        if (st === "on_leave" || st === "on-leave" || st === "on leave" || st === "onleave" || st === "leave") return "on_leave"
        
        // Then check for partial matches - CRITICAL ORDER: Check "leave" BEFORE "active"
        if (st.includes("leave")) return "on_leave"
        if (st.includes("inactive")) return "inactive"
        if (st.includes("active")) return "active"
        
        // fallback: replace spaces/dashes with underscore
        return st.replace(/[\s-]+/g, "_")
      }

      const facultyWithAvatars = facultyData.map((member) => {
        const rawStatus = member.status ?? ""
        const normalized = normalizeStatus(rawStatus)
        // create a friendly display label
        const displayStatus = normalized === "on_leave" ? "On Leave" : normalized.charAt(0).toUpperCase() + normalized.slice(1)
        return {
          ...member,
          status: normalized,
          status_display: displayStatus,
          initials: member.full_name?.charAt(0).toUpperCase() || "F",
          avatarColor: getRandomColor(),
        }
      })
      setFaculty(facultyWithAvatars)
      setSnackbar({ open: true, message: "Faculty loaded successfully", severity: "success" })
    } catch (error) {
      console.error("Error fetching faculty:", error)
      setSnackbar({ open: true, message: "Failed to load faculty", severity: "error" })
      setFaculty([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const response = await axios.get("/api/departments")
      const data = response.data.success ? response.data.data : response.data
      const activeDepartments = data.filter((dept) => dept.status?.toLowerCase() === "active")
      setDepartments(activeDepartments)
    } catch (error) {
      console.error("Error fetching departments:", error)
      setDepartments([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  // fetch courses so we can pick a Course for a faculty member
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true)
      const res = await axios.get("/api/courses")
      const list = res?.data?.data || res?.data || []
      setCourses(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error("fetchCourses error:", err)
      setCourses([])
    } finally {
      setCoursesLoading(false)
    }
  }

  // Utility Functions
  const getRandomColor = () => {
    const colors = ["#667eea", "#764ba2", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getCoursesForFaculty = (facultyMember) => {
    if (!facultyMember.department) return []
    return courses.filter((course) => course.department_name?.toLowerCase() === facultyMember.department?.toLowerCase())
  }

  // Statistics
  const stats = {
    total: faculty.length,
    active: faculty.filter((f) => f.status === "active").length,
    inactive: faculty.filter((f) => f.status === "inactive").length,
    departments: [...new Set(faculty.map((f) => f.department))].filter(Boolean).length,
  }

  // Filtering & Pagination
  const filteredFaculty = faculty.filter((member) => {
    const matchesSearch =
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.faculty_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.course_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = !departmentFilter || member.department === departmentFilter
    const matchesStatus = !statusFilter || member.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const totalPages = Math.ceil(filteredFaculty.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, filteredFaculty.length)
  const paginatedFaculty = filteredFaculty.slice(startIndex, endIndex)

  // Modal Handlers
  const handleViewDetails = (member) => {
    setSelectedFaculty(member)
    setShowDetailsModal(true)
  }

  const handleOpenModal = () => {
    const nextId = generateNextFacultyId()
    setNewFaculty({
      faculty_id: nextId,
      full_name: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      hire_date: "",
      status: "active",
    })
    setShowModal(true)
  }

  const handleEditFaculty = (member) => {
    setEditingFaculty({ ...member, _original_course_id: member.course_id ?? null })
    setShowEditModal(true)
  }

  // Form Handlers
  const handleChange = (field, value) => {
    if (field === "department") {
      setNewFaculty((prev) => ({ ...prev, department: value, course_id: null }))
      return
    }
    setNewFaculty((prev) => ({ ...prev, [field]: value }))
  }

  const handleEditChange = (field, value) => {
    if (field === "department") {
      setEditingFaculty((prev) => ({ ...prev, department: value, course_id: null, _original_course_id: null }))
      return
    }
    setEditingFaculty((prev) => ({ ...prev, [field]: value }))
  }

  // assign/clear course immediately when selected in Edit modal
  const handleAssignCourse = async (newCourseId) => {
    const facultyId = editingFaculty?.id
    const oldCourseId = editingFaculty?._original_course_id ?? null

    if (!facultyId) {
      setSnackbar({ open: true, message: "Save the faculty record before assigning a course.", severity: "warning" })
      return
    }

    try {
      if (newCourseId && newCourseId !== oldCourseId) {
        await axios.put(`/api/courses/${newCourseId}`, { faculty_id: facultyId })
      }

      if (oldCourseId && oldCourseId !== newCourseId) {
        await axios.put(`/api/courses/${oldCourseId}`, { faculty_id: null })
      }

      setEditingFaculty((prev) => ({ ...prev, course_id: newCourseId, _original_course_id: newCourseId }))
      await Promise.all([fetchCourses(), fetchFaculty()])
      setSnackbar({ open: true, message: "Course assignment updated", severity: "success" })
    } catch (err) {
      console.error("Error assigning course:", err)
      setSnackbar({ open: true, message: "Failed to assign course", severity: "error" })
    }
  }

  // CRUD Operations
  const handleAddFaculty = async () => {
    if (
      !newFaculty.faculty_id ||
      !newFaculty.full_name ||
      !newFaculty.email ||
      !newFaculty.department ||
      !newFaculty.position
    ) {
      setSnackbar({ open: true, message: "Please fill out all required fields!", severity: "error" })
      return
    }

    if (!newFaculty.course_id) {
      setSnackbar({ open: true, message: "Please select an available course for this faculty.", severity: "error" })
      return
    }

    const selectedDept = departments.find((d) => d.name === newFaculty.department)
    if (!selectedDept) {
      setSnackbar({ open: true, message: "Please select a valid department", severity: "error" })
      return
    }

    try {
      const payload = {
        faculty_id: newFaculty.faculty_id,
        full_name: newFaculty.full_name,
        email: newFaculty.email,
        phone: newFaculty.phone || null,
        department: newFaculty.department,
        position: newFaculty.position,
        hire_date: newFaculty.hire_date || null,
        status: newFaculty.status || "active",
      }

      console.log("Submitting faculty data:", payload)

      const response = await axios.post("/api/faculty", payload)
      const created = response.data?.data || response.data || {}
      const createdId = created?.id ?? created?.ID ?? created?.Id ?? null

      if (newFaculty.course_id && createdId) {
        try {
          await axios.put(`/api/courses/${newFaculty.course_id}`, { faculty_id: createdId })
        } catch (assignErr) {
          console.error("Failed to assign course after creating faculty:", assignErr)
          setSnackbar({ open: true, message: "Faculty created but failed to assign course.", severity: "warning" })
        }
      }

      setSnackbar({ open: true, message: `Faculty ${newFaculty.faculty_id} added successfully!`, severity: "success" })
      setShowModal(false)
      await Promise.all([fetchFaculty(), fetchCourses()])
    } catch (error) {
      console.error("Error adding faculty:", error)
      console.error("Error response:", error.response?.data)

      if (error.response?.status === 422) {
        const errors = error.response.data?.errors || error.response.data?.message
        if (typeof errors === "object") {
          const errorMessages = Object.values(errors).flat().join(", ")
          setSnackbar({ open: true, message: errorMessages, severity: "error" })
        } else {
          setSnackbar({ open: true, message: errors || "Validation error", severity: "error" })
        }
      } else {
        const errorMsg = error.response?.data?.message || "Failed to add faculty"
        setSnackbar({ open: true, message: errorMsg, severity: "error" })
      }
    }
  }

  const handleUpdateFaculty = async () => {
    if (
      !editingFaculty.faculty_id ||
      !editingFaculty.full_name ||
      !editingFaculty.email ||
      !editingFaculty.department ||
      !editingFaculty.position
    ) {
      setSnackbar({ open: true, message: "Please fill out all required fields!", severity: "error" })
      return
    }

    if (!editingFaculty.course_id) {
      setSnackbar({ open: true, message: "Please assign a course for this faculty before saving.", severity: "error" })
      return
    }

    try {
      const res = await axios.put(`/api/faculty/${editingFaculty.id}`, editingFaculty)
      const updatedFaculty = res.data?.data || res.data || editingFaculty

      const newCourseId = editingFaculty.course_id ?? null
      const oldCourseId = editingFaculty._original_course_id ?? null

      try {
        if (newCourseId && newCourseId !== oldCourseId) {
          await axios.put(`/api/courses/${newCourseId}`, { faculty_id: updatedFaculty.id ?? editingFaculty.id })
        }

        if (oldCourseId && oldCourseId !== newCourseId) {
          await axios.put(`/api/courses/${oldCourseId}`, { faculty_id: null })
        }
      } catch (courseSyncError) {
        console.error("Course sync error:", courseSyncError)
      }

      setSnackbar({
        open: true,
        message: `Faculty ${editingFaculty.faculty_id} updated successfully!`,
        severity: "success",
      })

      await Promise.all([fetchFaculty(), fetchCourses()])
      setShowEditModal(false)
      setEditingFaculty(null)
    } catch (error) {
      console.error("Error updating faculty:", error)
      const errorMsg = error.response?.data?.message || "Failed to update faculty"
      setSnackbar({ open: true, message: errorMsg, severity: "error" })
    }
  }

  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?")) return

    try {
      await axios.delete(`/api/faculty/${facultyId}`)
      setSnackbar({ open: true, message: "Faculty deleted successfully!", severity: "success" })
      await fetchFaculty()
    } catch (error) {
      console.error("Error deleting faculty:", error)
      setSnackbar({ open: true, message: "Failed to delete faculty", severity: "error" })
    }
  }

  // Export & Refresh
  const handleExport = () => {
    const csvContent = [
      ["ID", "Faculty ID", "Name", "Email", "Phone", "Department", "Position", "Course ID", "Course Name", "Status", "Hire Date"],
      ...filteredFaculty.map((f) => [
        f.id,
        f.faculty_id,
        `"${f.full_name}"`,
        f.email,
        f.phone || "N/A",
        f.department,
        f.position,
        f.course_id || "N/A",
        `"${f.course_name || "N/A"}"`,
        f.status,
        f.hire_date || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `faculty_export_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setSnackbar({ open: true, message: "Faculty exported successfully", severity: "success" })
  }

  const handleRefresh = async () => {
    setSnackbar({ open: true, message: "Refreshing data...", severity: "info" })
    await Promise.all([fetchFaculty(), fetchDepartments(), fetchCourses()])
  }

  // Navigation
  const menuItems = [
    { label: "Dashboard", subtitle: "Overview & Analytics", icon: DashboardIcon, route: "/dashboard" },
    { label: "Users", subtitle: "User Management", icon: PeopleIcon, route: "/users" },
    { label: "Students", subtitle: "Student Records", icon: SchoolIcon, route: "/students" },
    { label: "Faculty", subtitle: "Faculty Management", icon: PersonIcon, route: "/faculty" },
    { label: "Courses", subtitle: "Course Catalog", icon: AssignmentIcon, route: "/courses" },
  ]

  const settingsMenuItems = [
    { label: "Academic Years", subtitle: "Academic Periods", icon: CalendarMonthIcon, route: "/AcademicYears" },
    { label: "Departments", subtitle: "Department Structure", icon: BusinessIcon, route: "/departments" },
  ]

  const handleLogout = async () => {
    try {
      await axios.post("/logout")
      localStorage.removeItem("user")
      window.location.href = "/login"
    } catch {
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
  }

  const handleSettings = () => {
    setSnackbar({ open: true, message: "Settings feature coming soon!", severity: "info" })
  }

  const handleHelp = () => {
    setSnackbar({ open: true, message: "Help & Support feature coming soon!", severity: "info" })
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex" }}>
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid #e5e7eb",
          },
        }}
      >
        <Box
          onClick={() => (window.location.href = "/dashboard")}
          sx={{ p: 2, cursor: "pointer", borderBottom: "1px solid #e5e7eb" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ bgcolor: "#4f46e5", width: 40, height: 40 }}>E</Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                EduPortal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Academic Management
              </Typography>
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

        <Typography sx={{ px: 2, py: 1, fontSize: "0.75rem", fontWeight: 600, color: "text.secondary" }}>
          MAIN MENU
        </Typography>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={item.label === "Faculty"}
                  onClick={() => item.route && (window.location.href = item.route)}
                  sx={{
                    borderRadius: 1,
                    "&.Mui-selected": {
                      bgcolor: "#eef2ff",
                      color: "#4f46e5",
                      "& .MuiListItemIcon-root": { color: "#4f46e5" },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.subtitle}
                    primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => setSettingsOpen(!settingsOpen)}
              sx={{
                borderRadius: 1,
                "&.Mui-selected": {
                  bgcolor: "#eef2ff",
                  color: "#4f46e5",
                  "& .MuiListItemIcon-root": { color: "#4f46e5" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                secondary="System Configuration"
                primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
                secondaryTypographyProps={{ fontSize: "0.75rem" }}
              />
              {settingsOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {settingsMenuItems.map((item) => {
                const Icon = item.icon
                return (
                  <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => item.route && (window.location.href = item.route)}
                      sx={{
                        pl: 4,
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "#f3f4f6",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Icon sx={{ fontSize: "1.25rem" }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.subtitle}
                        primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 500 }}
                        secondaryTypographyProps={{ fontSize: "0.7rem" }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Collapse>
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <Box sx={{ p: 2, display: "flex", gap: 1, justifyContent: "center" }}>
          <Button size="small" startIcon={<SettingsIcon />} onClick={handleSettings}>
            Settings
          </Button>
          <Button size="small" startIcon={<HelpIcon />} onClick={handleHelp}>
            Help
          </Button>
        </Box>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f9fafb", minHeight: "100vh" }}>
        {/* Top AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: "white", color: "text.primary", borderBottom: "1px solid #e5e7eb" }}
        >
          <Toolbar>
            <IconButton sx={{ mr: 2, display: { sm: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Faculty
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Faculty Management
              </Typography>
            </Box>

            <Chip
              icon={<BusinessIcon />}
              label={`${departments.length} Depts`}
              size="small"
              sx={{ mr: 1 }}
              color={departments.length > 0 ? "success" : "default"}
            />
            <Chip
              icon={<AssignmentIcon />}
              label={`${courses.length} Courses`}
              size="small"
              sx={{ mr: 2 }}
              color={courses.length > 0 ? "success" : "default"}
            />

            <Chip label={user.role || "Admin"} size="small" sx={{ mr: 1 }} />
            <IconButton sx={{ mr: 1 }}>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#4f46e5" }}>{user.full_name?.charAt(0) || "U"}</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={() => setAnchorEl(null)}
              onClick={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Avatar sx={{ bgcolor: "#4f46e5", mr: 1, width: 32, height: 32 }}>
                  {user.full_name?.charAt(0) || "U"}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {user.full_name || "User"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email || "user@example.com"}
                  </Typography>
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
                <LogoutIcon fontSize="small" sx={{ mr: 1, color: "#ef4444" }} />
                <Typography color="#ef4444" fontWeight={600}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: 3 }}>
          {/* Stats Cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2, mb: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Faculty
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: "#ecfdf5" }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#059669">
                  {stats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Faculty
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  {stats.departments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Departments
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: "#eff6ff" }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#2563eb">
                  {generateNextFacultyId()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Next Faculty ID
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Alerts */}
          {departments.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>No departments found!</strong> Please create departments first at{" "}
              <a href="/departments" style={{ color: "#f59e0b", textDecoration: "underline" }}>
                Departments page
              </a>
            </Alert>
          )}

          {/* Page Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>
              Faculty Management
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
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
                disabled={departments.length === 0}
              >
                Add Faculty
              </Button>
            </Box>
          </Box>

          {/* Search and Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr auto" }, gap: 2 }}>
                <TextField
                  placeholder="Search faculty..."
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
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    disabled={loadingDepartments}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.name}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BusinessIcon fontSize="small" />
                          {dept.name} ({dept.code})
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="on_leave">On Leave</MenuItem>
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
            <Box
              sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}
            >
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading faculty...
              </Typography>
            </Box>
          ) : (
            <>
              <Card>
                <Box sx={{ overflowX: "auto" }}>
                  {filteredFaculty.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: "center" }}>
                      <PersonIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No faculty found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || departmentFilter || statusFilter
                          ? "Try adjusting your filters"
                          : 'Click "ADD FACULTY" to create your first faculty member'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                      <Box component="thead">
                        <Box component="tr" sx={{ bgcolor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Faculty ID
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Name
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Email
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Department
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Position
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Phone
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Status
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Actions
                          </Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {paginatedFaculty.map((member) => {
                          const memberCourses = getCoursesForFaculty(member)

                          return (
                            <Box
                              component="tr"
                              key={member.id}
                              sx={{
                                borderBottom: "1px solid #e5e7eb",
                                "&:hover": { bgcolor: "#f9fafb" },
                              }}
                            >
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip label={member.faculty_id} size="small" variant="outlined" color="primary" />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {member.full_name}
                                </Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {member.email}
                                </Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2">{member.department || "N/A"}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2">{member.position || "N/A"}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {member.phone || "N/A"}
                                </Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip
                                  label={member.status_display || member.status}
                                  size="small"
                                  color={
                                    member.status === "active"
                                      ? "success"
                                      : member.status === "on_leave"
                                        ? "warning"
                                        : "default"
                                  }
                                />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <IconButton size="small" color="info" onClick={() => handleViewDetails(member)}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="primary" onClick={() => handleEditFaculty(member)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleDeleteFaculty(member.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      setActionMenuAnchor(e.currentTarget)
                                      setSelectedFaculty(member)
                                    }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          )
                        })}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Pagination */}
                {filteredFaculty.length > 0 && (
                  <Box
                    sx={{
                      p: 2,
                      borderTop: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Rows per page:
                      </Typography>
                      <Select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(e.target.value)
                          setCurrentPage(1)
                        }}
                        size="small"
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                      <Typography variant="body2" color="text.secondary">
                        {startIndex + 1}-{endIndex} of {filteredFaculty.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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

      {/* ADD FACULTY MODAL */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon />
            Add New Faculty
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
            <TextField
              label="Faculty ID"
              value={newFaculty.faculty_id}
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
              sx={{ "& .MuiInputBase-root": { backgroundColor: "#f9fafb" } }}
            />
            <TextField
              label="Full Name"
              value={newFaculty.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              type="email"
              value={newFaculty.email}
              onChange={(e) => handleChange("email", e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Phone Number"
              value={newFaculty.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Department</InputLabel>
              <Select
                value={newFaculty.department}
                label="Department"
                onChange={(e) => handleChange("department", e.target.value)}
                disabled={loadingDepartments || departments.length === 0}
              >
                <MenuItem value="">
                  <em>Select department</em>
                </MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.name}>
                    <Box>
                      <strong>{dept.name}</strong>
                      <Box component="span" sx={{ ml: 1, color: "text.secondary", fontSize: "0.875rem" }}>
                        ({dept.code})
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {departments.length === 0 ? (
                  <span style={{ color: "#f59e0b" }}>
                    ⚠️ No departments found. <a href="/departments">Create departments</a> first.
                  </span>
                ) : (
                  `${departments.length} active departments available`
                )}
              </FormHelperText>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Position</InputLabel>
              <Select
                value={newFaculty.position}
                label="Position"
                onChange={(e) => handleChange("position", e.target.value)}
              >
                <MenuItem value="">Select position</MenuItem>
                <MenuItem value="Professor">Professor</MenuItem>
                <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                <MenuItem value="Lecturer">Lecturer</MenuItem>
                <MenuItem value="Instructor">Instructor</MenuItem>
                <MenuItem value="Teaching Assistant">Teaching Assistant</MenuItem>
              </Select>
            </FormControl>

            <Autocomplete
              options={courses.filter(
                (c) =>
                  newFaculty?.department &&
                  c.department_name?.toLowerCase() === newFaculty.department?.toLowerCase()
              )}
              getOptionLabel={(c) => (c ? `${c.course_code || ""} ${c.course_name || ""}`.trim() : "")}
              value={courses.find((c) => c.id === newFaculty.course_id) || null}
              disableClearable
              onChange={(_, value) => setNewFaculty((prev) => ({ ...prev, course_id: value ? value.id : null }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assigned Course (required)"
                  fullWidth
                  helperText={
                    newFaculty?.department
                      ? `Choose a course from ${newFaculty.department}`
                      : "Select the faculty's department first"
                  }
                  required
                />
              )}
            />
            <TextField
              label="Hire Date"
              type="date"
              value={newFaculty.hire_date}
              onChange={(e) => handleChange("hire_date", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={newFaculty.status} label="Status" onChange={(e) => handleChange("status", e.target.value)}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleAddFaculty} variant="contained" disabled={departments.length === 0}>
            Add Faculty
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT FACULTY MODAL */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon />
            Edit Faculty
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editingFaculty && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
              <TextField
                label="Full Name"
                value={editingFaculty.full_name}
                onChange={(e) => handleEditChange("full_name", e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Email Address"
                type="email"
                value={editingFaculty.email}
                onChange={(e) => handleEditChange("email", e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Phone Number"
                value={editingFaculty.phone}
                onChange={(e) => handleEditChange("phone", e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={editingFaculty.department}
                  label="Department"
                  onChange={(e) => handleEditChange("department", e.target.value)}
                  disabled={loadingDepartments || departments.length === 0}
                >
                  <MenuItem value="">
                    <em>Select department</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      <Box>
                        <strong>{dept.name}</strong>
                        <Box component="span" sx={{ ml: 1, color: "text.secondary", fontSize: "0.875rem" }}>
                          ({dept.code})
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Position</InputLabel>
                <Select
                  value={editingFaculty.position}
                  label="Position"
                  onChange={(e) => handleEditChange("position", e.target.value)}
                >
                  <MenuItem value="">Select position</MenuItem>
                  <MenuItem value="Professor">Professor</MenuItem>
                  <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                  <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                  <MenuItem value="Lecturer">Lecturer</MenuItem>
                  <MenuItem value="Instructor">Instructor</MenuItem>
                  <MenuItem value="Teaching Assistant">Teaching Assistant</MenuItem>
                </Select>
              </FormControl>
              <Autocomplete
                options={courses.filter(
                  (c) =>
                    editingFaculty?.department &&
                    c.department_name?.toLowerCase() === editingFaculty.department?.toLowerCase()
                )}
                getOptionLabel={(c) => (c ? `${c.course_code || ""} ${c.course_name || ""}`.trim() : "")}
                value={courses.find((c) => c.id === editingFaculty.course_id) || null}
                disableClearable
                onChange={async (_, value) => {
                  const newId = value ? value.id : null
                  handleEditChange("course_id", newId)
                  await handleAssignCourse(newId)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assigned Course (required)"
                    fullWidth
                    helperText={
                      editingFaculty?.department
                        ? `Choose a course from ${editingFaculty.department}`
                        : "Select the faculty's department first"
                    }
                    required
                  />
                )}
              />
              <TextField
                label="Hire Date"
                type="date"
                value={editingFaculty.hire_date}
                onChange={(e) => handleEditChange("hire_date", e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingFaculty.status}
                  label="Status"
                  onChange={(e) => handleEditChange("status", e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="on_leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateFaculty} variant="contained" disabled={!editingFaculty?.course_id}>
            Update Faculty
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW DETAILS MODAL */}
      <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon />
              <span>Faculty Details</span>
            </Box>
            <IconButton onClick={() => setShowDetailsModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedFaculty && (
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: selectedFaculty.avatarColor,
                        width: 64,
                        height: 64,
                        fontSize: "1.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {selectedFaculty.initials}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h5" fontWeight={600}>
                        {selectedFaculty.full_name}
                      </Typography>
                      <Chip label={selectedFaculty.faculty_id} size="small" color="primary" sx={{ mt: 0.5 }} />
                    </Box>
                    <Chip
                      label={selectedFaculty.status_display || selectedFaculty.status}
                      color={
                        selectedFaculty.status === "active"
                          ? "success"
                          : selectedFaculty.status === "on_leave"
                            ? "warning"
                            : "default"
                      }
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <EmailIcon fontSize="small" /> Email
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedFaculty.email}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <PhoneIcon fontSize="small" /> Phone
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedFaculty.phone || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <BusinessIcon fontSize="small" /> Department
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedFaculty.department || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <WorkIcon fontSize="small" /> Position
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedFaculty.position || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Course
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedFaculty.course_name || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Hire Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedFaculty.hire_date ? new Date(selectedFaculty.hire_date).toLocaleDateString() : "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Available Courses ({getCoursesForFaculty(selectedFaculty).length})
                  </Typography>
                  {getCoursesForFaculty(selectedFaculty).length === 0 ? (
                    <Box textAlign="center" py={2}>
                      <AssignmentIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No courses available in {selectedFaculty.department}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                      {getCoursesForFaculty(selectedFaculty).map((course, index) => (
                        <Box
                          key={course.id}
                          sx={{
                            p: 1.5,
                            borderBottom:
                              index < getCoursesForFaculty(selectedFaculty).length - 1 ? "1px solid #e5e7eb" : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              p: 1,
                              borderRadius: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <AssignmentIcon fontSize="small" />
                          </Box>
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600}>
                              {course.course_code} - {course.course_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {course.credits ? `${course.credits} credits` : "No credits"} • Semester{" "}
                              {course.semester || "N/A"}
                            </Typography>
                          </Box>
                          <Chip
                            label={course.status}
                            size="small"
                            color={course.status === "active" ? "success" : "default"}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
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
              setShowDetailsModal(false)
              handleEditFaculty(selectedFaculty)
            }}
          >
            Edit Faculty
          </Button>
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
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={() => setActionMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            handleViewDetails(selectedFaculty)
            setActionMenuAnchor(null)
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleEditFaculty(selectedFaculty)
            setActionMenuAnchor(null)
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleDeleteFaculty(selectedFaculty?.id)
            setActionMenuAnchor(null)
          }}
        >
          <DeleteIcon sx={{ mr: 1, color: "#ef4444" }} fontSize="small" />
          <Typography color="#ef4444">Delete</Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
}

// Component Mounting
document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("app")
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(<FacultyPage />)
  }
})

export default FacultyPage