"use client"

// resources/js/components/Dashboard.js - Enhanced with Faculty Integration
import { useState, useEffect } from "react"
import ReactDOM from "react-dom/client"
import "../../sass/dashboard.scss"
import axios from "axios"

// Material-UI Components
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Avatar from "@mui/material/Avatar"
import Chip from "@mui/material/Chip"
import Badge from "@mui/material/Badge"
import IconButton from "@mui/material/IconButton"
import Toolbar from "@mui/material/Toolbar"
import AppBar from "@mui/material/AppBar"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Divider from "@mui/material/Divider"
import CircularProgress from "@mui/material/CircularProgress"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Paper from "@mui/material/Paper"
import Popover from "@mui/material/Popover"
import Button from "@mui/material/Button"
import Collapse from "@mui/material/Collapse"

// Material-UI Icons
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
import SearchIcon from "@mui/icons-material/Search"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import ClearAllIcon from "@mui/icons-material/ClearAll"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"

// Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

const drawerWidth = 260
const COLORS = ["#2196F3", "#9C27B0", "#FF5722", "#4CAF50", "#FF9800", "#00BCD4", "#E91E63", "#3F51B5"]

// Notification Component
function NotificationPanel({ anchorEl, open, onClose, notifications, onMarkAsRead, onClearAll }) {
  const unreadCount = notifications.filter((n) => !n.read).length

  const getNotificationIcon = (type) => {
    switch (type) {
      case "student":
        return <SchoolIcon style={{ color: "#2196F3" }} />
      case "faculty":
        return <PersonIcon style={{ color: "#9C27B0" }} />
      case "department":
        return <BusinessIcon style={{ color: "#4CAF50" }} />
      case "course":
        return <AssignmentIcon style={{ color: "#FF5722" }} />
      default:
        return <PersonAddIcon style={{ color: "#666" }} />
    }
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffMs = now - notifTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notifTime.toLocaleDateString()
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          width: 380,
          maxHeight: 500,
          mt: 1,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
          {unreadCount > 0 && <Chip label={`${unreadCount} new`} size="small" color="primary" sx={{ height: 24 }} />}
        </Box>
        {notifications.length > 0 && (
          <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
            <Button size="small" startIcon={<CheckCircleIcon />} onClick={onMarkAsRead} sx={{ fontSize: "0.75rem" }}>
              Mark all read
            </Button>
            <Button
              size="small"
              startIcon={<ClearAllIcon />}
              onClick={onClearAll}
              color="error"
              sx={{ fontSize: "0.75rem" }}
            >
              Clear all
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <NotificationsIcon sx={{ fontSize: 48, color: "#ccc", mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <Box
              key={notification.id}
              sx={{
                p: 2,
                borderBottom: "1px solid #f0f0f0",
                backgroundColor: notification.read ? "transparent" : "#f5f9ff",
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": { backgroundColor: "#f8f9fa" },
              }}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={notification.read ? 400 : 600} sx={{ mb: 0.5 }}>
                    {notification.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", mt: 0.5, display: "block" }}>
                    {formatTime(notification.timestamp)}
                  </Typography>
                </Box>
                {!notification.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#2196F3",
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  />
                )}
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Popover>
  )
}

function DashboardOverview({ user }) {
  const [departments, setDepartments] = useState([])
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  useEffect(() => {
    const handleCoursesChanged = () => {
      console.log("📡 Dashboard: Detected course changes, refreshing data...")
      fetchAllData()
    }

    window.addEventListener("coursesChanged", handleCoursesChanged)

    const checkInterval = setInterval(() => {
      const lastUpdate = localStorage.getItem("coursesUpdated")
      if (lastUpdate) {
        const lastCheck = sessionStorage.getItem("lastCoursesCheck") || "0"
        if (lastUpdate !== lastCheck) {
          console.log("📡 Dashboard: Detected course update via localStorage")
          sessionStorage.setItem("lastCoursesCheck", lastUpdate)
          fetchAllData()
        }
      }
    }, 2000)

    return () => {
      window.removeEventListener("coursesChanged", handleCoursesChanged)
      clearInterval(checkInterval)
    }
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Dashboard: Fetching all data...")

      const [deptRes, courseRes, studentRes, facultyRes] = await Promise.all([
        axios.get("/api/departments").catch((err) => ({ data: [] })),
        axios.get("/api/courses").catch((err) => ({ data: [] })),
        axios.get("/api/students").catch((err) => ({ data: [] })),
        axios.get("/api/faculty").catch((err) => ({ data: [] })),
      ])

      const deptData = Array.isArray(deptRes.data) ? deptRes.data : deptRes.data.success ? deptRes.data.data : []
      const courseData = Array.isArray(courseRes.data) ? courseRes.data : courseRes.data.data || []
      const studentData = Array.isArray(studentRes.data) ? studentRes.data : studentRes.data.data || []
      const facultyData = Array.isArray(facultyRes.data) ? facultyRes.data : facultyRes.data.data || []

      setDepartments(deptData)
      setCourses(courseData)
      setStudents(studentData)
      setFaculty(facultyData)

      console.log("✅ Dashboard: Data loaded", {
        departments: deptData.length,
        courses: courseData.length,
        students: studentData.length,
        faculty: facultyData.length,
      })
    } catch (error) {
      console.error("❌ Dashboard: Error fetching data:", error)
      setError("Failed to load dashboard data. Using default values.")
      setDepartments([])
      setCourses([])
      setStudents([])
      setFaculty([])
    } finally {
      setLoading(false)
    }
  }

  // ============ FACULTY BY DEPARTMENT ============
  const getFacultyByDepartment = () => {
    if (!departments.length || !faculty.length) return []

    return departments
      .map((dept) => {
        const deptFaculty = faculty.filter((f) => f.department?.toLowerCase() === dept.name?.toLowerCase())
        const activeFaculty = deptFaculty.filter((f) => f.status === "active")
        
        return {
          name: dept.code || dept.name?.substring(0, 12) || "N/A",
          fullName: dept.name || "Unknown Department",
          faculty: deptFaculty.length,
          activeFaculty: activeFaculty.length,
          onLeave: deptFaculty.filter((f) => f.status === "on_leave").length,
        }
      })
      .filter((dept) => dept.faculty > 0)
      .sort((a, b) => b.faculty - a.faculty)
      .slice(0, 8)
  }

  // ============ FACULTY BY COURSE ============
  const getFacultyCourseStats = () => {
    if (!courses.length || !faculty.length) return []

    return courses
      .map((course) => {
        // Find faculty assigned to this course
        const courseFaculty = faculty.filter((f) => {
          // Match by course_id or department
          return (
            (f.course_id && f.course_id === course.id) ||
            (f.department && course.department_name && 
             f.department.toLowerCase() === course.department_name.toLowerCase())
          )
        })

        // Get instructor info
        const instructor = faculty.find((f) => 
          String(f.id) === String(course.instructor_id) ||
          String(f._id) === String(course.instructor_id) ||
          String(f.faculty_id) === String(course.instructor_id)
        )

        return {
          name: course.course_code || course.course_name?.substring(0, 15) || "N/A",
          fullName: course.course_name || "Unknown Course",
          facultyCount: courseFaculty.length,
          hasInstructor: !!instructor,
          instructorName: instructor?.full_name || "Not Assigned",
          department: course.department_name || "N/A",
        }
      })
      .filter((c) => c.facultyCount > 0 || c.hasInstructor)
      .sort((a, b) => b.facultyCount - a.facultyCount)
      .slice(0, 8)
  }

  const getDepartmentStats = () => {
    if (!departments.length) return []

    return departments
      .map((dept) => {
        const studentsCount = students.filter((s) => s.department === dept.name).length
        const facultyCount = faculty.filter((f) => f.department === dept.name).length
        const activeFaculty = faculty.filter((f) => f.department === dept.name && f.status === "active").length

        return {
          name: dept.code || dept.name?.substring(0, 12) || "N/A",
          fullName: dept.name || "Unknown Department",
          students: studentsCount,
          faculty: facultyCount,
          activeFaculty: activeFaculty,
          total: studentsCount + facultyCount,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }

  const getCourseStats = () => {
    if (!courses.length) return []

    return courses
      .map((course) => {
        const courseStudents = students.filter(
          (s) => s.enrolled_courses?.includes(course.name) || s.course === course.name || s.program === course.name,
        ).length

        // Count faculty assigned to this course or in the same department
        const courseFaculty = faculty.filter((f) => {
          return (
            (f.course_id && f.course_id === course.id) ||
            (f.department && course.department_name && 
             f.department.toLowerCase() === course.department_name.toLowerCase())
          )
        }).length

        // Check if course has an assigned instructor
        const hasInstructor = !!course.instructor_id

        return {
          name: course.course_code || course.course_name?.substring(0, 15) || "N/A",
          fullName: course.course_name || "Unknown Course",
          students: courseStudents,
          faculty: courseFaculty,
          hasInstructor: hasInstructor ? 1 : 0, // For stacking in chart
        }
      })
      .sort((a, b) => b.students - a.students)
      .slice(0, 8)
  }

  const getDepartmentDistribution = () => {
    const deptStats = getDepartmentStats()
    return deptStats
      .filter((dept) => dept.students > 0)
      .map((dept) => ({
        name: dept.fullName,
        value: dept.students,
      }))
  }

  // ============ FACULTY DISTRIBUTION BY STATUS ============
  const getFacultyDistribution = () => {
    if (!faculty.length) return []

    const statusCount = {
      active: faculty.filter((f) => f.status === "active").length,
      inactive: faculty.filter((f) => f.status === "inactive").length,
      on_leave: faculty.filter((f) => f.status === "on_leave").length,
    }

    return Object.entries(statusCount)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: count,
      }))
  }

  const departmentData = getDepartmentStats()
  const courseData = getCourseStats()
  const distributionData = getDepartmentDistribution()
  const facultyByDepartment = getFacultyByDepartment()
  const facultyCourseStats = getFacultyCourseStats()
  const facultyDistribution = getFacultyDistribution()

  const stats = {
    totalStudents: students.length,
    totalFaculty: faculty.length,
    totalCourses: courses.length,
    activeCourses: courses.filter((c) => c.status?.toLowerCase() === "active").length,
    totalDepartments: departments.filter((d) => d.status?.toLowerCase() === "active").length,
    activeFaculty: faculty.filter((f) => f.status === "active").length,
    coursesWithInstructors: courses.filter((c) => c.instructor_id).length,
  }

  const statCards = [
    {
      title: "Total Students",
      subtitle: "Active enrollments",
      value: stats.totalStudents,
      icon: SchoolIcon,
      color: "#2196F3",
      change: `${students.filter((s) => s.status === "active").length} active`,
      bgGradient: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
    },
    {
      title: "Faculty Members",
      subtitle: "Teaching staff",
      value: stats.totalFaculty,
      icon: PersonIcon,
      color: "#9C27B0",
      change: `${stats.activeFaculty} active • ${stats.coursesWithInstructors} assigned`,
      bgGradient: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
    },
    {
      title: "Active Courses",
      subtitle: "This semester",
      value: stats.activeCourses,
      icon: AssignmentIcon,
      color: "#FF5722",
      change: `${stats.coursesWithInstructors} with instructors`,
      bgGradient: "linear-gradient(135deg, #FF5722 0%, #E64A19 100%)",
    },
    {
      title: "Departments",
      subtitle: "Academic divisions",
      value: stats.totalDepartments,
      icon: BusinessIcon,
      color: "#4CAF50",
      change: `${departments.length} total departments`,
      bgGradient: "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)",
    },
  ]

  const systemStatusData = [
    {
      label: "Active Faculty",
      value: stats.totalFaculty > 0 ? Math.round((stats.activeFaculty / stats.totalFaculty) * 100) : 0,
      color: "#9C27B0",
    },
    {
      label: "Courses with Instructors",
      value: stats.totalCourses > 0 ? Math.round((stats.coursesWithInstructors / stats.totalCourses) * 100) : 0,
      color: "#FF5722",
    },
    {
      label: "Faculty-Department Coverage",
      value: stats.totalDepartments > 0 ? Math.min(Math.round((stats.totalFaculty / stats.totalDepartments) * 10), 100) : 0,
      color: "#4CAF50",
    },
  ]

  const [progress, setProgress] = useState(systemStatusData.map(() => 0))

  useEffect(() => {
    const timers = systemStatusData.map((s, i) =>
      setTimeout(
        () => {
          setProgress((prev) => {
            const updated = [...prev]
            updated[i] = s.value
            return updated
          })
        },
        200 * (i + 1),
      ),
    )
    return () => timers.forEach((t) => clearTimeout(t))
  }, [stats.totalStudents, stats.totalFaculty, stats.totalCourses, stats.totalDepartments])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 1.5,
            bgcolor: "rgba(0, 0, 0, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography variant="body2" fontWeight="bold" sx={{ color: "#fff", mb: 0.5 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color, fontSize: "0.875rem" }}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Box className="loading-container" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <div className="dashboard-overview">
      <div className="stats-grid">
        {statCards.map((stat, idx) => {
          const IconComponent = stat.icon
          return (
            <div className="stat-card" key={idx} style={{ background: stat.bgGradient }}>
              <div className="stat-icon">
                <IconComponent />
              </div>
              <div className="stat-content">
                <h2>{stat.value}</h2>
                <h3>{stat.title}</h3>
                <p>{stat.subtitle}</p>
                <span className="stat-change">{stat.change}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ============ FACULTY BY DEPARTMENT CHART ============ */}
      {facultyByDepartment.length > 0 && (
        <div className="dashboard-grid">
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3>Faculty by Department</h3>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>
                Faculty distribution across {facultyByDepartment.length} departments
              </p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={facultyByDepartment} margin={{ bottom: 50, top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    stroke="#999"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#999" style={{ fontSize: "12px" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="faculty" fill="url(#colorFacultyTotal)" name="Total Faculty" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="activeFaculty" fill="url(#colorActiveFaculty)" name="Active" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorFacultyTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9C27B0" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#7B1FA2" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="colorActiveFaculty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#388E3C" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Faculty Distribution Pie Chart */}
          {facultyDistribution.length > 0 && (
            <div className="dashboard-card chart-card">
              <div className="card-header">
                <h3>Faculty Status Distribution</h3>
                <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>
                  Faculty by employment status
                </p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={facultyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {facultyDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ FACULTY BY COURSE CHART ============ */}
      {facultyCourseStats.length > 0 && (
        <div className="dashboard-grid">
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3>Faculty by Course</h3>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>
                Courses with assigned faculty ({facultyCourseStats.length} courses)
              </p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={facultyCourseStats} margin={{ bottom: 50, top: 20 }}>
                  <defs>
                    <linearGradient id="colorCourseFaculty" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#9C27B0" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    stroke="#999"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#999" style={{ fontSize: "12px" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(0,0,0,0.2)", strokeWidth: 2 }} />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Line
                    type="monotone"
                    dataKey="facultyCount"
                    stroke="#9C27B0"
                    strokeWidth={3}
                    name="Faculty Count"
                    dot={{ r: 5, fill: "#9C27B0", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, strokeWidth: 3 }}
                    fill="url(#colorCourseFaculty)"
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card system-status-card">
            <div className="card-header">
              <h3>Faculty Overview</h3>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>Faculty performance indicators</p>
            </div>
            <div className="status-list">
              {systemStatusData.map((status, i) => (
                <div className="status-item" key={i}>
                  <div className="status-info">
                    <span className="status-label">{status.label}</span>
                    <span className="status-value">{progress[i]}%</span>
                  </div>
                  <div
                    className="status-bar"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.05)",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                    }}
                  >
                    <div
                      className="status-progress"
                      style={{
                        width: `${progress[i]}%`,
                        background: `linear-gradient(90deg, ${status.color}, ${status.color}dd)`,
                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                        borderRadius: "12px",
                        boxShadow: `0 4px 12px ${status.color}40`,
                        height: "8px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e0e0e0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    backgroundColor: "rgba(156, 39, 176, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(156, 39, 176, 0.1)",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" sx={{ color: "#9C27B0" }}>
                    {stats.activeFaculty}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Faculty
                  </Typography>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    backgroundColor: "rgba(255, 87, 34, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 87, 34, 0.1)",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" sx={{ color: "#FF5722" }}>
                    {stats.totalFaculty > 0 ? ((stats.coursesWithInstructors / stats.totalCourses) * 100).toFixed(0) : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Course Coverage
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Original Students & Faculty by Department Chart */}
      {departmentData.length > 0 && (
        <div className="dashboard-grid">
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3>Students by Department</h3>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>
                Top {departmentData.length} departments by student population
              </p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData} margin={{ bottom: 50, top: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    stroke="#999"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#999" style={{ fontSize: "12px" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  {/* Only render Students bar */}
                  <Bar dataKey="students" fill="url(#colorStudents)" name="Students" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2196F3" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#1565C0" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {distributionData.length > 0 && (
            <div className="dashboard-card chart-card">
              <div className="card-header">
                <h3>Student Distribution</h3>
                <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>Students across departments</p>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => (percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : "")}
                      outerRadius={100}
                      innerRadius={0}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.1))" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {courseData.length > 0 && (
        <div className="dashboard-grid">
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3>Students Enrolled by Course</h3>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>
                Top {courseData.length} courses by enrollment
              </p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={courseData} margin={{ bottom: 50, top: 20 }}>
                  <defs>
                    <linearGradient id="colorStudentsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5722" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#FF5722" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorFacultyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    stroke="#999"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#999" style={{ fontSize: "12px" }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(0,0,0,0.2)", strokeWidth: 2 }} />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#FF5722"
                    strokeWidth={3}
                    name="Students"
                    dot={{ r: 5, fill: "#FF5722", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, strokeWidth: 3 }}
                    fill="url(#colorStudentsGradient)"
                    animationDuration={800}
                  />
                  <Line
                    type="monotone"
                    dataKey="faculty"
                    stroke="#4CAF50"
                    strokeWidth={3}
                    name="Faculty"
                    dot={{ r: 5, fill: "#4CAF50", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, strokeWidth: 3 }}
                    fill="url(#colorFacultyGradient)"
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card system-status-card">
            <div className="card-header">
              <h3>System Overview</h3>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>Key performance indicators</p>
            </div>
            <div className="status-list">
              <div className="status-item">
                <div className="status-info">
                  <span className="status-label">Active Students</span>
                  <span className="status-value">
                    {stats.totalStudents > 0
                      ? Math.round((students.filter((s) => s.status === "active").length / stats.totalStudents) * 100)
                      : 0}%
                  </span>
                </div>
                <div
                  className="status-bar"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    className="status-progress"
                    style={{
                      width: `${
                        stats.totalStudents > 0
                          ? Math.round((students.filter((s) => s.status === "active").length / stats.totalStudents) * 100)
                          : 0
                      }%`,
                      background: "linear-gradient(90deg, #4CAF50, #4CAF50dd)",
                      transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px #4CAF5040",
                      height: "8px",
                    }}
                  />
                </div>
              </div>
              <div className="status-item">
                <div className="status-info">
                  <span className="status-label">Course Enrollment Rate</span>
                  <span className="status-value">
                    {stats.totalCourses > 0 ? Math.min(Math.round((students.length / stats.totalCourses) * 10), 100) : 0}%
                  </span>
                </div>
                <div
                  className="status-bar"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    className="status-progress"
                    style={{
                      width: `${stats.totalCourses > 0 ? Math.min(Math.round((students.length / stats.totalCourses) * 10), 100) : 0}%`,
                      background: "linear-gradient(90deg, #FF9800, #FF9800dd)",
                      transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px #FF980040",
                      height: "8px",
                    }}
                  />
                </div>
              </div>
              <div className="status-item">
                <div className="status-info">
                  <span className="status-label">Faculty Allocation</span>
                  <span className="status-value">
                    {stats.totalDepartments > 0
                      ? Math.min(Math.round((stats.totalFaculty / stats.totalDepartments) * 10), 100)
                      : 0}%
                  </span>
                </div>
                <div
                  className="status-bar"
                  style={{
                    backgroundColor: "rgba(0,0,0,0.05)",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    className="status-progress"
                    style={{
                      width: `${
                        stats.totalDepartments > 0
                          ? Math.min(Math.round((stats.totalFaculty / stats.totalDepartments) * 10), 100)
                          : 0
                      }%`,
                      background: "linear-gradient(90deg, #2196F3, #2196F3dd)",
                      transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px #2196F340",
                      height: "8px",
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e0e0e0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    backgroundColor: "rgba(33, 150, 243, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(33, 150, 243, 0.1)",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {departments.reduce((sum, d) => {
                      const counts = students.filter((s) => s.department === d.name).length
                      const fac = faculty.filter((f) => f.department === d.name).length
                      return sum + counts + fac
                    }, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Population
                  </Typography>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    backgroundColor: "rgba(156, 39, 176, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(156, 39, 176, 0.1)",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" sx={{ color: "#9C27B0" }}>
                    {stats.totalFaculty > 0 ? (stats.totalStudents / stats.totalFaculty).toFixed(1) : 0}:1
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Student:Faculty Ratio
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ DETAILED FACULTY TABLE ============ */}
      {facultyByDepartment.length > 0 && (
        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Faculty Overview by Department</h3>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>
                Detailed breakdown of faculty distribution
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Department
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Total Faculty
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Active
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      On Leave
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Availability
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {facultyByDepartment.map((dept, index) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid #f0f0f0", transition: "background-color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "8px",
                              backgroundColor: "rgba(156, 39, 176, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <PersonIcon style={{ fontSize: "1.25rem", color: "#9C27B0" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#333" }}>{dept.fullName}</div>
                            <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "4px" }}>{dept.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(156, 39, 176, 0.1)",
                            color: "#7B1FA2",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {dept.faculty}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(76, 175, 80, 0.1)",
                            color: "#388E3C",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {dept.activeFaculty}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(255, 152, 0, 0.1)",
                            color: "#F57C00",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {dept.onLeave}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center", fontWeight: 500, color: "#666" }}>
                        {dept.faculty > 0 ? ((dept.activeFaculty / dept.faculty) * 100).toFixed(0) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============ COURSE-FACULTY ASSIGNMENT TABLE ============ */}
      {facultyCourseStats.length > 0 && (
        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Course-Faculty Assignments</h3>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>
                Courses with assigned instructors and faculty
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Course
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Department
                    </th>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Instructor
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Faculty Count
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {facultyCourseStats.map((course, index) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid #f0f0f0", transition: "background-color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "8px",
                              backgroundColor: "rgba(255, 87, 34, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <AssignmentIcon style={{ fontSize: "1.25rem", color: "#FF5722" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#333" }}>{course.fullName}</div>
                            <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "4px" }}>{course.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <Typography variant="body2">{course.department}</Typography>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: course.hasInstructor ? "#9C27B0" : "#999", fontSize: "0.75rem" }}>
                            {course.instructorName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ color: course.hasInstructor ? "#333" : "#999", fontStyle: course.hasInstructor ? "normal" : "italic" }}>
                            {course.instructorName}
                          </Typography>
                        </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(33, 150, 243, 0.1)",
                            color: "#1976D2",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {course.facultyCount}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <Chip
                          label={course.hasInstructor ? "Assigned" : "Unassigned"}
                          size="small"
                          color={course.hasInstructor ? "success" : "default"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {departmentData.length > 0 && (
        <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Department Overview</h3>
              <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "4px" }}>Detailed breakdown by department</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                    <th style={{ padding: "16px", textAlign: "left", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Department
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Students
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Faculty
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Total
                    </th>
                    <th style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333", fontSize: "0.95rem" }}>
                      Ratio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid #f0f0f0", transition: "background-color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "8px",
                              backgroundColor: "rgba(70, 130, 180, 0.1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <BusinessIcon style={{ fontSize: "1.25rem", color: "#4682B4" }} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#333" }}>{dept.fullName}</div>
                            <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "4px" }}>{dept.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(33, 150, 243, 0.1)",
                            color: "#1976D2",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {dept.students}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            backgroundColor: "rgba(156, 39, 176, 0.1)",
                            color: "#7B1FA2",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {dept.faculty}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "center", fontWeight: 700, color: "#333" }}>
                        {dept.total}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center", color: "#666", fontWeight: 500 }}>
                        {dept.faculty > 0 ? (dept.students / dept.faculty).toFixed(1) : "N/A"}:1
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =============== MAIN DASHBOARD COMPONENT ===============
function Dashboard() {
  const [user, setUser] = useState(null)
  const [activeMenu, setActiveMenu] = useState("Dashboard")
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const open = Boolean(anchorEl)
  const notificationOpen = Boolean(notificationAnchor)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user")
      if (!stored) {
        setUser({ full_name: "User", role: "admin", email: "user@example.com" })
        return
      }
      setUser(JSON.parse(stored))
    } catch (error) {
      console.error("Error loading user:", error)
      setUser({ full_name: "User", role: "admin", email: "user@example.com" })
    }
  }, [])

  useEffect(() => {
    const loadNotifications = () => {
      try {
        const stored = localStorage.getItem("notifications")
        if (stored) {
          setNotifications(JSON.parse(stored))
        }
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    }
    loadNotifications()

    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const addNotification = (type, title, message) => {
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    }

    const updatedNotifications = [newNotification, ...notifications]
    setNotifications(updatedNotifications)
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
  }

  useEffect(() => {
    window.addNotification = addNotification
    return () => {
      delete window.addNotification
    }
  }, [notifications])

  useEffect(() => {
    const path = window.location.pathname
    if (path === "/users") {
      setActiveMenu("Users")
    } else if (path === "/dashboard" || path === "/") {
      setActiveMenu("Dashboard")
    }
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post("/logout")
      localStorage.removeItem("user")
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
  }

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => setAnchorEl(null)

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget)
  }
  const handleNotificationClose = () => setNotificationAnchor(null)

  const handleMarkAsRead = (id) => {
    let updatedNotifications
    if (id) {
      updatedNotifications = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    } else {
      updatedNotifications = notifications.map((n) => ({ ...n, read: true }))
    }
    setNotifications(updatedNotifications)
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications))
  }

  const handleClearAll = () => {
    setNotifications([])
    localStorage.removeItem("notifications")
    handleNotificationClose()
  }

  const handleSettings = () => {
    handleMenuClose()
    window.location.href = "/settings"
  }

  const handleHelp = () => {
    handleMenuClose()
    alert("Help & Support feature coming soon!")
  }

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

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

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <Box className="dashboard-layout">
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

        <div className="sidebar-search">
          <SearchIcon className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>

        <div className="sidebar-section">
          <div className="section-label">MAIN MENU</div>
          <List className="menu-list">
            {mainMenuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    selected={activeMenu === item.label}
                    onClick={() => {
                      if (item.route) window.location.href = item.route
                      else setActiveMenu(item.label)
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
              )
            })}

            <ListItem disablePadding>
              <ListItemButton
                selected={activeMenu === "Settings" || activeMenu === "Academic Years" || activeMenu === "Departments"}
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="sidebar-menu-item"
              >
                <ListItemIcon className="menu-icon">
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  secondary="System Configuration"
                  primaryTypographyProps={{ fontSize: "0.9rem", fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: "0.75rem" }}
                />
                {settingsOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {settingsMenuItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <ListItem key={item.label} disablePadding>
                      <ListItemButton
                        selected={activeMenu === item.label}
                        onClick={() => {
                          if (item.route) window.location.href = item.route
                          else setActiveMenu(item.label)
                        }}
                        sx={{ pl: 4 }}
                        className="sidebar-menu-item"
                      >
                        <ListItemIcon className="menu-icon" sx={{ minWidth: 36 }}>
                          <IconComponent sx={{ fontSize: "1.25rem" }} />
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
        </div>

        <div style={{ flex: 1 }} />

        <div className="sidebar-footer">
          <div className="footer-links">
            <button className="footer-link" onClick={handleHelp}>
              <HelpIcon style={{ fontSize: "1.125rem" }} />
              <span>Help & Support</span>
            </button>
          </div>
        </div>
      </Drawer>

      <Box className="main-content-wrapper">
        <AppBar position="fixed" className="top-appbar" elevation={0}>
          <Toolbar>
            <Typography variant="h6" className="page-title">
              {activeMenu}
            </Typography>
            <Typography variant="body2" className="page-subtitle">
              Overview & Analytics
            </Typography>
            <div style={{ flexGrow: 1 }} />
            <Chip label={user.role || "admin"} size="small" className="user-role-chip" />
            <IconButton className="notification-btn" onClick={handleNotificationClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={handleAvatarClick}>
              <Avatar className="user-avatar">{user.full_name ? user.full_name.charAt(0) : "U"}</Avatar>
            </IconButton>

            <NotificationPanel
              anchorEl={notificationAnchor}
              open={notificationOpen}
              onClose={handleNotificationClose}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onClearAll={handleClearAll}
            />

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.1))",
                  mt: 1.5,
                  minWidth: 200,
                  "& .MuiAvatar-root": { width: 32, height: 32, ml: -0.5, mr: 1 },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem disabled>
                <Avatar sx={{ bgcolor: "#4f46e5" }}>{user.full_name ? user.full_name.charAt(0) : "U"}</Avatar>
                <div style={{ marginLeft: "8px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{user.full_name || "User"}</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{user.email || "user@example.com"}</div>
                </div>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSettings}>
                <SettingsIcon fontSize="small" style={{ marginRight: "12px", color: "#6b7280" }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleHelp}>
                <HelpIcon fontSize="small" style={{ marginRight: "12px", color: "#6b7280" }} />
                Help & Support
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" style={{ marginRight: "12px", color: "#ef4444" }} />
                <span style={{ color: "#ef4444", fontWeight: 600 }}>Logout</span>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box className="page-content">
          <Toolbar />
          {activeMenu === "Dashboard" && <DashboardOverview user={user} />}
        </Box>
      </Box>
    </Box>
  )
}

// Safe mounting with error handling
const root = document.getElementById("app")
if (root) {
  try {
    ReactDOM.createRoot(root).render(<Dashboard />)
  } catch (error) {
    console.error("Error mounting Dashboard:", error)
    root.innerHTML = `<div style="padding: 20px; color: red;">Error loading dashboard: ${error.message}</div>`
  }
} else {
  console.error("Root element #app not found")
}

export default Dashboard