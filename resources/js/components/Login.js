"use client"

import { useState, useEffect } from "react"
import axios from "axios"

// ensure cookies are sent (needed for Laravel Sanctum / CSRF protected updates)
axios.defaults.withCredentials = true

export default function Login() {
  const [adminUser, setAdminUser] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState("initial")
  const [selectedUser, setSelectedUser] = useState(null)
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  })
  const [registerError, setRegisterError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)

  useEffect(() => {
    const initializeLogin = async () => {
      console.log("[Login] Initializing login page...")
      try {
        // ensure Laravel Sanctum CSRF cookie is set for subsequent state-changing requests
        await axios.get("/sanctum/csrf-cookie")
        console.log("[Login] Obtained /sanctum/csrf-cookie")
      } catch (csrfErr) {
        console.warn("[Login] /sanctum/csrf-cookie request failed:", csrfErr?.message || csrfErr)
      }
      await initializeAdmin()
      await loadUsers()
    }
    initializeLogin()
  }, [])

  const initializeAdmin = async () => {
    try {
      // Try to get admin from API first
      try {
        const response = await axios.get("/api/users")
        const apiUsers = response.data
        if (Array.isArray(apiUsers)) {
          const admin = apiUsers.find((u) => u.role === "admin")
          if (admin) {
            console.log("[Login] Admin found in API")
            setAdminUser(admin)
            setStep("initial")
            return
          }
        }
      } catch (apiError) {
        console.log("[Login] API check failed, using localStorage")
      }

      // Fallback to localStorage
      const allUsersStr = localStorage.getItem("all_users")
      let allUsers = []
      if (allUsersStr) {
        try {
          const parsed = JSON.parse(allUsersStr)
          allUsers = Array.isArray(parsed) ? parsed : []
        } catch (parseError) {
          console.error("[Login] Failed to parse users from localStorage")
          allUsers = []
        }
      }

      let admin = allUsers.find((u) => u.role === "admin")

      if (!admin) {
        admin = {
          id: 1,
          name: "admin",
          full_name: "Administrator",
          email: "admin@gmail.com",
          password: "admin123",
          role: "admin",
          status: "active",
          last_login: null,
          created_at: new Date().toISOString(),
        }
        allUsers.push(admin)
        localStorage.setItem("all_users", JSON.stringify(allUsers))
        console.log("[Login] Created new admin")
      }

      setAdminUser(admin)
      setStep("initial")
    } catch (err) {
      console.error("[Login] Error initializing admin:", err)
      setStep("initial")
    }
  }

  const loadUsers = async () => {
    try {
      console.log("[Login] Loading users...")

      // Try API first
      try {
        const response = await axios.get("/api/users")
        const apiUsers = response.data?.data || response.data
        if (Array.isArray(apiUsers)) {
          console.log("[Login] Loaded from API:", apiUsers.length, "users")

          // Preserve passwords from localStorage
          const localStr = localStorage.getItem("all_users") || "[]"
          let localUsers = []
          try {
            const parsed = JSON.parse(localStr)
            localUsers = Array.isArray(parsed) ? parsed : []
          } catch (e) {
            localUsers = []
          }

          // Merge API users with local passwords
          const merged = apiUsers.map((apiUser) => {
            const localUser = localUsers.find((l) => l.email === apiUser.email || l.id === apiUser.id)
            return {
              ...apiUser,
              // Preserve password from localStorage, or use API password if available
              password: localUser?.password || apiUser?.password || undefined,
              full_name: apiUser.full_name || apiUser.name,
              username: apiUser.username || apiUser.name,
            }
          })

          // Add any local-only users that aren't in the API response
          localUsers.forEach((localUser) => {
            const existsInApi = merged.some((m) => m.email === localUser.email || m.id === localUser.id)
            if (!existsInApi && localUser.role !== "admin") {
              merged.push(localUser)
            }
          })

          localStorage.setItem("all_users", JSON.stringify(merged))
          const regularUsers = merged.filter((u) => u.role !== "admin")
          console.log("[Login] Final user list:", regularUsers.length, "users")
          setAllUsers(regularUsers)
          return
        }
      } catch (apiError) {
        console.log("[Login] API load failed, using localStorage:", apiError?.message)
      }

      // Fallback to localStorage
      const allUsersStr = localStorage.getItem("all_users")
      let users = []
      if (allUsersStr) {
        try {
          const parsed = JSON.parse(allUsersStr)
          users = Array.isArray(parsed) ? parsed : []
        } catch (parseError) {
          console.error("[Login] Failed to parse users from localStorage")
          users = []
        }
      }

      const regularUsers = users.filter((u) => u.role !== "admin")
      console.log("[Login] Loaded from localStorage:", regularUsers.length, "users")
      regularUsers.forEach((u) => {
        console.log("[Login] User:", u.email, "| Has Password:", !!u.password)
      })
      setAllUsers(regularUsers)
    } catch (err) {
      console.error("[Login] Error loading users:", err)
    }
  }

  const handleDeleteAccount = (user, e) => {
    e.stopPropagation()
    setUserToDelete(user)
    setShowDeleteConfirm(true)
    setDeletePassword("")
    setDeleteError("")
    setShowDeletePassword(false)
  }

  const confirmDeleteAccount = async () => {
    setDeleteError("")

    if (!deletePassword) {
      setDeleteError("Please enter your password to confirm deletion")
      return
    }

    try {
      // Try API first
      try {
        const response = await axios.get("/api/users")
        const apiUsers = response.data
        const userToVerify = apiUsers.find((u) => u.id === userToDelete.id)

        if (userToVerify && userToVerify.password === deletePassword) {
          await axios.delete(`/api/users/${userToDelete.id}`)
          console.log("[Login] User deleted via API")

          setShowDeleteConfirm(false)
          setUserToDelete(null)
          setDeletePassword("")
          setShowDeletePassword(false)
          await loadUsers()
          alert(`Account "${userToVerify.name}" has been successfully deleted.`)
          return
        } else if (userToVerify) {
          setDeleteError("Incorrect password")
          return
        }
      } catch (apiError) {
        console.log("[Login] API delete failed, using localStorage")
      }

      // Fallback to localStorage
      const allUsersStr = localStorage.getItem("all_users") || "[]"
      const allUsers = JSON.parse(allUsersStr)

      const userToVerify = allUsers.find((u) => u.id === userToDelete.id)

      if (!userToVerify) {
        setDeleteError("User not found")
        return
      }

      if (userToVerify.password !== deletePassword) {
        setDeleteError("Incorrect password")
        return
      }

      const updatedUsers = allUsers.filter((u) => u.id !== userToDelete.id)
      localStorage.setItem("all_users", JSON.stringify(updatedUsers))

      setShowDeleteConfirm(false)
      setUserToDelete(null)
      setDeletePassword("")
      setShowDeletePassword(false)
      await loadUsers()
      alert(`Account "${userToVerify.name}" has been successfully deleted.`)
    } catch (err) {
      console.error("[Login] Delete error:", err)
      setDeleteError("Failed to delete account. Please try again.")
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setUserToDelete(null)
    setDeletePassword("")
    setDeleteError("")
    setShowDeletePassword(false)
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!adminUser) {
      setError("Admin not found")
      return
    }

    if (!password) {
      setError("Please enter password")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      console.log("[Login] Checking admin password. Input:", password, "Admin password:", adminUser?.password)

      if (adminUser.password === password) {
        // Try to update last login via API
        try {
          await axios.put(`/api/users/${adminUser.id}`, {
            last_login: new Date().toLocaleString(),
          })
        } catch (updateError) {
          console.log("[Login] API update failed for last_login")
        }

        // Update localStorage
        const allUsersStr = localStorage.getItem("all_users") || "[]"
        const allUsers = JSON.parse(allUsersStr)
        const updatedUsers = allUsers.map((u) =>
          u.id === adminUser.id ? { ...u, last_login: new Date().toLocaleString() } : u,
        )
        localStorage.setItem("all_users", JSON.stringify(updatedUsers))

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...adminUser,
            last_login: new Date().toLocaleString(),
          }),
        )

        console.log("[Login] Admin login successful!")
        window.location.href = "/dashboard"
      } else {
        setError("Invalid password. Admin password is 'admin123'")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("[Login] Login error:", err)
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleUserLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!selectedUser || !password) {
      setError("Please select a user and enter password")
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      let currentUser = selectedUser
      const allUsersStr = localStorage.getItem("all_users") || "[]"

      try {
        const allUsers = JSON.parse(allUsersStr)
        if (Array.isArray(allUsers)) {
          const freshUser = allUsers.find((u) => u.email === selectedUser.email)
          if (freshUser) {
            currentUser = freshUser
            console.log(
              "[Login] Found fresh user from storage:",
              currentUser.email,
              "| Password exists:",
              !!currentUser.password,
            )
          }
        }
      } catch (parseError) {
        console.error("[Login] Failed to parse users from localStorage:", parseError)
      }

      // Try authenticating against common API endpoints first (if backend supports it).
      const apiEndpoints = ["/api/login", "/login", "/api/auth/login"]
      for (const ep of apiEndpoints) {
        try {
          const resp = await axios.post(ep, { email: currentUser.email, password })
          if (resp && (resp.status === 200 || resp.status === 201)) {
            // API authenticated user. Use returned user payload if available.
            const apiUser = resp.data?.user || resp.data
            const resolvedUser = apiUser && apiUser.email ? apiUser : currentUser

            // update localStorage last_login and user record
            const allUsersStr2 = localStorage.getItem("all_users") || "[]"
            const allUsers2 = JSON.parse(allUsersStr2)
            const updatedUsers2 = allUsers2.map((u) =>
              u.id === resolvedUser.id || u.email === resolvedUser.email
                ? { ...u, last_login: new Date().toLocaleString(), password: u.password ?? password }
                : u,
            )
            localStorage.setItem("all_users", JSON.stringify(updatedUsers2))
            localStorage.setItem(
              "user",
              JSON.stringify({
                ...(resolvedUser || currentUser),
                last_login: new Date().toLocaleString(),
              }),
            )

            console.log("[Login] User login via API successful!", ep)
            window.location.href = "/dashboard"
            return
          }
        } catch (apiErr) {
          // ignore and try next endpoint
          console.log(`[Login] API auth failed at ${ep}`, apiErr?.response?.status || apiErr.message)
        }
      }

      // If API auth did not succeed, fall back to local check (existing behavior).
      if (!currentUser.password) {
        console.error("[Login] User has no password stored:", currentUser.email)
        setError("This account has no password set. Please contact support or create a new account.")
        setIsLoading(false)
        return
      }

      console.log(
        "[Login] Login attempt - User email:",
        currentUser?.email,
        "| Input password length:",
        password?.length,
        "| Stored password length:",
        currentUser?.password?.length,
      )

      if (currentUser.password === password) {
        // Try to update last login via API (best-effort)
        try {
          await axios.get("/sanctum/csrf-cookie")
          await axios.put(`/api/users/${currentUser.id}`, {
            last_login: new Date().toISOString(),
          })
        } catch (updateError) {
          console.log("[Login] API update failed for last_login", updateError?.response?.status || updateError.message)
        }

        // Update localStorage
        const allUsersStr3 = localStorage.getItem("all_users") || "[]"
        const allUsers3 = JSON.parse(allUsersStr3)
        const updatedUsers3 = allUsers3.map((u) =>
          u.id === currentUser.id || u.email === currentUser.email
            ? { ...u, last_login: new Date().toLocaleString() }
            : u,
        )
        localStorage.setItem("all_users", JSON.stringify(updatedUsers3))

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            last_login: new Date().toLocaleString(),
          }),
        )

        // best-effort server update of last_login (public endpoint)
        try {
          await axios.post("/api/public/users/set-last-login", { email: currentUser.email })
          console.log("[Login] Server last_login updated via public endpoint")
        } catch (err) {
          console.log("[Login] Public last_login update failed:", err?.response?.status || err.message)
        }

        console.log("[Login] User login successful!")
        window.location.href = "/dashboard"
      } else {
        console.log("[Login] Password mismatch - Input: '", password, "' vs Stored: '", currentUser?.password, "'")
        setError("Invalid password")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("[Login] Login error:", err)
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegisterError("")

    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setRegisterError("Please fill out all fields")
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("Passwords do not match")
      return
    }

    if (registerForm.password.length < 8) {
      setRegisterError("Password must be at least 8 characters")
      return
    }

    try {
      // Check if email already exists in localStorage first
      const allUsersStr = localStorage.getItem("all_users") || "[]"
      const existingUsers = JSON.parse(allUsersStr)
      
      if (existingUsers.some((u) => u.email === registerForm.email)) {
        setRegisterError("Email already registered")
        return
      }

      const newUserData = {
        name: registerForm.name,
        full_name: registerForm.name,
        username: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
        status: "active",
      }

      console.log("[Login] Registering new user:", newUserData)

      let registeredUser = null

      // Try API first
      try {
        const response = await axios.post("/api/users", newUserData)
        registeredUser = response.data?.data || response.data
        console.log("[Login] User registered via API:", registeredUser)
        
        // IMPORTANT: Store password in the registered user for login
        if (registeredUser) {
          registeredUser.password = registerForm.password
        }
      } catch (apiError) {
        console.log("[Login] API registration failed:", apiError?.response?.data || apiError.message)
        console.log("[Login] Falling back to localStorage registration")
        
        // Create user locally if API fails
        registeredUser = {
          id: Date.now(),
          ...newUserData,
          last_login: null,
          created_at: new Date().toISOString(),
        }
      }

      // Always update localStorage to ensure user can login
      const updatedUsers = [...existingUsers, registeredUser]
      localStorage.setItem("all_users", JSON.stringify(updatedUsers))
      console.log("[Login] User saved to localStorage:", registeredUser)

      // Reload users list
      await loadUsers()

      // Reset form
      setRegisterForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
      })
      setRegisterError("")
      setShowRegisterPassword(false)
      setShowRegisterConfirmPassword(false)
      
      // Show success message and redirect to user login
      alert(`✅ Registration successful!\n\nAccount created for: ${registeredUser.name}\nEmail: ${registeredUser.email}\n\nYou can now login with your credentials.`)
      setStep("initial")
    } catch (err) {
      console.error("[Login] Registration error:", err)
      setRegisterError("Registration failed. Please try again.")
    }
  }

  // Delete confirmation modal
  if (showDeleteConfirm) {
    return (
      <div className="login-page">
        <div className="modal-overlay">
          <div className="login-container delete-confirm-modal">
            <h2 style={{ color: "#dc2626", marginBottom: "16px" }}>⚠️ Delete Account</h2>
            <p style={{ marginBottom: "24px" }}>
              Are you sure you want to permanently delete the account for <strong>{userToDelete?.name}</strong>?
            </p>
            <p style={{ marginBottom: "24px", color: "#dc2626", fontSize: "14px" }}>
              This action cannot be undone. All data associated with this account will be permanently removed.
            </p>

            {deleteError && <div className="error-alert">{deleteError}</div>}

            <div className="form-group">
              <label htmlFor="delete-password">Enter Password to Confirm</label>
              <div style={{ position: "relative" }}>
                <input
                  id="delete-password"
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter account password"
                  autoFocus
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "4px 8px",
                  }}
                >
                  {showDeletePassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={confirmDeleteAccount}
                className="submit-btn"
                style={{ backgroundColor: "#dc2626", flex: 1 }}
              >
                Delete Account
              </button>
              <button onClick={cancelDelete} className="back-button" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Initial screen
  if (step === "initial") {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="logo">🎓</div>
          <h2>Welcome to EduPortal</h2>
          <p className="subtitle">Educational Management System</p>

          <div className="initial-actions">
            <button className="action-button admin-button" onClick={() => setStep("adminLogin")} type="button">
              <span className="button-icon">👤</span>
              <span>Admin Login</span>
            </button>

            <button className="action-button user-button" onClick={() => setStep("userLogin")} type="button">
              <span className="button-icon">👥</span>
              <span>User Login</span>
            </button>

            <button className="action-button register-button" onClick={() => setStep("register")} type="button">
              <span className="button-icon">➕</span>
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Admin login screen
  if (step === "adminLogin") {
    return (
      <div className="login-page">
        <div className="login-container">
          <button
            className="back-button"
            onClick={() => {
              setStep("initial")
              setPassword("")
              setError("")
              setShowPassword(false)
            }}
            type="button"
            disabled={isLoading}
          >
            ← Back
          </button>

          <div className="selected-user-info">
            <div className="user-avatar admin-avatar">{adminUser?.name?.charAt(0).toUpperCase() || "A"}</div>
            <div>
              <h3>{adminUser?.name || "Admin"}</h3>
              <p>{adminUser?.email || "admin@example.com"}</p>
              <span className="admin-badge">Administrator</span>
            </div>
          </div>

          <form onSubmit={handleAdminLogin}>
            {error && <div className="error-alert">{error}</div>}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your password"
                  autoFocus
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "4px 8px",
                  }}
                  disabled={isLoading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (step === "userLogin") {
    return (
      <div className="login-page">
        <div className="login-container">
          <button
            className="back-button"
            onClick={() => {
              setStep("initial")
              setSelectedUser(null)
              setPassword("")
              setError("")
              setShowPassword(false)
            }}
            type="button"
            disabled={isLoading}
          >
            ← Back
          </button>

          {!selectedUser ? (
            <>
              <h2>Select Your Account</h2>
              <p className="subtitle">Choose an account to login</p>

              {allUsers.length > 0 ? (
                <div className="users-grid">
                  {allUsers.map((user) => (
                    <div
                      key={user.id}
                      className="user-card"
                      onClick={() => setSelectedUser(user)}
                      style={{ position: "relative" }}
                    >
                      <button
                        onClick={(e) => handleDeleteAccount(user, e)}
                        className="delete-account-btn"
                        title="Delete Account"
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "500",
                          zIndex: 10,
                        }}
                      >
                        🗑️ Delete
                      </button>
                      <div className={`user-avatar ${user.role}-avatar`}>{user.name?.charAt(0).toUpperCase()}</div>
                      <div className="user-details">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="user-role">{user.role}</div>
                      </div>
                      <div className={`user-status status-${user.status}`}>{user.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-users-message">
                  <p>No users found. Create an account to get started.</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="selected-user-info">
                <div className={`user-avatar ${selectedUser.role}-avatar`}>
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                  <span className="user-badge">{selectedUser.role}</span>
                </div>
              </div>

              <form onSubmit={handleUserLogin}>
                {error && <div className="error-alert">{error}</div>}

                <div className="form-group">
                  <label htmlFor="user-password">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="user-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      placeholder="Enter your password"
                      autoFocus
                      required
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "18px",
                        padding: "4px 8px",
                      }}
                      disabled={isLoading}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log in"}
                </button>
              </form>

              <button
                className="back-button"
                onClick={() => {
                  setSelectedUser(null)
                  setPassword("")
                  setError("")
                  setShowPassword(false)
                }}
                type="button"
                disabled={isLoading}
                style={{ marginTop: "16px" }}
              >
                ← Change User
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Registration screen
  if (step === "register") {
    return (
      <div className="login-page">
        <div className="login-container register-container">
          <button
            className="back-button"
            onClick={() => {
              setStep("initial")
              setRegisterForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "student",
              })
              setRegisterError("")
              setShowRegisterPassword(false)
              setShowRegisterConfirmPassword(false)
            }}
            type="button"
          >
            ← Back
          </button>

          <h2>Create New Account</h2>
          <p className="subtitle">Register a new user account</p>

          <form onSubmit={handleRegister}>
            {registerError && <div className="error-alert">{registerError}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Account Type</label>
              <select
                id="role"
                value={registerForm.role}
                onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                required
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showRegisterPassword ? "text" : "password"}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "4px 8px",
                  }}
                >
                  {showRegisterPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirmPassword"
                  type={showRegisterConfirmPassword ? "text" : "password"}
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  required
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "4px 8px",
                  }}
                >
                  {showRegisterConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn register-btn">
              Create Account
            </button>
          </form>
        </div>
      </div>
    )
  }
}