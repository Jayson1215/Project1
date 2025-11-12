"use client"

import { useState, useEffect } from "react"
import "../../sass/students.scss"
import axios from "axios"

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
  ListSubheader,
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
import EventIcon from "@mui/icons-material/Event"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import WarningIcon from "@mui/icons-material/Warning"

const drawerWidth = 260

export default function StudentsPage() {
  // Core State
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCoursesModal, setShowCoursesModal] = useState(false)

  // Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")
  const [academicYearFilter, setAcademicYearFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Integration State
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false)

  // Selected Data
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentCourses, setStudentCourses] = useState([])
  const [loadingStudentCourses, setLoadingStudentCourses] = useState(false)

  // Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  // New Student Form
  const [newStudent, setNewStudent] = useState({
    student_id: "",
    full_name: "",
    email: "",
    phone: "",
    department: "",
    year_level: "",
    academic_year: "",
    selected_courses: [],
    status: "active",
    enrollment_date: "",
    date_of_birth: "",
    address: "",
    guardian_name: "",
    guardian_phone: "",
  })

  const openMenu = Boolean(anchorEl)

  const generateNextStudentId = () => {
    if (students.length === 0) return "STUD-0001"

    const numericIds = students
      .map((s) => {
        const match = s.student_id?.match(/\d+/)
        return match ? Number.parseInt(match[0]) : 0
      })
      .filter((id) => !isNaN(id))

    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0
    return `STUD-${String(maxId + 1).padStart(4, "0")}`
  }

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user")
    setUser(stored ? JSON.parse(stored) : { full_name: "System Administrator", role: "admin" })
  }, [])

  // Initial data load
  useEffect(() => {
    fetchStudents()
    fetchDepartments()
    fetchCourses()
    fetchAcademicYears()
  }, [])

  useEffect(() => {
    if (academicYears.length > 0 && students.length > 0) {
      const activeYear = academicYears.find((y) => y.status?.toLowerCase() === "active")

      if (activeYear) {
        const needsUpdate = students.some((s) => !s.academic_year || s.academic_year.trim() === "")

        if (needsUpdate) {
          const updatedStudents = students.map((student) => {
            if (!student.academic_year || student.academic_year.trim() === "") {
              return { ...student, academic_year: activeYear.yearName }
            }
            return student
          })
          setStudents(updatedStudents)
        }
      }
    }
  }, [academicYears, students])

  // Auto-generate student ID when modal opens
  useEffect(() => {
    if (showModal && !newStudent.student_id) {
      const nextId = generateNextStudentId()
      const activeYear = academicYears.find((y) => y.status?.toLowerCase() === "active")

      setNewStudent((prev) => ({
        ...prev,
        student_id: nextId,
        academic_year: activeYear?.yearName || "",
      }))
    }
  }, [showModal, students, academicYears])

  // API Calls
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/students")
      const studentsData = response.data.data || response.data || []

      const studentsWithAvatars = studentsData.map((student) => ({
        ...student,
        initials: student.full_name?.charAt(0).toUpperCase() || "S",
        avatarColor: getRandomColor(),
      }))

      setStudents(studentsWithAvatars)
      setSnackbar({ open: true, message: "Students loaded successfully", severity: "success" })
    } catch (error) {
      console.error("Error fetching students:", error)
      setSnackbar({ open: true, message: "Failed to load students", severity: "error" })
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const response = await axios.get("/api/departments")
      const data = response.data.success ? response.data.data : response.data
      setDepartments(data.filter((dept) => dept.status?.toLowerCase() === "active"))
    } catch (error) {
      console.error("Error fetching departments:", error)
      setDepartments([])
    } finally {
      setLoadingDepartments(false)
    }
  }

  const fetchCourses = async () => {
    setLoadingCourses(true)
    try {
      const response = await axios.get("/api/courses")
      const data = response.data.data || response.data || []
      setCourses(Array.isArray(data) ? data.filter((c) => c.status?.toLowerCase() === "active") : [])
    } catch (error) {
      console.error("Error fetching courses:", error)
      setCourses([])
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchAcademicYears = async () => {
    setLoadingAcademicYears(true)
    try {
      const response = await axios.get("/api/AcademicYears")
      const data = response.data.success ? response.data.data : response.data || []
      setAcademicYears(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching academic years:", error)
      setAcademicYears([])
    } finally {
      setLoadingAcademicYears(false)
    }
  }

  // Utility Functions
  const getRandomColor = () => {
    const colors = ["#667eea", "#764ba2", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  const getAvailableCourses = (department, yearLevel) => {
    if (!department) return []

    return courses.filter((course) => {
      const deptMatch = course.department_name?.toLowerCase() === department?.toLowerCase()
      const yearMatch = course.year_level ? Number.parseInt(course.year_level) === Number.parseInt(yearLevel) : true
      return deptMatch && yearMatch
    })
  }

  const getCoursesForStudent = (student) => {
    if (!student.department || !student.year_level) return []
    return getAvailableCourses(student.department, student.year_level)
  }

  const getYearDisplay = (level) => {
    const years = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" }
    return years[level] || "N/A"
  }

  const getAcademicYearColor = (yearName) => {
    const year = academicYears.find((y) => y.yearName === yearName)
    if (!year) return "default"

    switch (year.status?.toLowerCase()) {
      case "active":
        return "success"
      case "upcoming":
        return "info"
      case "completed":
        return "default"
      default:
        return "default"
    }
  }

  // Statistics
  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    inactive: students.filter((s) => s.status === "inactive").length,
    departments: [...new Set(students.map((s) => s.department))].length,
    currentYear: academicYears.find((y) => y.status?.toLowerCase() === "active")?.yearName || "N/A",
  }

  // Filtering & Pagination
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = !departmentFilter || student.department === departmentFilter
    const matchesYear = !yearFilter || student.year_level === Number.parseInt(yearFilter)
    const matchesAcademicYear = !academicYearFilter || student.academic_year === academicYearFilter

    return matchesSearch && matchesDepartment && matchesYear && matchesAcademicYear
  })

  const rowsPerPageNum = typeof rowsPerPage === "string" ? Number.parseInt(rowsPerPage) : rowsPerPage
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPageNum)
  const startIndex = (currentPage - 1) * rowsPerPageNum
  const endIndex = Math.min(startIndex + rowsPerPageNum, filteredStudents.length)
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  // Modal Handlers
  const handleViewCourses = (student) => {
    setSelectedStudent(student)
    setLoadingStudentCourses(true)
    const availableCourses = getCoursesForStudent(student)
    setStudentCourses(availableCourses)
    setLoadingStudentCourses(false)
    setShowCoursesModal(true)
  }

  const handleOpenModal = () => {
    const nextId = generateNextStudentId()
    const activeYear = academicYears.find((y) => y.status?.toLowerCase() === "active")

    setNewStudent({
      student_id: nextId,
      full_name: "",
      email: "",
      phone: "",
      department: "",
      year_level: "",
      academic_year: activeYear?.yearName || "",
      selected_courses: [],
      status: "active",
      enrollment_date: "",
      date_of_birth: "",
      address: "",
      guardian_name: "",
      guardian_phone: "",
    })
    setShowModal(true)
  }

  const handleEditStudent = (student) => {
    const academicYearToUse =
      student.academic_year && student.academic_year.trim() !== ""
        ? student.academic_year
        : academicYears.find((y) => y.status?.toLowerCase() === "active")?.yearName || ""

    setEditingStudent({
      ...student,
      academic_year: academicYearToUse,
      selected_courses: student.selected_courses || [],
    })
    setShowEditModal(true)
  }

  // Form Handlers
  const handleChange = (field, value) => {
    setNewStudent((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === "department" || field === "year_level") {
        updated.selected_courses = []
      }
      return updated
    })
  }

  const handleEditChange = (field, value) => {
    setEditingStudent((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === "department" || field === "year_level") {
        updated.selected_courses = []
      }
      return updated
    })
  }

  // CRUD Operations
  const handleAddStudent = async () => {
    // Validation
    if (
      !newStudent.student_id ||
      !newStudent.full_name ||
      !newStudent.email ||
      !newStudent.department ||
      !newStudent.year_level ||
      !newStudent.enrollment_date ||
      !newStudent.academic_year
    ) {
      setSnackbar({
        open: true,
        message: "Please fill out all required fields including Academic Year!",
        severity: "error",
      })
      return
    }

    const selectedDept = departments.find((d) => d.name === newStudent.department)
    if (!selectedDept) {
      setSnackbar({ open: true, message: "Please select a valid department", severity: "error" })
      return
    }

    try {
      const studentData = {
        student_id: newStudent.student_id,
        full_name: newStudent.full_name,
        email: newStudent.email,
        phone: newStudent.phone || "",
        department: newStudent.department,
        year_level: newStudent.year_level,
        academic_year: newStudent.academic_year,
        selected_courses: newStudent.selected_courses || [],
        status: newStudent.status || "active",
        enrollment_date: newStudent.enrollment_date,
        date_of_birth: newStudent.date_of_birth || "",
        address: newStudent.address || "",
        guardian_name: newStudent.guardian_name || "",
        guardian_phone: newStudent.guardian_phone || "",
      }

      const response = await axios.post("/api/students", studentData)

      setSnackbar({
        open: true,
        message: `Student ${newStudent.student_id} added successfully to ${newStudent.academic_year}!`,
        severity: "success",
      })

      if (window.addNotification) {
        window.addNotification(
          "student",
          "New Student Added",
          `${newStudent.full_name} (${newStudent.student_id}) enrolled in ${newStudent.department} for ${newStudent.academic_year}`,
        )
      }

      setShowModal(false)
      await fetchStudents()
    } catch (error) {
      console.error("Error adding student:", error)
      const errorMsg = error.response?.data?.message || "Failed to add student"
      setSnackbar({ open: true, message: errorMsg, severity: "error" })
    }
  }

  const handleUpdateStudent = async () => {
    if (
      !editingStudent.student_id ||
      !editingStudent.full_name ||
      !editingStudent.email ||
      !editingStudent.department ||
      !editingStudent.year_level ||
      !editingStudent.academic_year
    ) {
      setSnackbar({
        open: true,
        message: "Please fill out all required fields including Academic Year!",
        severity: "error",
      })
      return
    }

    try {
      const updateData = {
        student_id: editingStudent.student_id,
        full_name: editingStudent.full_name,
        email: editingStudent.email,
        phone: editingStudent.phone || "",
        department: editingStudent.department,
        year_level: editingStudent.year_level,
        academic_year: editingStudent.academic_year,
        selected_courses: editingStudent.selected_courses || [],
        status: editingStudent.status,
        enrollment_date: editingStudent.enrollment_date,
        date_of_birth: editingStudent.date_of_birth || "",
        address: editingStudent.address || "",
        guardian_name: editingStudent.guardian_name || "",
        guardian_phone: editingStudent.guardian_phone || "",
      }

      await axios.put(`/api/students/${editingStudent.id}`, updateData)

      setSnackbar({
        open: true,
        message: `Student ${editingStudent.student_id} updated successfully!`,
        severity: "success",
      })

      await fetchStudents()
      setShowEditModal(false)
      setEditingStudent(null)
    } catch (error) {
      console.error("Error updating student:", error)
      const errorMsg = error.response?.data?.message || "Failed to update student"
      setSnackbar({ open: true, message: errorMsg, severity: "error" })
    }
  }

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return

    try {
      await axios.delete(`/api/students/${studentId}`)
      setSnackbar({ open: true, message: "Student deleted successfully!", severity: "success" })
      await fetchStudents()
    } catch (error) {
      console.error("Error deleting student:", error)
      setSnackbar({ open: true, message: "Failed to delete student", severity: "error" })
    }
  }

  // Export & Refresh
  const handleExport = () => {
    const csvContent = [
      [
        "ID",
        "Student ID",
        "Name",
        "Email",
        "Department",
        "Year",
        "Academic Year",
        "Available Courses",
        "Status",
        "Enrollment Date",
      ],
      ...filteredStudents.map((s) => {
        const coursesCount = getCoursesForStudent(s).length
        return [
          s.id,
          s.student_id,
          `"${s.full_name}"`,
          s.email,
          s.department,
          getYearDisplay(s.year_level),
          s.academic_year || "N/A",
          coursesCount,
          s.status,
          s.enrollment_date,
        ]
      }),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `students_export_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setSnackbar({ open: true, message: "Students exported successfully", severity: "success" })
  }

  const handleRefresh = async () => {
    setSnackbar({ open: true, message: "Refreshing data...", severity: "info" })
    await Promise.all([fetchStudents(), fetchDepartments(), fetchCourses(), fetchAcademicYears()])
  }

  // Navigation
  const mainMenuItems = [
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

  // </CHANGE> The following function has been updated to reflect changes in handling missing academic years.
  // const handleUpdateMissingAcademicYears = async () => {
  //   try {
  //     setLoading(true)
  //     const activeYear = academicYears.find((y) => y.status?.toLowerCase() === "active")

  //     if (!activeYear) {
  //       setSnackbar({
  //         open: true,
  //         message: "No active academic year found to assign to students",
  //         severity: "error",
  //       })
  //       setLoading(false)
  //       return
  //     }

  //     const studentsToUpdate = students.filter((s) => !s.academic_year || s.academic_year.trim() === "")

  //     if (studentsToUpdate.length === 0) {
  //       setSnackbar({
  //         open: true,
  //         message: "All students already have an academic year assigned",
  //         severity: "info",
  //       })
  //       setLoading(false)
  //       return
  //     }

  //     const updatedStudents = students.map((student) => {
  //       if (!student.academic_year || student.academic_year.trim() === "") {
  //         return { ...student, academic_year: activeYear.yearName }
  //       }
  //       return student
  //     })

  //     setStudents(updatedStudents)

  //     setSnackbar({
  //       open: true,
  //       message: `Successfully updated ${studentsToUpdate.length} students with academic year: ${activeYear.yearName}`,
  //       severity: "success",
  //     })
  //   } catch (error) {
  //     console.error("Error updating academic years:", error)
  //     setSnackbar({
  //       open: true,
  //       message: "Failed to update academic years for students",
  //       severity: "error",
  //     })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

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
          {mainMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={item.label === "Students"}
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
              selected={false}
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
                      selected={false}
                      onClick={() => item.route && (window.location.href = item.route)}
                      sx={{
                        pl: 4,
                        borderRadius: 1,
                        "&.Mui-selected": {
                          bgcolor: "#eef2ff",
                          color: "#4f46e5",
                          "& .MuiListItemIcon-root": { color: "#4f46e5" },
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
                Students
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Student Records
              </Typography>
            </Box>

            <Chip icon={<CalendarMonthIcon />} label={stats.currentYear} size="small" sx={{ mr: 1 }} color="success" />
            <Chip
              icon={<BusinessIcon />}
              label={`${departments.length} Depts`}
              size="small"
              sx={{ mr: 1 }}
              color={departments.length > 0 ? "primary" : "default"}
            />
            <Chip
              icon={<AssignmentIcon />}
              label={`${courses.length} Courses`}
              size="small"
              sx={{ mr: 2 }}
              color={courses.length > 0 ? "info" : "default"}
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
                  Total Students
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: "#ecfdf5" }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#059669">
                  {stats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Students
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <CalendarMonthIcon color="primary" />
                  <Typography variant="h6" fontWeight={700} color="#2563eb">
                    {stats.currentYear}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Current Academic Year
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

          {academicYears.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>No academic years found!</strong> Please create academic years first at{" "}
              <a href="/AcademicYears" style={{ color: "#f59e0b", textDecoration: "underline" }}>
                Academic Years page
              </a>
            </Alert>
          )}

          {students.length > 0 && students.some((s) => !s.academic_year || s.academic_year.trim() === "") && (
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  // onClick={handleUpdateMissingAcademicYears} // REMOVED: Auto-assignment now happens on page load
                  disabled={academicYears.length === 0}
                >
                  FIX
                </Button>
              }
            >
              <strong>⚠️ Some students are missing an Academic Year!</strong> They have been automatically assigned to
              the active academic year on page load.
            </Alert>
          )}

          {/* Page Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" fontWeight={700}>
              Students Management
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
                Add Student
              </Button>
            </Box>
          </Box>

          {/* Search and Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr auto" }, gap: 2 }}>
                <TextField
                  placeholder="Search students..."
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
                  <InputLabel>Academic Year</InputLabel>
                  <Select
                    value={academicYearFilter}
                    label="Academic Year"
                    onChange={(e) => setAcademicYearFilter(e.target.value)}
                    disabled={loadingAcademicYears}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    {academicYears.map((year) => (
                      <MenuItem key={year.id} value={year.yearName}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                          <EventIcon fontSize="small" />
                          <span>{year.yearName}</span>
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
                            sx={{ ml: "auto", textTransform: "capitalize" }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                  <InputLabel>Year Level</InputLabel>
                  <Select value={yearFilter} label="Year Level" onChange={(e) => setYearFilter(e.target.value)}>
                    <MenuItem value="">All Years</MenuItem>
                    <MenuItem value="1">1st Year</MenuItem>
                    <MenuItem value="2">2nd Year</MenuItem>
                    <MenuItem value="3">3rd Year</MenuItem>
                    <MenuItem value="4">4th Year</MenuItem>
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
                Loading students...
              </Typography>
            </Box>
          ) : (
            <>
              <Card>
                <Box sx={{ overflowX: "auto" }}>
                  {filteredStudents.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: "center" }}>
                      <SchoolIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No students found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || departmentFilter || yearFilter || academicYearFilter
                          ? "Try adjusting your filters"
                          : 'Click "ADD STUDENT" to create your first student'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                      <Box component="thead">
                        <Box component="tr" sx={{ bgcolor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Student
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Student ID
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Department
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Year
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Academic Year
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Courses
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Status
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Enrollment
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Actions
                          </Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {paginatedStudents.map((student) => {
                          const availableCourses = getCoursesForStudent(student)

                          return (
                            <Box
                              component="tr"
                              key={student.id}
                              sx={{
                                borderBottom: "1px solid #e5e7eb",
                                "&:hover": { bgcolor: "#f9fafb" },
                              }}
                            >
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                  <Avatar
                                    sx={{
                                      bgcolor: student.avatarColor,
                                      width: 40,
                                      height: 40,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {student.initials}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {student.full_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {student.email}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip label={student.student_id} size="small" variant="outlined" />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <BusinessIcon sx={{ fontSize: "1rem", color: "text.secondary" }} />
                                  <Typography variant="body2">{student.department}</Typography>
                                </Box>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip label={getYearDisplay(student.year_level)} size="small" variant="outlined" />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                {student.academic_year && student.academic_year.trim() !== "" ? (
                                  <Chip
                                    icon={<EventIcon />}
                                    label={student.academic_year}
                                    size="small"
                                    color={getAcademicYearColor(student.academic_year)}
                                  />
                                ) : (
                                  <Chip
                                    icon={<WarningIcon />}
                                    label="Not Assigned"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    sx={{ cursor: "pointer" }}
                                    onClick={() => {
                                      if (academicYears.length > 0) {
                                        const activeYear = academicYears.find(
                                          (y) => y.status?.toLowerCase() === "active",
                                        )
                                        if (activeYear) {
                                          setEditingStudent({
                                            ...student,
                                            academic_year: activeYear.yearName,
                                            selected_courses: student.selected_courses || [],
                                          })
                                          setShowEditModal(true)
                                        }
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Button
                                  size="small"
                                  onClick={() => handleViewCourses(student)}
                                  disabled={availableCourses.length === 0}
                                  sx={{
                                    minWidth: "auto",
                                    color: availableCourses.length > 0 ? "#4f46e5" : "text.disabled",
                                    "&:hover": { bgcolor: availableCourses.length > 0 ? "#f3f4f6" : "transparent" },
                                  }}
                                >
                                  <AssignmentIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                                  {availableCourses.length}
                                </Button>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Chip
                                  label={student.status}
                                  size="small"
                                  color={student.status === "active" ? "success" : "default"}
                                />
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {student.enrollment_date
                                    ? new Date(student.enrollment_date).toLocaleDateString()
                                    : "N/A"}
                                </Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <IconButton size="small" color="info" onClick={() => handleViewCourses(student)}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="primary" onClick={() => handleEditStudent(student)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteStudent(student.id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      setActionMenuAnchor(e.currentTarget)
                                      setSelectedStudent(student)
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
                {filteredStudents.length > 0 && (
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
                          setRowsPerPage(Number.parseInt(e.target.value))
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
                        {startIndex + 1}-{endIndex} of {filteredStudents.length}
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

      {/* ADD STUDENT MODAL */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon />
            Add New Student
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
            <TextField
              label="Student ID"
              value={newStudent.student_id}
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
              value={newStudent.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={newStudent.academic_year}
                label="Academic Year"
                onChange={(e) => handleChange("academic_year", e.target.value)}
                disabled={loadingAcademicYears || academicYears.length === 0}
              >
                <MenuItem value="">
                  <em>Select academic year</em>
                </MenuItem>
                {academicYears.map((year) => (
                  <MenuItem key={year.id} value={year.yearName}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                      <EventIcon fontSize="small" />
                      <span>{year.yearName}</span>
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
                        sx={{ ml: "auto", textTransform: "capitalize" }}
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {academicYears.length === 0 ? (
                  <span style={{ color: "#f59e0b" }}>
                    ⚠️ No academic years found. <a href="/AcademicYears">Create academic years</a> first.
                  </span>
                ) : (
                  `${academicYears.length} academic year${academicYears.length !== 1 ? "s" : ""} available`
                )}
              </FormHelperText>
            </FormControl>

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

            <FormControl
              fullWidth
              sx={{ gridColumn: "1 / -1" }}
              disabled={!newStudent.department || !newStudent.year_level || loadingCourses}
            >
              <InputLabel>Available Courses (Optional)</InputLabel>
              <Select
                multiple
                value={newStudent.selected_courses}
                label="Available Courses (Optional)"
                onChange={(e) => handleChange("selected_courses", e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((courseId) => {
                      const course = courses.find((c) => c.id === courseId)
                      return (
                        <Chip
                          key={courseId}
                          label={course?.course_code || courseId}
                          size="small"
                          icon={<AssignmentIcon />}
                        />
                      )
                    })}
                  </Box>
                )}
              >
                {!newStudent.department || !newStudent.year_level ? (
                  <MenuItem value="" disabled>
                    <em>Please select department and year level first</em>
                  </MenuItem>
                ) : (
                  (() => {
                    const availableCourses = getAvailableCourses(newStudent.department, newStudent.year_level)

                    if (availableCourses.length === 0) {
                      return (
                        <MenuItem value="" disabled>
                          <em>
                            No courses available for {newStudent.department} (Year {newStudent.year_level})
                          </em>
                        </MenuItem>
                      )
                    }

                    return [
                      <ListSubheader key="header">
                        {availableCourses.length} course{availableCourses.length !== 1 ? "s" : ""} available
                      </ListSubheader>,
                      ...availableCourses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          <Box display="flex" alignItems="center" gap={1} width="100%">
                            <AssignmentIcon fontSize="small" color="primary" />
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={600}>
                                {course.course_code} - {course.course_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {course.credits ? `${course.credits} credits` : "No credits"} • Semester{" "}
                                {course.semester || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      )),
                    ]
                  })()
                )}
              </Select>
              <FormHelperText>
                {!newStudent.department || !newStudent.year_level ? (
                  <span style={{ color: "#f59e0b" }}>⚠️ Select department and year level to see available courses</span>
                ) : getAvailableCourses(newStudent.department, newStudent.year_level).length === 0 ? (
                  <span style={{ color: "#f59e0b" }}>
                    No courses found. <a href="/courses">Create courses</a>
                  </span>
                ) : (
                  <span style={{ color: "#10b981" }}>
                    ✓ {getAvailableCourses(newStudent.department, newStudent.year_level).length} courses available
                  </span>
                )}
              </FormHelperText>
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
              <Select value={newStudent.status} label="Status" onChange={(e) => handleChange("status", e.target.value)}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              💡 <strong>Tip:</strong> Student will be automatically linked to the selected academic year. The
              enrollment date should fall within the academic year's date range.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
          <Button
            onClick={handleAddStudent}
            variant="contained"
            disabled={departments.length === 0 || academicYears.length === 0}
          >
            Add Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT STUDENT MODAL */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon />
            Edit Student
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {editingStudent && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, pt: 2 }}>
              <TextField
                label="Student ID"
                value={editingStudent.student_id}
                fullWidth
                required
                disabled
                helperText="Cannot be changed after creation"
                sx={{ "& .MuiInputBase-root": { backgroundColor: "#f9fafb" } }}
              />
              <TextField
                label="Full Name"
                value={editingStudent.full_name}
                onChange={(e) => handleEditChange("full_name", e.target.value)}
                fullWidth
                required
              />

              <FormControl fullWidth required>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={editingStudent.academic_year || ""}
                  label="Academic Year"
                  onChange={(e) => handleEditChange("academic_year", e.target.value)}
                  disabled={loadingAcademicYears}
                >
                  <MenuItem value="">
                    <em>Select academic year</em>
                  </MenuItem>
                  {academicYears.map((year) => (
                    <MenuItem key={year.id} value={year.yearName}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                        <EventIcon fontSize="small" />
                        <span>{year.yearName}</span>
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
                          sx={{ ml: "auto", textTransform: "capitalize" }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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

      {/* VIEW COURSES MODAL */}
      <Dialog open={showCoursesModal} onClose={() => setShowCoursesModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                <AssignmentIcon /> Available Courses
              </Typography>
              {selectedStudent && (
                <Typography variant="body2" color="text.secondary">
                  {selectedStudent.full_name} ({selectedStudent.student_id})
                  {selectedStudent.academic_year && ` - ${selectedStudent.academic_year}`}
                </Typography>
              )}
            </Box>
            <IconButton onClick={() => setShowCoursesModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingStudentCourses ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : studentCourses.length === 0 ? (
            <Box textAlign="center" py={4}>
              <AssignmentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No courses available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No courses match this student's department ({selectedStudent?.department})
                {selectedStudent?.year_level && ` and year level (Year ${selectedStudent.year_level})`}.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  {studentCourses.length} course{studentCourses.length !== 1 ? "s" : ""} available
                </Typography>
                <Typography variant="caption">
                  Based on department: {selectedStudent?.department}, Year Level: {selectedStudent?.year_level}
                  {selectedStudent?.academic_year && `, Academic Year: ${selectedStudent.academic_year}`}
                </Typography>
              </Alert>

              <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                {studentCourses.map((course) => (
                  <Card
                    key={course.id}
                    sx={{
                      mb: 1.5,
                      transition: "all 0.2s",
                      "&:hover": {
                        boxShadow: 3,
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Box
                          sx={{
                            bgcolor: "primary.main",
                            color: "white",
                            p: 1.5,
                            borderRadius: 1,
                          }}
                        >
                          <AssignmentIcon />
                        </Box>
                        <Box flex={1}>
                          <Typography variant="h6" fontSize="1rem" fontWeight={600}>
                            {course.course_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {course.description || "No description available"}
                          </Typography>
                          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                            <Chip label={course.course_code} size="small" color="primary" />
                            {course.credits && (
                              <Chip label={`${course.credits} Credits`} size="small" variant="outlined" />
                            )}
                            {course.semester && (
                              <Chip label={`Semester ${course.semester}`} size="small" variant="outlined" />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCoursesModal(false)}>Close</Button>
          {studentCourses.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => {
                const csv = [
                  ["Course Code", "Course Name", "Credits", "Semester", "Status"],
                  ...studentCourses.map((c) => [
                    c.course_code,
                    c.course_name,
                    c.credits || "N/A",
                    c.semester || "N/A",
                    c.status,
                  ]),
                ]
                  .map((row) => row.join(","))
                  .join("\n")

                const blob = new Blob([csv], { type: "text/csv" })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `${selectedStudent?.student_id}_courses.csv`
                a.click()
                window.URL.revokeObjectURL(url)
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
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={() => setActionMenuAnchor(null)}>
        <MenuItem
          onClick={() => {
            handleViewCourses(selectedStudent)
            setActionMenuAnchor(null)
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Courses
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleEditStudent(selectedStudent)
            setActionMenuAnchor(null)
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleDeleteStudent(selectedStudent?.id)
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
