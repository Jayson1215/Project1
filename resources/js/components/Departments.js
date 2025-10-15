class DepartmentsManager {
  constructor() {
    this.departments = []
    this.currentPage = 1
    this.itemsPerPage = 10
    this.searchTerm = ""
    this.filterStatus = "all"
    this.editingId = null
    this.init()
  }

  init() {
    this.loadDepartments()
    this.attachEventListeners()
    this.renderDepartments()
  }

  loadDepartments() {
    const stored = localStorage.getItem("departments")
    this.departments = stored
      ? JSON.parse(stored)
      : [
          {
            id: 1,
            departmentCode: "CS",
            departmentName: "Computer Science",
            head: "Dr. Robert Williams",
            faculty: 15,
            students: 450,
            courses: 25,
            building: "Science Building A",
            status: "active",
          },
          {
            id: 2,
            departmentCode: "MATH",
            departmentName: "Mathematics",
            head: "Dr. Sarah Davis",
            faculty: 12,
            students: 380,
            courses: 20,
            building: "Science Building B",
            status: "active",
          },
          {
            id: 3,
            departmentCode: "ENG",
            departmentName: "Engineering",
            head: "Dr. James Brown",
            faculty: 18,
            students: 520,
            courses: 30,
            building: "Engineering Complex",
            status: "active",
          },
        ]
  }

  saveDepartments() {
    localStorage.setItem("departments", JSON.stringify(this.departments))
  }

  attachEventListeners() {
    const searchInput = document.getElementById("searchDepartments")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase()
        this.currentPage = 1
        this.renderDepartments()
      })
    }

    const statusFilter = document.getElementById("filterStatus")
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filterStatus = e.target.value
        this.currentPage = 1
        this.renderDepartments()
      })
    }

    const addBtn = document.getElementById("addDepartmentBtn")
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal())
    }

    const closeBtn = document.querySelector(".modal-close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal())
    }

    const modalOverlay = document.getElementById("departmentModal")
    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          this.closeModal()
        }
      })
    }

    const form = document.getElementById("departmentForm")
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        this.saveDepartment()
      })
    }
  }

  getFilteredDepartments() {
    return this.departments.filter((dept) => {
      const matchesSearch =
        dept.departmentCode.toLowerCase().includes(this.searchTerm) ||
        dept.departmentName.toLowerCase().includes(this.searchTerm) ||
        dept.head.toLowerCase().includes(this.searchTerm)

      const matchesStatus = this.filterStatus === "all" || dept.status === this.filterStatus

      return matchesSearch && matchesStatus
    })
  }

  renderDepartments() {
    const filtered = this.getFilteredDepartments()
    const totalPages = Math.ceil(filtered.length / this.itemsPerPage)
    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    const paginatedDepartments = filtered.slice(start, end)

    const tbody = document.getElementById("departmentsTableBody")
    if (!tbody) return

    if (paginatedDepartments.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="no-data">No departments found</td>
                </tr>
            `
    } else {
      tbody.innerHTML = paginatedDepartments
        .map(
          (dept) => `
                <tr>
                    <td><strong>${dept.departmentCode}</strong></td>
                    <td>${dept.departmentName}</td>
                    <td>${dept.head}</td>
                    <td>${dept.faculty}</td>
                    <td>${dept.students}</td>
                    <td>${dept.courses}</td>
                    <td>
                        <span class="status-badge status-${dept.status}">
                            ${dept.status}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="departmentsManager.editDepartment(${dept.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="departmentsManager.deleteDepartment(${dept.id})" title="Delete">
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

  renderPagination(totalPages) {
    const pagination = document.getElementById("pagination")
    if (!pagination) return

    if (totalPages <= 1) {
      pagination.innerHTML = ""
      return
    }

    let html = `
            <button class="pagination-btn" ${this.currentPage === 1 ? "disabled" : ""} 
                onclick="departmentsManager.goToPage(${this.currentPage - 1})">
                Previous
            </button>
        `

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `
                    <button class="pagination-btn ${i === this.currentPage ? "active" : ""}" 
                        onclick="departmentsManager.goToPage(${i})">
                        ${i}
                    </button>
                `
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span class="pagination-ellipsis">...</span>`
      }
    }

    html += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? "disabled" : ""} 
                onclick="departmentsManager.goToPage(${this.currentPage + 1})">
                Next
            </button>
        `

    pagination.innerHTML = html
  }

  updateStats(filteredCount) {
    const totalEl = document.getElementById("totalDepartments")
    const activeEl = document.getElementById("activeDepartments")

    if (totalEl) totalEl.textContent = filteredCount
    if (activeEl) {
      const activeCount = this.departments.filter((d) => d.status === "active").length
      activeEl.textContent = activeCount
    }
  }

  goToPage(page) {
    this.currentPage = page
    this.renderDepartments()
  }

  openModal(dept = null) {
    this.editingId = dept ? dept.id : null
    const modal = document.getElementById("departmentModal")
    const form = document.getElementById("departmentForm")
    const title = document.getElementById("modalTitle")

    if (title) {
      title.textContent = dept ? "Edit Department" : "Add New Department"
    }

    if (form) {
      if (dept) {
        form.elements["departmentCode"].value = dept.departmentCode
        form.elements["departmentName"].value = dept.departmentName
        form.elements["head"].value = dept.head
        form.elements["faculty"].value = dept.faculty
        form.elements["students"].value = dept.students
        form.elements["courses"].value = dept.courses
        form.elements["building"].value = dept.building
        form.elements["status"].value = dept.status
      } else {
        form.reset()
        form.elements["status"].value = "active"
        form.elements["faculty"].value = 0
        form.elements["students"].value = 0
        form.elements["courses"].value = 0
      }
    }

    if (modal) {
      modal.classList.add("active")
    }
  }

  closeModal() {
    const modal = document.getElementById("departmentModal")
    if (modal) {
      modal.classList.remove("active")
    }
    this.editingId = null
  }

  saveDepartment() {
    const form = document.getElementById("departmentForm")
    const formData = new FormData(form)

    const deptData = {
      departmentCode: formData.get("departmentCode"),
      departmentName: formData.get("departmentName"),
      head: formData.get("head"),
      faculty: Number.parseInt(formData.get("faculty")),
      students: Number.parseInt(formData.get("students")),
      courses: Number.parseInt(formData.get("courses")),
      building: formData.get("building"),
      status: formData.get("status"),
    }

    if (this.editingId) {
      const index = this.departments.findIndex((d) => d.id === this.editingId)
      if (index !== -1) {
        this.departments[index] = { ...this.departments[index], ...deptData }
      }
    } else {
      const newDept = {
        id: Date.now(),
        ...deptData,
      }
      this.departments.push(newDept)
    }

    this.saveDepartments()
    this.renderDepartments()
    this.closeModal()
    this.showNotification(this.editingId ? "Department updated successfully" : "Department added successfully")
  }

  editDepartment(id) {
    const dept = this.departments.find((d) => d.id === id)
    if (dept) {
      this.openModal(dept)
    }
  }

  deleteDepartment(id) {
    if (confirm("Are you sure you want to delete this department?")) {
      this.departments = this.departments.filter((d) => d.id !== id)
      this.saveDepartments()
      this.renderDepartments()
      this.showNotification("Department deleted successfully")
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

let departmentsManager
document.addEventListener("DOMContentLoaded", () => {
  departmentsManager = new DepartmentsManager()
})
