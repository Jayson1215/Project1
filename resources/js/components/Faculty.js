class FacultyManager {
  constructor() {
    this.faculty = []
    this.currentPage = 1
    this.itemsPerPage = 10
    this.searchTerm = ""
    this.filterDepartment = "all"
    this.filterStatus = "all"
    this.editingId = null
    this.init()
  }

  init() {
    this.loadFaculty()
    this.attachEventListeners()
    this.renderFaculty()
  }

  loadFaculty() {
    const stored = localStorage.getItem("faculty")
    this.faculty = stored
      ? JSON.parse(stored)
      : [
          {
            id: 1,
            facultyId: "FAC2024001",
            firstName: "Dr. Robert",
            lastName: "Williams",
            email: "robert.williams@university.edu",
            phone: "+1234567890",
            department: "Computer Science",
            position: "Professor",
            specialization: "Artificial Intelligence",
            hireDate: "2015-08-15",
            status: "active",
          },
          {
            id: 2,
            facultyId: "FAC2024002",
            firstName: "Dr. Sarah",
            lastName: "Davis",
            email: "sarah.davis@university.edu",
            phone: "+1234567891",
            department: "Mathematics",
            position: "Associate Professor",
            specialization: "Applied Mathematics",
            hireDate: "2018-01-10",
            status: "active",
          },
          {
            id: 3,
            facultyId: "FAC2024003",
            firstName: "Dr. James",
            lastName: "Brown",
            email: "james.brown@university.edu",
            phone: "+1234567892",
            department: "Engineering",
            position: "Assistant Professor",
            specialization: "Mechanical Engineering",
            hireDate: "2020-09-01",
            status: "active",
          },
        ]
  }

  saveFaculty() {
    localStorage.setItem("faculty", JSON.stringify(this.faculty))
  }

  attachEventListeners() {
    const searchInput = document.getElementById("searchFaculty")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase()
        this.currentPage = 1
        this.renderFaculty()
      })
    }

    const departmentFilter = document.getElementById("filterDepartment")
    if (departmentFilter) {
      departmentFilter.addEventListener("change", (e) => {
        this.filterDepartment = e.target.value
        this.currentPage = 1
        this.renderFaculty()
      })
    }

    const statusFilter = document.getElementById("filterStatus")
    if (statusFilter) {
      statusFilter.addEventListener("change", (e) => {
        this.filterStatus = e.target.value
        this.currentPage = 1
        this.renderFaculty()
      })
    }

    const addBtn = document.getElementById("addFacultyBtn")
    if (addBtn) {
      addBtn.addEventListener("click", () => this.openModal())
    }

    const closeBtn = document.querySelector(".modal-close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal())
    }

    const modalOverlay = document.getElementById("facultyModal")
    if (modalOverlay) {
      modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
          this.closeModal()
        }
      })
    }

    const form = document.getElementById("facultyForm")
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        this.saveFacultyMember()
      })
    }
  }

  getFilteredFaculty() {
    return this.faculty.filter((member) => {
      const matchesSearch =
        member.firstName.toLowerCase().includes(this.searchTerm) ||
        member.lastName.toLowerCase().includes(this.searchTerm) ||
        member.email.toLowerCase().includes(this.searchTerm) ||
        member.facultyId.toLowerCase().includes(this.searchTerm)

      const matchesDepartment = this.filterDepartment === "all" || member.department === this.filterDepartment
      const matchesStatus = this.filterStatus === "all" || member.status === this.filterStatus

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }

  renderFaculty() {
    const filtered = this.getFilteredFaculty()
    const totalPages = Math.ceil(filtered.length / this.itemsPerPage)
    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    const paginatedFaculty = filtered.slice(start, end)

    const tbody = document.getElementById("facultyTableBody")
    if (!tbody) return

    if (paginatedFaculty.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="no-data">No faculty members found</td>
                </tr>
            `
    } else {
      tbody.innerHTML = paginatedFaculty
        .map(
          (member) => `
                <tr>
                    <td>${member.facultyId}</td>
                    <td>${member.firstName} ${member.lastName}</td>
                    <td>${member.email}</td>
                    <td>${member.phone}</td>
                    <td>${member.department}</td>
                    <td>${member.position}</td>
                    <td>${member.specialization}</td>
                    <td>
                        <span class="status-badge status-${member.status}">
                            ${member.status}
                        </span>
                    </td>
                    <td class="actions">
                        <button class="btn-icon btn-edit" onclick="facultyManager.editFaculty(${member.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="facultyManager.deleteFaculty(${member.id})" title="Delete">
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
                onclick="facultyManager.goToPage(${this.currentPage - 1})">
                Previous
            </button>
        `

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
        html += `
                    <button class="pagination-btn ${i === this.currentPage ? "active" : ""}" 
                        onclick="facultyManager.goToPage(${i})">
                        ${i}
                    </button>
                `
      } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
        html += `<span class="pagination-ellipsis">...</span>`
      }
    }

    html += `
            <button class="pagination-btn" ${this.currentPage === totalPages ? "disabled" : ""} 
                onclick="facultyManager.goToPage(${this.currentPage + 1})">
                Next
            </button>
        `

    pagination.innerHTML = html
  }

  updateStats(filteredCount) {
    const totalEl = document.getElementById("totalFaculty")
    const activeEl = document.getElementById("activeFaculty")

    if (totalEl) totalEl.textContent = filteredCount
    if (activeEl) {
      const activeCount = this.faculty.filter((f) => f.status === "active").length
      activeEl.textContent = activeCount
    }
  }

  goToPage(page) {
    this.currentPage = page
    this.renderFaculty()
  }

  openModal(member = null) {
    this.editingId = member ? member.id : null
    const modal = document.getElementById("facultyModal")
    const form = document.getElementById("facultyForm")
    const title = document.getElementById("modalTitle")

    if (title) {
      title.textContent = member ? "Edit Faculty Member" : "Add New Faculty Member"
    }

    if (form) {
      if (member) {
        form.elements["facultyId"].value = member.facultyId
        form.elements["firstName"].value = member.firstName
        form.elements["lastName"].value = member.lastName
        form.elements["email"].value = member.email
        form.elements["phone"].value = member.phone
        form.elements["department"].value = member.department
        form.elements["position"].value = member.position
        form.elements["specialization"].value = member.specialization
        form.elements["hireDate"].value = member.hireDate
        form.elements["status"].value = member.status
      } else {
        form.reset()
        form.elements["status"].value = "active"
      }
    }

    if (modal) {
      modal.classList.add("active")
    }
  }

  closeModal() {
    const modal = document.getElementById("facultyModal")
    if (modal) {
      modal.classList.remove("active")
    }
    this.editingId = null
  }

  saveFacultyMember() {
    const form = document.getElementById("facultyForm")
    const formData = new FormData(form)

    const memberData = {
      facultyId: formData.get("facultyId"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      department: formData.get("department"),
      position: formData.get("position"),
      specialization: formData.get("specialization"),
      hireDate: formData.get("hireDate"),
      status: formData.get("status"),
    }

    if (this.editingId) {
      const index = this.faculty.findIndex((f) => f.id === this.editingId)
      if (index !== -1) {
        this.faculty[index] = { ...this.faculty[index], ...memberData }
      }
    } else {
      const newMember = {
        id: Date.now(),
        ...memberData,
      }
      this.faculty.push(newMember)
    }

    this.saveFaculty()
    this.renderFaculty()
    this.closeModal()
    this.showNotification(this.editingId ? "Faculty member updated successfully" : "Faculty member added successfully")
  }

  editFaculty(id) {
    const member = this.faculty.find((f) => f.id === id)
    if (member) {
      this.openModal(member)
    }
  }

  deleteFaculty(id) {
    if (confirm("Are you sure you want to delete this faculty member?")) {
      this.faculty = this.faculty.filter((f) => f.id !== id)
      this.saveFaculty()
      this.renderFaculty()
      this.showNotification("Faculty member deleted successfully")
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

let facultyManager
document.addEventListener("DOMContentLoaded", () => {
  facultyManager = new FacultyManager()
})
