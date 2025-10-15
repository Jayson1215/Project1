class CoursesManager {
  constructor() {
    this.courses = []
    this.currentPage = 1
    this.itemsPerPage = 10
    this.searchTerm = ""
    this.filterDepartment = "all"
    this.filterStatus = "all"
    this.editingId = null
    this.init()
  }

  init() {
    this.loadCourses()
    this.attachEventListeners()
    this.renderCourses()
  }

  loadCourses() {
    const stored = localStorage.getItem("courses")
    this.courses = stored
      ? JSON.parse(stored)
      : [
          {
            id: 1,
            courseCode: "CS101",
            courseName: "Introduction to Computer Science",
            department: "Computer Science",
            credits: 3,
            instructor: "Dr. Robert Williams",
            semester: "Fall 2024",
            capacity: 50,
            enrolled: 45,
            status: "active",
          },
          {
            id: 2,
            courseCode: "MATH201",
            courseName: "Calculus II",
            department: "Mathematics",
            credits: 4,
            instructor: "Dr. Sarah Davis",
            semester: "Fall 2024",
            capacity: 40,
            enrolled: 38,
            status: "active",
          },
          {
            id: 3,
            courseCode: "ENG301",
            courseName: "Thermodynamics",
            department: "Engineering",
            credits: 3,
            instructor: "Dr. James Brown",
            semester: "Fall 2024",
            capacity: 35,
            enrolled: 30,
            status: "active",
          },
        ]
  }

  saveCourses() {
    localStorage.setItem("courses", JSON.stringify(this.courses))
  }

  attachEventListeners() {
    const searchInput = document.getElementById("searchCourses")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase()
        this.currentPage = 1
        this.renderCourses()
      })
    }

    const departmentFilter = document.getElementById("filterDepartment")
    if (departmentFilter) {
      departmentFilter.addEventListener("change", (e) => {
        this.filterDepartment = e.target.value
        this.currentPage = 1
        this.renderCourses()
      })
    }

    const statusFilter = document.getElementById("filterStatus")
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filterStatus = e.target.value
        this.currentPage = 1
        this.renderCourses()
      })
    }

    const addBtn = document.getElementById("addCourseBtn")
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal())
    }

    const closeBtn = document.querySelector(".modal-close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal())
    }

    const modalOverlay = document.getElementById("courseModal")
    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          this.closeModal()
        }
      })
    }

    const form = document.getElementById("courseForm")
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        this.saveCourse()
      })
    }
  }

  getFilteredCourses() {
    return this.courses.filter((course) => {
      const matchesSearch =
        course.courseCode.toLowerCase().includes(this.searchTerm) ||
        course.courseName.toLowerCase().includes(this.searchTerm) ||
        course.instructor.toLowerCase().includes(this.searchTerm)

      const matchesDepartment = this.filterDepartment === "all" || course.department === this.filterDepartment
      const matchesStatus = this.filterStatus === "all" || course.status === this.filterStatus

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }

  renderCourses() {
    const filtered = this.getFilteredCourses()
    const totalPages = Math.ceil(filtered.length / this.itemsPerPage)
    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    const paginatedCourses = filtered.slice(start, end)

    const tbody = document.getElementById("coursesTableBody")
    if (!tbody) return

    if (paginatedCourses.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="no-data">No courses found</td>
                </tr>
            `
    } else {
      tbody.innerHTML = paginatedCourses
        .map((course) => {
          const enrollmentPercentage = ((course.enrolled / course.capacity) * 100).toFixed(0)
          return `
                    <tr>
                        <td><strong>${course.courseCode}</strong></td>
                        <td>${course.courseName}</td>
                        <td>${course.department}</td>
                        <td>${course.credits}</td>
                        <td>${course.instructor}</td>
                        <td>${course.semester}</td>
                        <td>
                            <div class="enrollment-info">
                                <span>${course.enrolled}/${course.capacity}</span>
                                <div class="enrollment-bar">
                                    <div class="enrollment-fill" style="width: ${enrollmentPercentage}%"></div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="status-badge status-${course.status}">
                                ${course.status}
                            </span>
                        </td>
                        <td class="actions">
                            <button class="btn-icon btn-edit" onclick="coursesManager.editCourse(${course.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-delete" onclick="coursesManager.deleteCourse(${course.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `
        })
        .join("")
    }

    this.renderPagination(totalPages)
    this.updateStats(filtered.length)
  }

  renderPagination(totalPages) {
    const pagination = document.getElementById("pagination")
    if (!pagination) return

    if (totalPages <= 1) {
      pagination.innerHTML = ""
      return
    }

    let html = `
            <button class="pagination-btn" ${this.currentPage === 1 ? "disabled" : ""} 
                onclick="coursesManager.goToPage(${this.currentPage - 1})">
                Previous
            </button>
        `

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `
                    <button class="pagination-btn ${i === this.currentPage ? "active" : ""}" 
                        onclick="coursesManager.goToPage(${i})">
                        ${i}
                    </button>
                `
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span class="pagination-ellipsis">...</span>`
      }
    }

    html += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? "disabled" : ""} 
                onclick="coursesManager.goToPage(${this.currentPage + 1})">
                Next
            </button>
        `

    pagination.innerHTML = html
  }

  updateStats(filteredCount) {
    const totalEl = document.getElementById("totalCourses")
    const activeEl = document.getElementById("activeCourses")

    if (totalEl) totalEl.textContent = filteredCount
    if (activeEl) {
      const activeCount = this.courses.filter((c) => c.status === "active").length
      activeEl.textContent = activeCount
    }
  }

  goToPage(page) {
    this.currentPage = page
    this.renderCourses()
  }

  openModal(course = null) {
    this.editingId = course ? course.id : null
    const modal = document.getElementById("courseModal")
    const form = document.getElementById("courseForm")
    const title = document.getElementById("modalTitle")

    if (title) {
      title.textContent = course ? "Edit Course" : "Add New Course"
    }

    if (form) {
      if (course) {
        form.elements["courseCode"].value = course.courseCode
        form.elements["courseName"].value = course.courseName
        form.elements["department"].value = course.department
        form.elements["credits"].value = course.credits
        form.elements["instructor"].value = course.instructor
        form.elements["semester"].value = course.semester
        form.elements["capacity"].value = course.capacity
        form.elements["enrolled"].value = course.enrolled
        form.elements["status"].value = course.status
      } else {
        form.reset()
        form.elements["status"].value = "active"
        form.elements["enrolled"].value = 0
      }
    }

    if (modal) {
      modal.classList.add("active")
    }
  }

  closeModal() {
    const modal = document.getElementById("courseModal")
    if (modal) {
      modal.classList.remove("active")
    }
    this.editingId = null
  }

  saveCourse() {
    const form = document.getElementById("courseForm")
    const formData = new FormData(form)

    const courseData = {
      courseCode: formData.get("courseCode"),
      courseName: formData.get("courseName"),
      department: formData.get("department"),
      credits: Number.parseInt(formData.get("credits")),
      instructor: formData.get("instructor"),
      semester: formData.get("semester"),
      capacity: Number.parseInt(formData.get("capacity")),
      enrolled: Number.parseInt(formData.get("enrolled")),
      status: formData.get("status"),
    }

    if (this.editingId) {
      const index = this.courses.findIndex((c) => c.id === this.editingId)
      if (index !== -1) {
        this.courses[index] = { ...this.courses[index], ...courseData }
      }
    } else {
      const newCourse = {
        id: Date.now(),
        ...courseData,
      }
      this.courses.push(newCourse)
    }

    this.saveCourses()
    this.renderCourses()
    this.closeModal()
    this.showNotification(this.editingId ? "Course updated successfully" : "Course added successfully")
  }

  editCourse(id) {
    const course = this.courses.find((c) => c.id === id)
    if (course) {
      this.openModal(course)
    }
  }

  deleteCourse(id) {
    if (confirm("Are you sure you want to delete this course?")) {
      this.courses = this.courses.filter((c) => c.id !== id)
      this.saveCourses()
      this.renderCourses()
      this.showNotification("Course deleted successfully")
    }
  }

  showNotification(message) {
    const notification = document.createElement("div")
    notification.className = "notification success"
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }
}

let coursesManager
document.addEventListener("DOMContentLoaded", () => {
  coursesManager = new CoursesManager()
})
