import React, { useState } from "react";
import axios from "axios";
import "../../sass/Login.scss";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!username.trim() || !password) {
            setError("Please enter both username and password");
            return;
        }

        setIsLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

            const response = await axios.post("/api/login", 
                { username: username.trim(), password },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken || "",
                        "Accept": "application/json",
                    }
                }
            );

            if (response.data.success) {
                sessionStorage.setItem("user", JSON.stringify(response.data.user));
                window.location.href = response.data.redirect || "/dashboard";
            } else {
                setError(response.data.message || "Something went wrong. Try again.");
                setIsLoading(false);
            }
        } catch (err) {
            console.error("Login error:", err);
            setError(
                err.response?.data?.message || "Something went wrong. Try again."
            );
            setIsLoading(false);
        }
    };

    const fillCredentials = (user, pass) => {
        setUsername(user);
        setPassword(pass);
        setError("");
    };

    return (
        <>
            <div className="pattern-bg"></div>

            <div className="login-wrapper">
                {/* Branding Side */}
                <div className="login-branding">
                    <h1>EduPortal</h1>
                    <p>Modern Academic Management System for Educational Institutions.</p>

                    <div className="feature">
                        <div className="feature-icon">📊</div>
                        <div>
                            <h3>Comprehensive Dashboard</h3>
                            <p>Real-time analytics and insights at your fingertips.</p>
                        </div>
                    </div>

                    <div className="feature">
                        <div className="feature-icon">👥</div>
                        <div>
                            <h3>User Management</h3>
                            <p>Manage students, faculty, and staff efficiently.</p>
                        </div>
                    </div>

                    <div className="feature">
                        <div className="feature-icon">🔒</div>
                        <div>
                            <h3>Secure & Reliable</h3>
                            <p>Enterprise-grade security for your data.</p>
                        </div>
                    </div>
                </div>

                {/* Login Card */}
                <div className="login-card">
                    <div className="login-card-header">
                        <div className="login-icon">🎓</div>
                        <h2>Welcome Back</h2>
                        <p>Sign in to access your dashboard</p>
                    </div>

                    <form className="login-form" onSubmit={handleLogin}>
                        {error && <div className="error">{error}</div>}

                        <div className="input-group">
                            <label htmlFor="username">Email or Username *</label>
                            <div className="input-wrapper">
                                <span className="input-icon">✉️</span>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder=""
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password *</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder=""
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? "👁️" : "👁️‍🗨️"}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="sign-in-btn" disabled={isLoading}>
                            {isLoading ? "SIGNING IN..." : "SIGN IN"}
                        </button>

                        <div className="divider">
                            <span>Or continue with</span>
                        </div>

                        <div className="social-buttons">
                            <button type="button" className="social-btn google-btn" disabled>
                                <span className="social-icon">G</span>
                                GOOGLE
                            </button>
                            <button type="button" className="social-btn microsoft-btn" disabled>
                                <span className="social-icon">⊞</span>
                                MICROSOFT
                            </button>
                        </div>

                        <div className="demo-credentials">
                            <div className="demo-header">Demo Credentials:</div>
                            <div className="credential-item" onClick={() => fillCredentials("admin", "password")}>
                                <span className="credential-icon">👤</span>
                                <span className="credential-text">Admin: admin / password</span>
                            </div>
                            <div className="credential-item" onClick={() => fillCredentials("faculty1", "password")}>
                                <span className="credential-icon">👨‍🏫</span>
                                <span className="credential-text">Faculty: faculty1 / password</span>
                            </div>
                            <div className="credential-item" onClick={() => fillCredentials("student1", "password")}>
                                <span className="credential-icon">👨‍🎓</span>
                                <span className="credential-text">Student: student1 / password</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;