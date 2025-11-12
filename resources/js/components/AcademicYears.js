"use client"

/**
 * Enhanced Academic Years Management with Full Student Integration
 *
 * KEY FEATURES:
 * ============
 * 1. Shows total students enrolled per academic year
 * 2. Displays breakdown by department and year level
 * 3. Student enrollment is clickable to view details
 * 4. Real-time synchronization with Students data
 * 5. Shows status (Active/Upcoming/Completed)
 * 6. Auto-fetches and displays all enrolled students
 */

import { useState, useEffect } from "react"
import axios from "axios"

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
  Card,
  CardContent,
  Alert,
  Snackbar,
  Collapse,
} from "@mui/material"

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard"
import PeopleIcon from "@mui/icons-material/People"
import SchoolIcon from "@mui/icons-material/School"
import PersonIcon from "@mui/icons-material/Person"
import AssignmentIcon from "@mui/icons-material/Assignment"
import BusinessIcon from "@mui/icons-material/Business"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import NotificationsIcon from "@mui/icons-material/Notifications"
import SettingsIcon from "@mui/icons-material/Settings"
import HelpIcon from "@mui/icons-material/Help"
import LogoutIcon from "@mui/icons-material/Logout"
import MenuIcon from "@mui/icons-material/Menu"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore"
import VisibilityIcon from "@mui/icons-material/Visibility"
import CloseIcon from "@mui/icons-material/Close"
import RefreshIcon from "@mui/icons-material/Refresh"
import EventIcon from "@mui/icons-material/Event"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

const drawerWidth = 260

function AcademicYearsPage() {
  // Core State
  const [academicYears, setAcademicYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Sidebar State
  const [settingsOpen, setSettingsOpen] = useState(true)

  // Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null)

  const [departments, setDepartments] = useState([])
  const [allStudents, setAllStudents] = useState([])
  const [loadingIntegration, setLoadingIntegration] = useState(false)

  // View Modals
  const [viewDetailsModal, setViewDetailsModal] = useState(false)
  const [viewDepartmentsModal, setViewDepartmentsModal] = useState(false)
  const [yearDepartments, setYearDepartments] = useState([])

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  // Form Data
  const [formData, setFormData] = useState({
    id: null,
    yearName: "",
    startDate: "",
    endDate: "",
    semesters: 2,
    currentSemester: "",
    totalStudents: 0,
    status: "upcoming",
  })

  const openMenu = Boolean(anchorEl)

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user")
    setUser(stored ? JSON.parse(stored) : { full_name: "System Administrator", role: "admin" })
  }, [])

  // Initial data load
  useEffect(() => {
    fetchIntegrationData()
  }, [])

  const fetchIntegrationData = async () => {
    setLoading(true)
    setLoadingIntegration(true)
    try {
      // Fetch all data in parallel
      const [yearsRes, departmentsRes, studentsRes] = await Promise.all([
        axios.get("/api/AcademicYears"),
        axios.get("/api/departments"),
        axios.get("/api/students"),
      ])

      // Process Academic Years
      const yearsList = yearsRes?.data?.success ? yearsRes.data.data : yearsRes?.data || []
      setAcademicYears(Array.isArray(yearsList) ? yearsList : [])

      // Process Departments
      const depts = departmentsRes.data.data || departmentsRes.data || []
      setDepartments(depts)

      const students = studentsRes.data.data || studentsRes.data || []
      const studentsWithYear = students.map((s) => {
        let year = s.academic_year || s.enrollmentYear || s.enrollment_year || s.yearName || ""

        if (!year && yearsList.length > 0) {
          const activeYear = yearsList.find((y) => y.status?.toLowerCase() === "active")
          year = activeYear?.yearName || ""
        }

        return {
          ...s,
          academic_year: year.trim(),
        }
      })

      setAllStudents(studentsWithYear)

      console.log("[v0] Integration data loaded:", {
        academicYears: yearsList.length,
        students: studentsWithYear.length,
        departments: depts.length,
      })

      setSnackbar({ open: true, message: "Data loaded successfully", severity: "success" })
    } catch (err) {
      console.error("[v0] Error fetching integration data:", err)
      setSnackbar({ open: true, message: "Failed to load data", severity: "error" })
      setAcademicYears([])
      setAllStudents([])
    } finally {
      setLoading(false)
      setLoadingIntegration(false)
    }
  }

  const getYearStudentsCount = (yearName) => {
    if (!yearName || !allStudents.length) return 0

    const normalizedYear = String(yearName).trim().toLowerCase()

    const matchingStudents = allStudents.filter((student) => {
      const studentYear = String(student.academic_year || "")
        .trim()
        .toLowerCase()
      return studentYear === normalizedYear && studentYear !== ""
    })

    console.log(`[v0] Year "${yearName}": ${matchingStudents.length} students`)

    return matchingStudents.length
  }

  // Get departments count for an academic year
  const getYearDepartmentsCount = (yearName) => {
    return departments.filter((d) => d.status?.toLowerCase() === "active").length
  }

  const getYearStudentDetails = (yearName) => {
    if (!yearName) return { total: 0, byDepartment: {}, byYearLevel: {} }

    const normalizedYear = String(yearName).trim().toLowerCase()

    const yearStudents = allStudents.filter((student) => {
      const studentYear = String(student.academic_year || "")
        .trim()
        .toLowerCase()
      return studentYear === normalizedYear
    })

    const byDepartment = {}
    yearStudents.forEach((student) => {
      const dept = student.department || "Undeclared"
      byDepartment[dept] = (byDepartment[dept] || 0) + 1
    })

    const byYearLevel = {}
    yearStudents.forEach((student) => {
      const level = student.year_level || student.yearLevel || "Unknown"
      byYearLevel[level] = (byYearLevel[level] || 0) + 1
    })

    return {
      total: yearStudents.length,
      byDepartment,
      byYearLevel,
      students: yearStudents,
    }
  }

  // Statistics
  const stats = {
    total: academicYears.length,
    active: academicYears.filter((y) => y.status?.toLowerCase() === "active").length,
    upcoming: academicYears.filter((y) => y.status?.toLowerCase() === "upcoming").length,
    completed: academicYears.filter((y) => y.status?.toLowerCase() === "completed").length,
    totalDepartments: departments.filter((d) => d.status?.toLowerCase() === "active").length,
    totalStudents: allStudents.length,
  }

  // Filtering & Pagination
  const filteredYears = academicYears.filter((year) => {
    const matchesSearch =
      year.yearName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      year.currentSemester?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || year.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredYears.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, filteredYears.length)
  const paginatedYears = filteredYears.slice(startIndex, endIndex)

  // Modal Handlers
  const handleViewDetails = (year) => {
    setSelectedYear(year)
    setViewDetailsModal(true)
  }

  const handleViewDepartments = (year) => {
    setSelectedYear(year)
    setViewDepartmentsModal(true)
    const depts = departments.filter((d) => d.status?.toLowerCase() === "active")
    setYearDepartments(depts)
  }

  const handleOpenModal = (year = null) => {
    if (year) {
      setFormData({
        id: year.id,
        yearName: year.yearName || "",
        startDate: year.startDate || "",
        endDate: year.endDate || "",
        semesters: year.semesters || 2,
        currentSemester: year.currentSemester || "",
        totalStudents: year.totalStudents || 0,
        status: year.status || "upcoming",
      })
    } else {
      let startYear = 2025
      let endYear = 2026

      if (academicYears.length > 0) {
        const yearNumbers = academicYears
          .map((ay) => {
            const match = ay.yearName?.match(/(\d{4})-(\d{4})/)
            return match ? Number.parseInt(match[2]) : null
          })
          .filter((y) => y !== null)

        if (yearNumbers.length > 0) {
          const latestYear = Math.max(...yearNumbers)
          startYear = latestYear
          endYear = latestYear + 1
        }
      }

      setFormData({
        id: null,
        yearName: `${startYear}-${endYear}`,
        startDate: `${startYear}-09-01`,
        endDate: `${endYear}-06-30`,
        semesters: 2,
        currentSemester: "Not Started",
        totalStudents: 0,
        status: "upcoming",
      })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setFormData({
      id: null,
      yearName: "",
      startDate: "",
      endDate: "",
      semesters: 2,
      currentSemester: "",
      totalStudents: 0,
      status: "upcoming",
    })
  }

  // CRUD Operations
  const handleSave = async () => {
    if (!formData.yearName || !formData.startDate || !formData.endDate) {
      setSnackbar({ open: true, message: "Year name, start date, and end date are required", severity: "error" })
      return
    }

    try {
      if (formData.id) {
        await axios.put(`/api/AcademicYears/${formData.id}`, formData)
        setSnackbar({ open: true, message: "Academic year updated successfully!", severity: "success" })
      } else {
        await axios.post("/api/AcademicYears", formData)
        setSnackbar({ open: true, message: "Academic year created successfully!", severity: "success" })
      }

      await fetchIntegrationData()
      handleCloseModal()
    } catch (error) {
      console.error("Error saving academic year:", error)
      const resp = error.response

      if (resp) {
        if (resp.status === 422) {
          const msgs = resp.data?.errors
          if (msgs) {
            const flattened = Array.isArray(msgs) ? msgs : Object.values(msgs).flat()
            setSnackbar({ open: true, message: flattened.join(", "), severity: "error" })
          } else {
            setSnackbar({ open: true, message: "Validation error. Please check your input.", severity: "error" })
          }
        } else {
          const serverMsg = resp.data?.message || resp.data?.error || "Unknown server error"
          setSnackbar({ open: true, message: serverMsg, severity: "error" })
        }
      } else {
        setSnackbar({ open: true, message: "Network error. Please check your connection.", severity: "error" })
      }
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this academic year?")) return

    try {
      await axios.delete(`/api/AcademicYears/${id}`)
      setSnackbar({ open: true, message: "Academic year deleted successfully!", severity: "success" })
      await fetchIntegrationData()
    } catch (error) {
      console.error("Error deleting academic year:", error)
      setSnackbar({ open: true, message: error.response?.data?.message || "Delete failed.", severity: "error" })
    }
  }

  // Event Handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "semesters" || name === "totalStudents" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleExport = async () => {
    try {
      const response = await axios.get("/api/AcademicYears/export", {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `academic_years_${new Date().getTime()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      setSnackbar({ open: true, message: "Academic years exported successfully", severity: "success" })
    } catch (error) {
      console.error("Error exporting academic years:", error)
      setSnackbar({ open: true, message: "Failed to export academic years", severity: "error" })
    }
  }

  const handleActionMenuOpen = (event, year) => {
    setActionMenuAnchor(event.currentTarget)
    setSelectedYear(year)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setSelectedYear(null)
  }

  const handleRefresh = async () => {
    setSnackbar({ open: true, message: "Refreshing data...", severity: "info" })
    await fetchIntegrationData()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Navigation & Logout
  const menuItems = [
    { label: "Dashboard", subtitle: "Overview & Analytics", icon: DashboardIcon, route: "/dashboard" },
    { label: "Users", subtitle: "User Management", icon: PeopleIcon, route: "/users" },
    { label: "Students", subtitle: "Student Records", icon: SchoolIcon, route: "/students" },
    { label: "Faculty", subtitle: "Faculty Management", icon: PersonIcon, route: "/faculty" },
    { label: "Courses", subtitle: "Course Catalog", icon: AssignmentIcon, route: "/courses" },
  ]

  const settingsItems = [
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

  const handleSettingsClick = () => {
    setSnackbar({ open: true, message: "Settings feature coming soon!", severity: "info" })
  }

  const handleHelp = () => {
    setSnackbar({ open: true, message: "Help & Support feature coming soon!", severity: "info" })
  }

  if (!user)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )

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
          sx={{
            p: 2,
            cursor: "pointer",
            borderBottom: "1px solid #e5e7eb",
          }}
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
                  onClick={() => item.route && (window.location.href = item.route)}
                  sx={{
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "#f3f4f6",
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

          {/* Settings Dropdown */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => setSettingsOpen(!settingsOpen)}
              sx={{
                borderRadius: 1,
                bgcolor: settingsOpen ? "#f3f4f6" : "transparent",
                "&:hover": {
                  bgcolor: "#f3f4f6",
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

          {/* Settings Submenu */}
          <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {settingsItems.map((item) => {
                const Icon = item.icon
                const isSelected = item.label === "Academic Years"
                return (
                  <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => item.route && (window.location.href = item.route)}
                      sx={{
                        borderRadius: 1,
                        pl: 6,
                        "&.Mui-selected": {
                          bgcolor: "#eef2ff",
                          color: "#4f46e5",
                          "& .MuiListItemIcon-root": { color: "#4f46e5" },
                        },
                        "&:hover": {
                          bgcolor: isSelected ? "#eef2ff" : "#f3f4f6",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Icon fontSize="small" />
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
            </List>
          </Collapse>
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <Box sx={{ p: 2, display: "flex", gap: 1, justifyContent: "center" }}>
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
          sx={{
            bgcolor: "white",
            color: "text.primary",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Toolbar>
            <IconButton sx={{ mr: 2, display: { sm: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Academic Years
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Academic Periods
              </Typography>
            </Box>

            <Chip
              icon={<SchoolIcon />}
              label={`${stats.totalStudents} Students`}
              size="small"
              sx={{ mr: 2 }}
              color="success"
            />
            <Chip
              icon={<BusinessIcon />}
              label={`${stats.totalDepartments} Departments`}
              size="small"
              sx={{ mr: 2 }}
              color="primary"
            />

            <Chip label={user.role || "Admin"} size="small" sx={{ mr: 1 }} />
            <IconButton sx={{ mr: 1 }}>
              <Badge badgeContent={4} color="error">
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
              <MenuItem onClick={handleSettingsClick}>
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
                  Total Academic Years
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: "#ecfdf5" }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#059669">
                  {stats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Years
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: "#eff6ff" }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#2563eb">
                  {stats.upcoming}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upcoming Years
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: "#fef3c7" }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#d97706">
                  {stats.totalStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Enrolled Students
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Page Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>
              Academic Years Management
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
                Refresh
              </Button>
              <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
                Export
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                Add Academic Year
              </Button>
            </Box>
          </Box>

          {/* Search and Filters Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr auto" }, gap: 2 }}>
                <TextField
                  placeholder="Search academic years..."
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
                  <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
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
                Loading academic years...
              </Typography>
            </Box>
          ) : (
            <>
              <Card>
                <Box sx={{ overflowX: "auto" }}>
                  {filteredYears.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: "center" }}>
                      <CalendarMonthIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No academic years found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || statusFilter
                          ? "Try adjusting your filters"
                          : 'Click "ADD ACADEMIC YEAR" to create your first academic year'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                      <Box component="thead">
                        <Box component="tr" sx={{ bgcolor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Year Name
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Start Date
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            End Date
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Semesters
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Current Semester
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Departments
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Students Enrolled
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
                        {paginatedYears.map((year) => {
                          const deptsCount = getYearDepartmentsCount(year.yearName)
                          const studentsCount = getYearStudentsCount(year.yearName)

                          return (
                            <Box
                              component="tr"
                              key={year.id}
                              sx={{
                                borderBottom: "1px solid #e5e7eb",
                                "&:hover": { bgcolor: "#f9fafb" },
                              }}
                            >
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Avatar sx={{ bgcolor: "#eef2ff", color: "#4f46e5", width: 32, height: 32 }}>
                                    <EventIcon fontSize="small" />
                                  </Avatar>
                                  <Typography fontWeight={600}>{year.yearName}</Typography>
                                </Box>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2">{formatDate(year.startDate)}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2">{formatDate(year.endDate)}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip label={year.semesters} size="small" variant="outlined" />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2">{year.currentSemester || "—"}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Button
                                  size="small"
                                  onClick={() => handleViewDepartments(year)}
                                  disabled={deptsCount === 0}
                                  sx={{
                                    minWidth: "auto",
                                    color: deptsCount > 0 ? "#4f46e5" : "text.disabled",
                                    "&:hover": { bgcolor: deptsCount > 0 ? "#f3f4f6" : "transparent" },
                                  }}
                                >
                                  <BusinessIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                                  {deptsCount}
                                </Button>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Chip
                                    icon={<SchoolIcon />}
                                    label={`${studentsCount} student${studentsCount !== 1 ? "s" : ""}`}
                                    size="small"
                                    variant="outlined"
                                    color={studentsCount > 0 ? "success" : "default"}
                                    onClick={() => studentsCount > 0 && handleViewDetails(year)}
                                    sx={{
                                      cursor: studentsCount > 0 ? "pointer" : "default",
                                      "&:hover": studentsCount > 0 ? { bgcolor: "#f0fdf4" } : {},
                                    }}
                                  />
                                  {studentsCount > 0 && (
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleViewDetails(year)}
                                      title="View student breakdown"
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip
                                  label={year.status}
                                  size="small"
                                  color={
                                    year.status?.toLowerCase() === "active"
                                      ? "success"
                                      : year.status?.toLowerCase() === "upcoming"
                                        ? "info"
                                        : "default"
                                  }
                                  sx={{ textTransform: "capitalize" }}
                                />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <IconButton size="small" color="info" onClick={() => handleViewDetails(year)}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="primary" onClick={() => handleOpenModal(year)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleDelete(year.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, year)}>
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
                {filteredYears.length > 0 && (
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
                        {startIndex + 1}-{endIndex} of {filteredYears.length}
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

      {/* ACTION MENU */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        <MenuItem
          onClick={() => {
            handleViewDetails(selectedYear)
            handleActionMenuClose()
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleViewDepartments(selectedYear)
            handleActionMenuClose()
          }}
        >
          <BusinessIcon sx={{ mr: 1 }} fontSize="small" />
          View Departments
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleOpenModal(selectedYear)
            handleActionMenuClose()
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleDelete(selectedYear?.id)
            handleActionMenuClose()
          }}
        >
          <DeleteIcon sx={{ mr: 1, color: "#ef4444" }} fontSize="small" />
          <Typography color="#ef4444">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* ADD/EDIT ACADEMIC YEAR MODAL */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonthIcon />
              {formData.id ? "Edit Academic Year" : "Add New Academic Year"}
            </Box>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, pt: 2 }}>
            <TextField
              label="Year Name"
              name="yearName"
              value={formData.yearName}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              helperText="e.g., 2024-2025"
            />
            <FormControl fullWidth required size="small">
              <InputLabel>Status</InputLabel>
              <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              InputLabelProps={{ shrink: true }}
              helperText="Academic year start date"
            />
            <TextField
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              InputLabelProps={{ shrink: true }}
              helperText="Academic year end date"
            />
            <TextField
              label="Number of Semesters"
              name="semesters"
              type="number"
              value={formData.semesters}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              inputProps={{ min: 1, max: 4 }}
              helperText="Typically 2 semesters per year"
            />
            <TextField
              label="Current Semester"
              name="currentSemester"
              value={formData.currentSemester}
              onChange={handleChange}
              fullWidth
              size="small"
              helperText="e.g., Fall 2024, Spring 2025"
            />
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              Tip: Set the status to "Upcoming" for future academic years, "Active" for the current year, and
              "Completed" for past years. Students will automatically appear when enrolled.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {formData.id ? "Update" : "Create"} Academic Year
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW DETAILS MODAL */}
      <Dialog open={viewDetailsModal} onClose={() => setViewDetailsModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonthIcon />
              <span>Academic Year Details & Student Enrollment</span>
            </Box>
            <IconButton onClick={() => setViewDetailsModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedYear && (
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom fontWeight={600}>
                    {selectedYear.yearName}
                  </Typography>
                  <Chip
                    label={selectedYear.status}
                    color={
                      selectedYear.status?.toLowerCase() === "active"
                        ? "success"
                        : selectedYear.status?.toLowerCase() === "upcoming"
                          ? "info"
                          : "default"
                    }
                    sx={{ mb: 2, textTransform: "capitalize" }}
                  />

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <EventIcon fontSize="small" /> Start Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(selectedYear.startDate)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <EventIcon fontSize="small" /> End Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(selectedYear.endDate)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Number of Semesters
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedYear.semesters} Semesters
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Current Semester
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedYear.currentSemester || "Not Started"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <BusinessIcon fontSize="small" /> Active Departments
                      </Typography>
                      <Typography variant="h6" color="primary.main" fontWeight={600}>
                        {getYearDepartmentsCount(selectedYear.yearName)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <SchoolIcon fontSize="small" /> Enrolled Students
                      </Typography>
                      <Typography variant="h6" color="success.main" fontWeight={600}>
                        {getYearStudentsCount(selectedYear.yearName)}
                      </Typography>
                    </Box>
                  </Box>

                  {(() => {
                    const studentDetails = getYearStudentDetails(selectedYear.yearName)
                    if (studentDetails.total > 0) {
                      return (
                        <>
                          <Divider sx={{ my: 3 }} />
                          <Typography variant="h6" gutterBottom fontWeight={600}>
                            Student Enrollment Breakdown
                          </Typography>

                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              By Department
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                              {Object.entries(studentDetails.byDepartment).map(([dept, count]) => (
                                <Chip
                                  key={dept}
                                  icon={<BusinessIcon />}
                                  label={`${dept}: ${count}`}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                            </Box>
                          </Box>

                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              By Year Level
                            </Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {Object.entries(studentDetails.byYearLevel).map(([level, count]) => (
                                <Chip
                                  key={level}
                                  label={`Year ${level}: ${count} student${count !== 1 ? "s" : ""}`}
                                  size="small"
                                  variant="outlined"
                                  color="info"
                                />
                              ))}
                            </Box>
                          </Box>
                        </>
                      )
                    }
                    return null
                  })()}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsModal(false)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<BusinessIcon />}
            onClick={() => {
              setViewDetailsModal(false)
              handleViewDepartments(selectedYear)
            }}
          >
            View Departments
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              setViewDetailsModal(false)
              handleOpenModal(selectedYear)
            }}
          >
            Edit Academic Year
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW DEPARTMENTS MODAL */}
      <Dialog open={viewDepartmentsModal} onClose={() => setViewDepartmentsModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BusinessIcon /> Departments in {selectedYear?.yearName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active departments operating in this academic year
              </Typography>
            </Box>
            <IconButton onClick={() => setViewDepartmentsModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingIntegration ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : yearDepartments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <BusinessIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No active departments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no active departments in this academic year yet.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  {yearDepartments.length} active department{yearDepartments.length !== 1 ? "s" : ""} in this academic
                  year
                </Typography>
              </Alert>
              <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                {yearDepartments.map((dept) => {
                  const counts = {
                    studentsCount: allStudents.filter((s) => s.department === dept.name).length,
                    facultyCount: 0,
                  }

                  return (
                    <Box
                      key={dept.id}
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
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      <Avatar sx={{ bgcolor: "#4f46e5", width: 48, height: 48 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {dept.name}
                          </Typography>
                          <Chip label={dept.code} size="small" variant="outlined" color="primary" />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {dept.description || "No description"}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                          >
                            <SchoolIcon sx={{ fontSize: "0.875rem" }} />
                            {counts.studentsCount} Students
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Building: {dept.building || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip label={dept.status} size="small" color="success" sx={{ textTransform: "capitalize" }} />
                    </Box>
                  )
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDepartmentsModal(false)}>Close</Button>
          {yearDepartments.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => {
                const csv = [
                  ["Code", "Name", "Description", "Building", "Students", "Status"],
                  ...yearDepartments.map((d) => {
                    const studentsCount = allStudents.filter((s) => s.department === d.name).length
                    return [
                      d.code,
                      `"${d.name}"`,
                      `"${d.description || "N/A"}"`,
                      d.building || "N/A",
                      studentsCount,
                      d.status,
                    ]
                  }),
                ]
                  .map((row) => row.join(","))
                  .join("\n")

                const blob = new Blob([csv], { type: "text/csv" })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${selectedYear?.yearName}_departments.csv`
                a.click()
                window.URL.revokeObjectURL(url)
                setSnackbar({ open: true, message: "Departments exported successfully", severity: "success" })
              }}
            >
              Export List
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<BusinessIcon />}
            onClick={() => {
              window.location.href = "/departments"
            }}
          >
            Manage Departments
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
    </Box>
  )
}

export default AcademicYearsPage
