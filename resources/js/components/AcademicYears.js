class AcademicYearsManager {
  constructor() {
    this.academicYears = []
    this.currentPage = 1
    this.itemsPerPage = 10
    this.searchTerm = ""
    this.filterStatus = "all"
    this.editingId = null
    this.init()
  }

  init() {
    this.loadAcademicYears()
    this.attachEventListeners()
    this.renderAcademicYears()
  }

  loadAcademicYears() {
    const stored = localStorage.getItem("academicYears")
    this.academicYears = stored
      ? JSON.parse(stored)
      : [
          {
            id: 1,
            yearName: "2024-2025",
            startDate: "2024-09-01",
            endDate: "2025-06-30",
            semesters: 2,
            currentSemester: "Fall 2024",
            totalStudents: 1250,
            status: "active",
          },
          {
            id: 2,
            yearName: "2023-2024",
            startDate: "2023-09-01",
            endDate: "2024-06-30",
            semesters: 2,
            currentSemester: "Completed",
            totalStudents: 1180,
            status: "completed",
          },
          {
            id: 3,
            yearName: "2025-2026",
            startDate: "2025-09-01",
            endDate: "2026-06-30",
            semesters: 2,
            currentSemester: "Not Started",
            totalStudents: 0,
            status: "upcoming",
          },
        ]
  }

  saveAcademicYears() {
    localStorage.setItem("academicYears", JSON.stringify(this.academicYears))
  }

  attachEventListeners() {
    const searchInput = document.getElementById("searchAcademicYears")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase()
        this.currentPage = 1
        this.renderAcademicYears()
      })
    }

    const statusFilter = document.getElementById("filterStatus")
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filterStatus = e.target.value
        this.currentPage = 1
        this.renderAcademicYears()
      })
    }

    const addBtn = document.getElementById("addAcademicYearBtn")
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal())
    }

    const closeBtn = document.querySelector(".modal-close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal())
    }

    const modalOverlay = document.getElementById("academicYearModal")
    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          this.closeModal()
        }
      })
    }

    const form = document.getElementById("academicYearForm")
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        this.saveAcademicYear()
      })
    }
  }

  getFilteredAcademicYears() {
    return this.academicYears.filter((year) => {
      const matchesSearch =
        year.yearName.toLowerCase().includes(this.searchTerm) ||
        year.currentSemester.toLowerCase().includes(this.searchTerm)

      const matchesStatus = this.filterStatus === "all" || year.status === this.filterStatus

      return matchesSearch && matchesStatus
    })
  }

  renderAcademicYears() {
    const filtered = this.getFilteredAcademicYears()
    const totalPages = Math.ceil(filtered.length / this.itemsPerPage)
    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    const paginatedYears = filtered.slice(start, end)

    const tbody = document.getElementById("academicYearsTableBody")
    if (!tbody) return

    if (paginatedYears.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data">No academic years found</td>
                </tr>
            `
    } else {
      tbody.innerHTML = paginatedYears
        .map(
          (year) => `
                <tr>
                    <td><strong>${year.yearName}</strong></td>
                    <td>${this.formatDate(year.startDate)}</td>
                    <td>${this.formatDate(year.endDate)}</td>
                    <td>${year.semesters}</td>
                    <td>${year.currentSemester}</td>
                    <td>${year.totalStudents}</td>
                    <td>
                        <span class="status-badge status-${year.status}">
                            ${year.status}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="academicYearsManager.editAcademicYear(${year.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="academicYearsManager.deleteAcademicYear(${year.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `,
        )
        .join("")
    }

    this.renderPagination(totalPages)
    this.updateStats(filtered.length)
  }

  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
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
                onclick="academicYearsManager.goToPage(${this.currentPage - 1})">
                Previous
            </button>
        `

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `
                    <button class="pagination-btn ${i === this.currentPage ? "active" : ""}" 
                        onclick="academicYearsManager.goToPage(${i})">
                        ${i}
                    </button>
                `
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span class="pagination-ellipsis">...</span>`
      }
    }

    html += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? "disabled" : ""} 
                onclick="academicYearsManager.goToPage(${this.currentPage + 1})">
                Next
            </button>
        `

    pagination.innerHTML = html
  }

  updateStats(filteredCount) {
    const totalEl = document.getElementById("totalAcademicYears")
    const activeEl = document.getElementById("activeAcademicYears")

    if (totalEl) totalEl.textContent = filteredCount
    if (activeEl) {
      const activeCount = this.academicYears.filter((y) => y.status === "active").length
      activeEl.textContent = activeCount
    }
  }

  goToPage(page) {
    this.currentPage = page
    this.renderAcademicYears()
  }

  openModal(year = null) {
    this.editingId = year ? year.id : null
    const modal = document.getElementById("academicYearModal")
    const form = document.getElementById("academicYearForm")
    const title = document.getElementById("modalTitle")

    if (title) {
      title.textContent = year ? "Edit Academic Year" : "Add New Academic Year"
    }

    if (form) {
      if (year) {
        form.elements["yearName"].value = year.yearName
        form.elements["startDate"].value = year.startDate
        form.elements["endDate"].value = year.endDate
        form.elements["semesters"].value = year.semesters
        form.elements["currentSemester"].value = year.currentSemester
        form.elements["totalStudents"].value = year.totalStudents
        form.elements["status"].value = year.status
      } else {
        form.reset()
        form.elements["status"].value = "upcoming"
        form.elements["semesters"].value = 2
        form.elements["totalStudents"].value = 0
      }
    }

    if (modal) {
      modal.classList.add("active")
    }
  }

  closeModal() {
    const modal = document.getElementById("academicYearModal")
    if (modal) {
      modal.classList.remove("active")
    }
    this.editingId = null
  }

  saveAcademicYear() {
    const form = document.getElementById("academicYearForm")
    const formData = new FormData(form)

    const yearData = {
      yearName: formData.get("yearName"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      semesters: Number.parseInt(formData.get("semesters")),
      currentSemester: formData.get("currentSemester"),
      totalStudents: Number.parseInt(formData.get("totalStudents")),
      status: formData.get("status"),
    }

    if (this.editingId) {
      const index = this.academicYears.findIndex((y) => y.id === this.editingId)
      if (index !== -1) {
        this.academicYears[index] = { ...this.academicYears[index], ...yearData }
      }
    } else {
      const newYear = {
        id: Date.now(),
        ...yearData,
      }
      this.academicYears.push(newYear)
    }

    this.saveAcademicYears()
    this.renderAcademicYears()
    this.closeModal()
    this.showNotification(this.editingId ? "Academic year updated successfully" : "Academic year added successfully")
  }

  editAcademicYear(id) {
    const year = this.academicYears.find((y) => y.id === id)
    if (year) {
      this.openModal(year)
    }
  }

  deleteAcademicYear(id) {
    if (confirm("Are you sure you want to delete this academic year?")) {
      this.academicYears = this.academicYears.filter((y) => y.id !== id)
      this.saveAcademicYears()
      this.renderAcademicYears()
      this.showNotification("Academic year deleted successfully")
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

let academicYearsManager
document.addEventListener("DOMContentLoaded", () => {
  academicYearsManager = new AcademicYearsManager()
})
