"use client"

/**
 * Enhanced Courses Management Component - DELETION FIX
 *
 * Key Fixes Applied:
 * ==================
 * 1. Fixed DELETE request to work with both query params and request body
 * 2. Added better error handling for deletion conflicts
 * 3. Improved user feedback with confirmation dialogs
 * 4. Added loading state during deletion
 * 5. Enhanced error messages
 */

import { useEffect, useState } from "react"
import ReactDOM from "react-dom/client"
import "../../sass/courses.scss"
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
  Autocomplete,
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
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import BugReportIcon from "@mui/icons-material/BugReport"
import WarningIcon from "@mui/icons-material/Warning"

const drawerWidth = 260

function CoursesPage() {
  // Core State
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Filter State
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Menu State
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Department and Student Integration
  const [departments, setDepartments] = useState([])
  const [students, setStudents] = useState([])
  const [deptLoading, setDeptLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(true)

  // Faculty integration
  const [faculty, setFaculty] = useState([])
  const [facultyLoading, setFacultyLoading] = useState(false)

  // View Modals
  const [viewDetailsModal, setViewDetailsModal] = useState(false)
  const [viewStudentsModal, setViewStudentsModal] = useState(false)
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [loadingEnrolledStudents, setLoadingEnrolledStudents] = useState(false)

  // NEW: Delete confirmation dialog state
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    course: null,
    hasConflicts: false,
    conflictMessage: "",
    loading: false,
  })

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  // Form Data
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
    instructor_id: "",
    instructor_name: "",
  })

  const openMenu = Boolean(anchorEl)

  // Dashboard Sync Function
  const triggerDashboardRefresh = () => {
    localStorage.setItem("coursesUpdated", Date.now().toString())
    window.dispatchEvent(new Event("coursesChanged"))
    console.log("✅ Dashboard refresh triggered")
  }

  // Load user from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user")
    setUser(stored ? JSON.parse(stored) : { full_name: "System Administrator", role: "admin" })
  }, [])

  // Sequential data loading - faculty loads FIRST
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      try {
        await fetchFaculty()
        await fetchDepartments()
        await fetchStudents()
        await fetchCourses()
      } catch (error) {
        console.error("❌ Error loading data:", error)
        setSnackbar({ open: true, message: "Error loading data", severity: "error" })
      } finally {
        setLoading(false)
      }
    }
    loadAllData()
  }, [])

  // Faculty fetch with comprehensive logging
  const fetchFaculty = async () => {
    try {
      setFacultyLoading(true)
      const res = await axios.get("/api/faculty")
      const list = res?.data?.data || res?.data || []
      
      const normalized = (Array.isArray(list) ? list : []).map((f) => {
        const fullName = f.full_name || f.name || `${f.first_name || ""} ${f.last_name || ""}`.trim() || f.email || "Unknown"
        
        return {
          ...f,
          id: f.id ?? f._id ?? null,
          faculty_id: f.faculty_id ?? f.facultyId ?? null,
          full_name: fullName,
          email: f.email ?? null,
          department: f.department ?? null,
          status: f.status ?? "active",
        }
      })
      
      setFaculty(normalized)
      console.log("✅ Faculty loaded:", normalized.length)
    } catch (err) {
      console.error("❌ Error fetching faculty:", err)
      setFaculty([])
    } finally {
      setFacultyLoading(false)
    }
  }

  // Courses fetch with better logging
  const fetchCourses = async () => {
    try {
      const res = await axios.get("/api/courses")
      const list = res?.data?.data || res?.data || []

      const normalized = (Array.isArray(list) ? list : []).map((c) => {
        return {
          ...c,
          instructor_id: c.instructor_id ?? c.instructorId ?? c.instructor?._id ?? c.instructor?.id ?? null,
          instructor_name: c.instructor_name ?? c.instructorName ?? c.instructor?.full_name ?? c.instructor?.name ?? null,
          instructor_email: c.instructor_email ?? c.instructorEmail ?? c.instructor?.email ?? null,
          instructor_faculty_id: c.instructor_faculty_id ?? c.instructorFacultyId ?? c.instructor?.faculty_id ?? null,
        }
      })
      
      setCourses(normalized)
      console.log("✅ Courses loaded:", normalized.length)
    } catch (err) {
      console.error("❌ fetchCourses error:", err)
      setSnackbar({ open: true, message: "Failed to load courses", severity: "error" })
      setCourses([])
    }
  }

  const fetchDepartments = async () => {
    try {
      setDeptLoading(true)
      const res = await axios.get("/api/departments")
      let list = res?.data?.data || res?.data || []

      if (Array.isArray(list)) {
        list = list.filter((dept) => dept.status?.toLowerCase() === "active")
      } else {
        list = []
      }

      setDepartments(list)
    } catch (err) {
      console.error("Error fetching departments:", err)
      setDepartments([])
    } finally {
      setDeptLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true)
      const res = await axios.get("/api/students")
      const list = res?.data?.data || res?.data || []

      const activeStudents = Array.isArray(list) ? list.filter((s) => s.status?.toLowerCase() === "active") : []

      setStudents(activeStudents)
    } catch (err) {
      console.error("Error fetching students:", err)
      setStudents([])
    } finally {
      setStudentsLoading(false)
    }
  }

  // Faculty name resolution
  const getFacultyName = (course) => {
    if (!course) return "Not Assigned"
    
    if (course.instructor_name && course.instructor_name.trim() && course.instructor_name !== "—") {
      return course.instructor_name
    }
    
    if (course.instructor_id && faculty.length > 0) {
      const instructorId = String(course.instructor_id).trim()
      
      const match = faculty.find(f => 
        String(f.id) === instructorId || 
        String(f._id) === instructorId ||
        String(f.faculty_id) === instructorId
      )
      
      if (match) {
        return match.full_name || match.email || "Unknown Faculty"
      }
    }
    
    if (course.instructor_email && faculty.length > 0) {
      const match = faculty.find(f => 
        f.email && f.email.toLowerCase() === course.instructor_email.toLowerCase()
      )
      if (match) return match.full_name || match.email
      return course.instructor_email
    }
    
    return "Not Assigned"
  }

  const getFacultyObject = (course) => {
    if (!course || !course.instructor_id || faculty.length === 0) return null
    
    const instructorId = String(course.instructor_id).trim()
    
    const match = faculty.find(f => 
      String(f.id) === instructorId || 
      String(f._id) === instructorId ||
      String(f.faculty_id) === instructorId
    )
    
    return match || null
  }

  // Integration Functions
  const getDepartmentInfo = (course) => {
    if (!course || (!course.department_name && !course.department_id)) return null

    return departments.find(
      (d) =>
        d.id === course.department_id ||
        d.name === course.department_name ||
        d.name?.toLowerCase() === course.department_name?.toLowerCase(),
    )
  }

  const getEnrolledStudentsForCourse = (course) => {
    const deptInfo = getDepartmentInfo(course)
    if (!deptInfo) return []

    return students.filter((student) => {
      const deptMatch = student.department?.toLowerCase() === deptInfo.name?.toLowerCase()
      const yearMatch = course.year_level ? student.year_level === Number.parseInt(course.year_level) : true

      return deptMatch && yearMatch
    })
  }

  // Statistics
  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.status === "active").length,
    inactive: courses.filter((c) => c.status === "inactive").length,
    credits: courses.reduce((sum, c) => sum + (Number.parseInt(c.credits) || 0), 0),
    withDepartments: courses.filter((c) => c.department_name || c.department_id).length,
    totalEnrollments: courses.reduce((sum, course) => {
      return sum + getEnrolledStudentsForCourse(course).length
    }, 0),
    withInstructors: courses.filter((c) => c.instructor_id).length,
  }

  // Filtering & Pagination
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.course_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getFacultyName(course)?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || course.status === statusFilter

    const matchesDepartment =
      !departmentFilter ||
      course.department_name === departmentFilter ||
      getDepartmentInfo(course)?.name === departmentFilter

    return matchesSearch && matchesStatus && matchesDepartment
  })

  const totalPages = Math.ceil(filteredCourses.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, filteredCourses.length)
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex)

  // Modal Handlers
  const handleViewDetails = async (course) => {
    setSelectedCourse(course)
    setViewDetailsModal(true)
    setLoadingEnrolledStudents(true)
    const enrolled = getEnrolledStudentsForCourse(course)
    setEnrolledStudents(enrolled)
    setLoadingEnrolledStudents(false)
  }

  const handleViewEnrolledStudents = (course) => {
    setSelectedCourse(course)
    setLoadingEnrolledStudents(true)
    const enrolled = getEnrolledStudentsForCourse(course)
    setEnrolledStudents(enrolled)
    setLoadingEnrolledStudents(false)
    setViewStudentsModal(true)
  }

  const handleOpenModal = (course = null) => {
    if (course) {
      const deptInfo = getDepartmentInfo(course)
      const facultyObj = getFacultyObject(course)
      
      setFormData({
        ...course,
        department_name: course.department_name || deptInfo?.name || "",
        department_id: course.department_id || deptInfo?.id || "",
        instructor_id: course.instructor_id || "",
        instructor_name: course.instructor_name || facultyObj?.full_name || "",
      })
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
        instructor_id: "",
        instructor_name: "",
      })
    }
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
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
      instructor_id: "",
      instructor_name: "",
    })
  }

  // Save course
  const handleSaveCourse = async () => {
    if (!formData.course_code || !formData.course_name) {
      setSnackbar({ open: true, message: "Please fill in Course Code and Course Name", severity: "error" })
      return
    }

    try {
      let deptId = formData.department_id
      let deptName = formData.department_name

      if (formData.department_name && !deptId) {
        const matchingDept = departments.find((d) => d.name?.toLowerCase() === formData.department_name?.toLowerCase())
        if (matchingDept) {
          deptId = matchingDept.id
          deptName = matchingDept.name
        }
      } else if (deptId && !deptName) {
        const matchingDept = departments.find((d) => d.id === Number.parseInt(deptId))
        if (matchingDept) {
          deptName = matchingDept.name
        }
      }

      let instructorId = formData.instructor_id
      let instructorName = formData.instructor_name
      
      if (instructorId) {
        const selectedFaculty = faculty.find(f => 
          String(f.id) === String(instructorId) || 
          String(f._id) === String(instructorId) ||
          String(f.faculty_id) === String(instructorId)
        )
        
        if (selectedFaculty) {
          instructorId = selectedFaculty.id || selectedFaculty._id
          instructorName = selectedFaculty.full_name || selectedFaculty.email
        }
      }

      const payload = {
        course_code: formData.course_code.trim(),
        course_name: formData.course_name.trim(),
        description: formData.description?.trim() || "",
        credits: formData.credits || null,
        department_name: deptName || null,
        department_id: deptId || null,
        semester: formData.semester || "",
        year_level: formData.year_level || "",
        status: formData.status || "active",
        instructor_id: instructorId || null,
        instructor_name: instructorName || null,
      }

      if (formData.id) {
        await axios.put(`/api/courses/${formData.id}`, payload)
        setSnackbar({ open: true, message: "Course updated successfully!", severity: "success" })
      } else {
        await axios.post("/api/courses", payload)
        setSnackbar({ open: true, message: "Course created successfully!", severity: "success" })
      }

      await fetchFaculty()
      await fetchCourses()
      
      handleCloseModal()
      triggerDashboardRefresh()
    } catch (error) {
      console.error("❌ Error saving course:", error)
      const resp = error.response

      if (resp) {
        if (resp.status === 422) {
          const msgs = resp.data?.messages || resp.data?.errors
          if (msgs) {
            const flattened = Array.isArray(msgs) ? msgs : Object.values(msgs).flat()
            setSnackbar({ open: true, message: flattened.join(", "), severity: "error" })
          } else {
            setSnackbar({ open: true, message: "Validation error. Please check your input.", severity: "error" })
          }
        } else if (resp.status === 409) {
          setSnackbar({ open: true, message: "This course code already exists.", severity: "error" })
        } else {
          const serverMsg = resp.data?.message || resp.data?.error || "Unknown server error"
          setSnackbar({ open: true, message: serverMsg, severity: "error" })
        }
      } else {
        setSnackbar({ open: true, message: "Network error. Please check your connection.", severity: "error" })
      }
    }
  }

  // ===== FIXED DELETE FUNCTION =====
  const handleDeleteCourse = async (courseToDelete) => {
    if (!courseToDelete || !courseToDelete.id) {
      setSnackbar({ open: true, message: "Invalid course selected", severity: "error" })
      return
    }

    // Open confirmation dialog with course info
    setDeleteConfirmDialog({
      open: true,
      course: courseToDelete,
      hasConflicts: false,
      conflictMessage: "",
      loading: false,
    })
  }

  // NEW: Handle the actual deletion
  const handleConfirmDelete = async (forceDelete = false) => {
    const courseId = deleteConfirmDialog.course?.id

    if (!courseId) {
      setSnackbar({ open: true, message: "No course selected", severity: "error" })
      return
    }

    // Set loading state
    setDeleteConfirmDialog(prev => ({ ...prev, loading: true }))

    try {
      console.log(`🗑️ Attempting to delete course ID: ${courseId}, Force: ${forceDelete}`)

      // Try multiple delete approaches to ensure compatibility
      let deleteSuccess = false
      let response = null

      // Method 1: DELETE with query parameter
      try {
        response = await axios.delete(`/api/courses/${courseId}?force=${forceDelete}`)
        deleteSuccess = true
      } catch (err) {
        console.log("Method 1 failed, trying Method 2...")
        
        // Method 2: DELETE with data in request body
        try {
          response = await axios.delete(`/api/courses/${courseId}`, {
            data: { force_delete: forceDelete, force: forceDelete }
          })
          deleteSuccess = true
        } catch (err2) {
          console.log("Method 2 failed, trying Method 3...")
          
          // Method 3: POST to delete endpoint (some APIs use this pattern)
          try {
            response = await axios.post(`/api/courses/${courseId}/delete`, {
              force_delete: forceDelete,
              force: forceDelete
            })
            deleteSuccess = true
          } catch (err3) {
            // If all methods fail, throw the original error
            throw err
          }
        }
      }

      if (deleteSuccess) {
        console.log("✅ Delete successful:", response?.data)
        
        // Close dialog
        setDeleteConfirmDialog({
          open: false,
          course: null,
          hasConflicts: false,
          conflictMessage: "",
          loading: false,
        })

        // Show success message
        setSnackbar({ 
          open: true, 
          message: `Course "${deleteConfirmDialog.course?.course_name}" deleted successfully!`, 
          severity: "success" 
        })

        // Refresh data
        await fetchCourses()
        triggerDashboardRefresh()
      }

    } catch (error) {
      console.error("❌ Delete error:", error)
      
      const errorData = error.response?.data
      const statusCode = error.response?.status

      // Handle conflict (course has students enrolled)
      if (statusCode === 409 || errorData?.has_students || errorData?.conflict) {
        const message = errorData?.message || 
                       `This course has ${errorData?.student_count || 'enrolled'} students. Deleting it will affect their records.`
        
        setDeleteConfirmDialog(prev => ({
          ...prev,
          hasConflicts: true,
          conflictMessage: message,
          loading: false,
        }))
      } 
      // Handle other errors
      else {
        const errorMessage = errorData?.message || 
                           errorData?.error || 
                           error.message ||
                           "Failed to delete course. Please try again."
        
        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: "error" 
        })

        // Close dialog on non-conflict errors
        setDeleteConfirmDialog({
          open: false,
          course: null,
          hasConflicts: false,
          conflictMessage: "",
          loading: false,
        })
      }
    }
  }

  // NEW: Close delete dialog
  const handleCancelDelete = () => {
    setDeleteConfirmDialog({
      open: false,
      course: null,
      hasConflicts: false,
      conflictMessage: "",
      loading: false,
    })
  }

  // Claim course as current faculty user
  const handleClaimCourse = async (course) => {
    if (!user) {
      setSnackbar({ open: true, message: "Not signed in", severity: "error" })
      return
    }

    const currentFacultyId = user.id ?? user._id ?? user.faculty_id ?? null
    const currentFacultyName = (user.full_name ?? `${user.first_name || ""} ${user.last_name || ""}`.trim()) || user.email
    if (!currentFacultyId) {
      setSnackbar({ open: true, message: "Unable to determine your faculty ID", severity: "error" })
      return
    }

    try {
      const payload = {
        instructor_id: currentFacultyId,
        instructor_name: currentFacultyName,
        instructor_email: user.email || null,
        instructor_faculty_id: user.faculty_id || null,
      }
      
      await axios.put(`/api/courses/${course.id}`, payload)
      
      setSnackbar({ open: true, message: `You are now assigned to ${course.course_name}`, severity: "success" })
      
      await fetchFaculty()
      await fetchCourses()
      
    } catch (err) {
      console.error("❌ Error claiming course:", err)
      setSnackbar({ open: true, message: "Failed to assign course", severity: "error" })
    }
  }

  // DEBUG FUNCTION
  const handleDebugInstructor = () => {
    console.log("=== 🐛 INSTRUCTOR DEBUG ===")
    console.log("\n📊 FACULTY DATA:")
    console.log("Total faculty:", faculty.length)
    console.table(faculty.map(f => ({
      database_id: f.id,
      faculty_id: f.faculty_id,
      name: f.full_name,
      email: f.email
    })))
    
    console.log("\n📚 COURSES WITH INSTRUCTORS:")
    const coursesWithInstructors = courses.filter(c => c.instructor_id)
    console.log("Total courses with instructors:", coursesWithInstructors.length)
    
    coursesWithInstructors.forEach(c => {
      const facultyName = getFacultyName(c)
      const facultyObj = getFacultyObject(c)
      console.log({
        course: c.course_name,
        stored_instructor_id: c.instructor_id,
        stored_instructor_name: c.instructor_name,
        resolved_name: facultyName,
        faculty_found: facultyObj ? "YES ✅" : "NO ❌",
      })
    })
    
    setSnackbar({ 
      open: true, 
      message: "Debug info logged to console! Press F12 to view.", 
      severity: "info" 
    })
  }

  // Event Handlers
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDepartmentChange = (_, newValue) => {
    const selectedDept = departments.find((d) => d.name === newValue)
    setFormData((prev) => ({
      ...prev,
      department_name: newValue || "",
      department_id: selectedDept?.id || "",
    }))
  }

  const handleExport = () => {
    const csvContent = [
      ["Code", "Course", "Credits", "Department", "Faculty", "Year Level", "Semester", "Enrolled Students", "Status"],
      ...filteredCourses.map((c) => {
        const deptInfo = getDepartmentInfo(c)
        const enrolled = getEnrolledStudentsForCourse(c)
        return [
          c.course_code,
          `"${c.course_name}"`,
          c.credits || "N/A",
          deptInfo?.name || "N/A",
          `"${getFacultyName(c)}"`,
          c.year_level || "N/A",
          c.semester || "N/A",
          enrolled.length,
          c.status,
        ]
      }),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `courses_export_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setSnackbar({ open: true, message: "Courses exported successfully", severity: "success" })
  }

  const handleActionMenuOpen = (event, course) => {
    setActionMenuAnchor(event.currentTarget)
    setSelectedCourse(course)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setSelectedCourse(null)
  }

  const handleRefresh = async () => {
    setSnackbar({ open: true, message: "Refreshing data...", severity: "info" })
    await fetchFaculty()
    await fetchDepartments()
    await fetchStudents()
    await fetchCourses()
    setSnackbar({ open: true, message: "Data refreshed successfully!", severity: "success" })
  }

  // Navigation & Logout
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

  if (!user)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )

  return (
    <Box sx={{ display: "flex", fontSize: "0.95rem" }}>
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
          {mainMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={item.label === "Courses"}
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
                Courses
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Course Catalog & Faculty Assignment
              </Typography>
            </Box>

            <Chip
              icon={<PersonIcon />}
              label={`${faculty.length} Faculty`}
              size="small"
              sx={{ mr: 1 }}
              color={faculty.length > 0 ? "primary" : "default"}
            />
            <Chip
              icon={<BusinessIcon />}
              label={`${departments.length} Depts`}
              size="small"
              sx={{ mr: 1 }}
              color={departments.length > 0 ? "success" : "default"}
            />
            <Chip
              icon={<PeopleIcon />}
              label={`${students.length} Students`}
              size="small"
              sx={{ mr: 2 }}
              color={students.length > 0 ? "success" : "default"}
            />

            <Chip label={user.role || "Admin"} size="small" sx={{ mr: 1 }} />
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
        <Box sx={{ p: 2 }}>
          {/* Stats Cards */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 1, mb: 2 }}>
            <Card>
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Courses
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: "#ecfdf5" }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#059669">
                  {stats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Courses
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: "#fef3c7" }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#d97706">
                  {stats.withInstructors}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  With Faculty
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ bgcolor: "#eff6ff" }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700} color="#2563eb">
                  {stats.totalEnrollments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Enrollments
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
          
          {faculty.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>No faculty members found!</strong> Add faculty at{" "}
              <a href="/faculty" style={{ color: "#3b82f6", textDecoration: "underline" }}>
                Faculty page
              </a>{" "}
              to assign instructors to courses.
            </Alert>
          )}

          {/* Page Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4" fontWeight={700}>
              Courses Management
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Button variant="outlined" startIcon={<BugReportIcon />} onClick={handleDebugInstructor} color="warning">
                Debug
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
                Refresh
              </Button>
              <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
                Export
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
                Add Course
              </Button>
            </Box>
          </Box>

          {/* Search and Filters */}
          <Card sx={{ mb: 2, p: 1 }}>
            <CardContent>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr auto" }, gap: 1 }}>
                <TextField
                  placeholder="Search courses, faculty..."
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
                    disabled={deptLoading}
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
                    <MenuItem value="">All</MenuItem>
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
            <Box
              sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}
            >
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">
                Loading courses...
              </Typography>
            </Box>
          ) : (
            <>
              <Card sx={{ p: 1 }}>
                <Box sx={{ overflowX: "auto" }}>
                  {filteredCourses.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: "center" }}>
                      <SchoolIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No courses found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery || statusFilter || departmentFilter
                          ? "Try adjusting your filters"
                          : 'Click "ADD COURSE" to create your first course'}
                      </Typography>
                    </Box>
                  ) : (
                    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                      <Box component="thead">
                        <Box component="tr" sx={{ bgcolor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Course
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Code
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Department
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                            Credits
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "left", fontWeight: 600, fontSize: "0.875rem" }}>
                            Faculty
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                            Enrolled
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                            Status
                          </Box>
                          <Box component="th" sx={{ p: 2, textAlign: "center", fontWeight: 600, fontSize: "0.875rem" }}>
                            Actions
                          </Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {paginatedCourses.map((c) => {
                          const deptInfo = getDepartmentInfo(c)
                          const enrolled = getEnrolledStudentsForCourse(c)
                          const facultyName = getFacultyName(c)
                          const facultyObj = getFacultyObject(c)
                          
                          return (
                            <Box
                              key={c.id}
                              component="tr"
                              sx={{
                                "&:nth-of-type(odd)": { bgcolor: "#fafbfd" },
                                "&:hover": { bgcolor: "#f3f6f9" },
                              }}
                            >
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  {c.course_name}
                                </Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2, color: "text.secondary" }}>
                                <Typography variant="body2">{c.course_code || "—"}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Typography variant="body2">{deptInfo?.name || "—"}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2, textAlign: "center" }}>
                                <Typography variant="body2">{c.credits || "N/A"}</Typography>
                              </Box>
                              <Box component="td" sx={{ p: 2 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {facultyObj ? (
                                    <>
                                      <Avatar sx={{ width: 24, height: 24, bgcolor: "#4f46e5", fontSize: "0.75rem" }}>
                                        {facultyObj.full_name?.charAt(0) || "F"}
                                      </Avatar>
                                      <Typography variant="body2" fontWeight={500}>
                                        {facultyName}
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                                      {facultyName}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box component="td" sx={{ p: 2, textAlign: "center" }}>
                                <Button
                                  size="small"
                                  onClick={() => handleViewEnrolledStudents(c)}
                                  disabled={enrolled.length === 0}
                                  sx={{ minWidth: "auto", color: enrolled.length > 0 ? "#4f46e5" : "text.disabled" }}
                                >
                                  <PeopleIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                                  {enrolled.length}
                                </Button>
                              </Box>
                              <Box component="td" sx={{ p: 2, textAlign: "center" }}>
                                <Chip label={c.status} size="small" color={c.status === "active" ? "success" : "default"} />
                              </Box>
                              <Box component="td" sx={{ p: 2, textAlign: "center" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                                  <IconButton size="small" color="info" onClick={() => handleViewDetails(c)}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="primary" onClick={() => handleOpenModal(c)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleDeleteCourse(c)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={(e) => handleActionMenuOpen(e, c)}>
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>

                                  {user?.role === "faculty" && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleClaimCourse(c)}
                                      disabled={
                                        Boolean(c.instructor_id) &&
                                        String(c.instructor_id) === String(user.id ?? user._id ?? user.faculty_id)
                                      }
                                      sx={{ ml: 0.5, minWidth: "64px" }}
                                    >
                                      {Boolean(c.instructor_id) && String(c.instructor_id) === String(user.id ?? user._id ?? user.faculty_id) ? "Assigned" : "Claim"}
                                    </Button>
                                  )}
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
                {filteredCourses.length > 0 && (
                  <Box
                    sx={{
                      p: 1.5,
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
                          setRowsPerPage(Number(e.target.value))
                          setCurrentPage(1)
                        }}
                        size="small"
                      >
                        <MenuItem value={5}>5</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
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
            handleViewDetails(selectedCourse)
            handleActionMenuClose()
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleOpenModal(selectedCourse)
            handleActionMenuClose()
          }}
        >
          <EditIcon sx={{ mr: 1 }} fontSize="small" />
          Edit
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleDeleteCourse(selectedCourse)
            handleActionMenuClose()
          }}
        >
          <DeleteIcon sx={{ mr: 1, color: "#ef4444" }} fontSize="small" />
          <Typography color="#ef4444">Delete</Typography>
        </MenuItem>
      </Menu>

      {/* NEW: DELETE CONFIRMATION DIALOG */}
      <Dialog 
        open={deleteConfirmDialog.open} 
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <WarningIcon sx={{ color: "#ef4444" }} />
            <span>Confirm Delete Course</span>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {deleteConfirmDialog.course && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to delete this course?
              </Typography>
              
              <Card sx={{ mt: 2, bgcolor: "#fef2f2", border: "1px solid #fecaca" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} color="#991b1b">
                    {deleteConfirmDialog.course.course_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {deleteConfirmDialog.course.course_code}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Department: {getDepartmentInfo(deleteConfirmDialog.course)?.name || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enrolled Students: {getEnrolledStudentsForCourse(deleteConfirmDialog.course).length}
                  </Typography>
                </CardContent>
              </Card>

              {deleteConfirmDialog.hasConflicts && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    ⚠️ Warning: This course has enrolled students
                  </Typography>
                  <Typography variant="body2">
                    {deleteConfirmDialog.conflictMessage}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Deleting this course will remove it from student records. This action cannot be undone.
                  </Typography>
                </Alert>
              )}

              {!deleteConfirmDialog.hasConflicts && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    This action cannot be undone. The course will be permanently removed from the system.
                  </Typography>
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelDelete}
            disabled={deleteConfirmDialog.loading}
          >
            Cancel
          </Button>
          {!deleteConfirmDialog.hasConflicts ? (
            <Button
              variant="contained"
              color="error"
              onClick={() => handleConfirmDelete(false)}
              disabled={deleteConfirmDialog.loading}
              startIcon={deleteConfirmDialog.loading ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              {deleteConfirmDialog.loading ? "Deleting..." : "Delete Course"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              onClick={() => handleConfirmDelete(true)}
              disabled={deleteConfirmDialog.loading}
              startIcon={deleteConfirmDialog.loading ? <CircularProgress size={16} /> : <WarningIcon />}
            >
              {deleteConfirmDialog.loading ? "Deleting..." : "Force Delete Anyway"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ADD/EDIT COURSE MODAL */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssignmentIcon />
            {formData.id ? "Edit Course" : "Add New Course"}
          </Box>
        </DialogTitle>
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
            helperText="Unique course code (e.g., CS201, MATH101)"
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
            helperText="Full course name"
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
            helperText="Brief description of the course"
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
            inputProps={{ min: 0, max: 12 }}
            helperText="Number of credit hours"
          />

          <Autocomplete
            freeSolo
            options={departments.map((d) => d.name)}
            value={formData.department_name || ""}
            onChange={handleDepartmentChange}
            onInputChange={(_, newInput) => {
              setFormData((prev) => ({ ...prev, department_name: newInput || "" }))
            }}
            loading={deptLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Department"
                margin="normal"
                fullWidth
                size="small"
                helperText={
                  departments.length === 0
                    ? "⚠️ No departments available. Create departments first."
                    : "Select existing or type to create new department"
                }
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <BusinessIcon sx={{ mr: 1, color: "text.secondary", ml: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {deptLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => {
              const dept = departments.find((d) => d.name === option)
              return (
                <li {...props}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <BusinessIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2">{option}</Typography>
                      {dept && (
                        <Typography variant="caption" color="text.secondary">
                          {dept.code} • {dept.students_count || 0} students
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </li>
              )
            }}
          />

          {/* Faculty selector with better matching */}
          <Autocomplete
            options={faculty}
            getOptionLabel={(f) => (f ? f.full_name || f.email || String(f.faculty_id || "") : "")}
            value={
              faculty.find(
                (f) =>
                  String(f.id) === String(formData.instructor_id) ||
                  String(f._id) === String(formData.instructor_id) ||
                  String(f.faculty_id) === String(formData.instructor_id),
              ) || null
            }
            onChange={(_, selected) => {
              if (!selected) {
                setFormData((prev) => ({ ...prev, instructor_id: "", instructor_name: "" }))
                return
              }
              setFormData((prev) => ({
                ...prev,
                instructor_id: selected.id ?? selected._id ?? selected.faculty_id ?? "",
                instructor_name: selected.full_name ?? selected.email ?? "",
              }))
            }}
            loading={facultyLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Faculty (Instructor)"
                margin="normal"
                fullWidth
                size="small"
                helperText={faculty.length === 0 ? "⚠️ No faculty available. Add faculty first." : "Select a faculty member to assign as instructor"}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <PersonIcon sx={{ mr: 1, color: "text.secondary", ml: 1 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {facultyLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: "#4f46e5" }}>
                    {option.full_name?.charAt(0) || "F"}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                      {option.full_name || option.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.faculty_id ? `${option.faculty_id}` : ""}
                      {option.faculty_id && option.department ? " • " : ""}
                      {option.department || ""}
                      {(option.faculty_id || option.department) && option.email ? " • " : ""}
                      {option.email || ""}
                    </Typography>
                  </Box>
                </Box>
              </li>
            )}
          />

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Year Level</InputLabel>
            <Select name="year_level" value={formData.year_level || ""} label="Year Level" onChange={handleChange}>
              <MenuItem value="">
                <em>All Years</em>
              </MenuItem>
              <MenuItem value="1">1st Year</MenuItem>
              <MenuItem value="2">2nd Year</MenuItem>
              <MenuItem value="3">3rd Year</MenuItem>
              <MenuItem value="4">4th Year</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Semester</InputLabel>
            <Select name="semester" value={formData.semester || ""} label="Semester" onChange={handleChange}>
              <MenuItem value="">
                <em>Choose...</em>
              </MenuItem>
              <MenuItem value="1">1st Semester</MenuItem>
              <MenuItem value="2">2nd Semester</MenuItem>
              <MenuItem value="summer">Summer</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={formData.status} label="Status" onChange={handleChange}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          {formData.id && (
            <Alert severity="info" sx={{ mt: 2 }}>
              💡 <strong>Tip:</strong> Enrollment is calculated automatically based on department and year level matching.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveCourse}
            disabled={departments.length === 0 && !formData.department_name}
          >
            {formData.id ? "Update" : "Create"} Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW DETAILS MODAL */}
      <Dialog open={viewDetailsModal} onClose={() => setViewDetailsModal(false)} fullWidth maxWidth="md">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <AssignmentIcon />
              <span>Course Details</span>
            </Box>
            <IconButton onClick={() => setViewDetailsModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCourse && (
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="start" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: "#4f46e5", width: 56, height: 56, fontSize: "1.5rem" }}>
                      {selectedCourse.course_code?.charAt(0) || "C"}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="h5" fontWeight={600}>
                        {selectedCourse.course_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedCourse.course_code}
                      </Typography>
                      <Chip
                        label={selectedCourse.status}
                        size="small"
                        color={selectedCourse.status === "active" ? "success" : "default"}
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedCourse.description || "No description"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Credits
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedCourse.credits || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <BusinessIcon fontSize="small" /> Department
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {getDepartmentInfo(selectedCourse)?.name || "N/A"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                        <PersonIcon fontSize="small" /> Instructor
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {getFacultyName(selectedCourse)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Year Level
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedCourse.year_level
                          ? `${selectedCourse.year_level}${selectedCourse.year_level === "1" ? "st" : selectedCourse.year_level === "2" ? "nd" : selectedCourse.year_level === "3" ? "rd" : "th"} Year`
                          : "All Years"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Semester
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {selectedCourse.semester
                          ? `${selectedCourse.semester}${selectedCourse.semester === "summer" ? "" : selectedCourse.semester === "1" ? "st" : "nd"} Semester`
                          : "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <PeopleIcon /> Enrolled Students ({enrolledStudents.length})
                  </Typography>
                  {loadingEnrolledStudents ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress />
                    </Box>
                  ) : enrolledStudents.length === 0 ? (
                    <Box textAlign="center" py={4}>
                      <SchoolIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No students enrolled
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                      {enrolledStudents.slice(0, 5).map((student, index) => (
                        <Box
                          key={student.id}
                          sx={{
                            p: 1.5,
                            borderBottom: index < Math.min(4, enrolledStudents.length - 1) ? "1px solid #e5e7eb" : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar sx={{ bgcolor: "#10b981" }}>{student.full_name?.charAt(0) || "S"}</Avatar>
                          <Box flex={1}>
                            <Typography variant="body2" fontWeight={600}>
                              {student.full_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {student.student_id} • Year {student.year_level}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      {enrolledStudents.length > 5 && (
                        <Box sx={{ p: 1, textAlign: "center" }}>
                          <Typography variant="caption" color="text.secondary">
                            +{enrolledStudents.length - 5} more students
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsModal(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              setViewDetailsModal(false)
              handleOpenModal(selectedCourse)
            }}
          >
            Edit Course
          </Button>
        </DialogActions>
      </Dialog>

      {/* VIEW ENROLLED STUDENTS MODAL */}
      <Dialog open={viewStudentsModal} onClose={() => setViewStudentsModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <PeopleIcon />
              <span>Enrolled Students</span>
            </Box>
            <IconButton onClick={() => setViewStudentsModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loadingEnrolledStudents ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : enrolledStudents.length === 0 ? (
            <Box textAlign="center" py={4}>
              <SchoolIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No students enrolled
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No students match the department and year level criteria
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Showing {enrolledStudents.length} student{enrolledStudents.length !== 1 ? "s" : ""} for{" "}
                <strong>{selectedCourse?.course_name}</strong>
              </Typography>
              <Box sx={{ maxHeight: 400, overflow: "auto", mt: 2 }}>
                {enrolledStudents.map((student, index) => (
                  <Box
                    key={student.id}
                    sx={{
                      p: 2,
                      borderBottom: index < enrolledStudents.length - 1 ? "1px solid #e5e7eb" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      "&:hover": { bgcolor: "#f9fafb" },
                    }}
                  >
                    <Avatar sx={{ bgcolor: "#10b981", width: 40, height: 40 }}>
                      {student.full_name?.charAt(0) || "S"}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {student.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.student_id} • {student.email}
                      </Typography>
                    </Box>
                    <Chip label={`Year ${student.year_level}`} size="small" color="primary" />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewStudentsModal(false)}>Close</Button>
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

// Component Mounting
document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("app")
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(<CoursesPage />)
  }
})

export default CoursesPage