import React, { useState } from "react";
import "../../sass/Login.scss";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        if (!username.trim() || !password) {
            setError("Please enter both username and password");
            return;
        }

        setIsLoading(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const fakeUser = {
                username: username.trim(),
                role: "Guest",
            };

            sessionStorage.setItem("user", JSON.stringify(fakeUser));
            window.location.href = "/dashboard";
        } catch (err) {
            console.error("Login error:", err);
            setError("Something went wrong. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => {
        setShowModal(true);
        setError("");
        setUsername("");
        setPassword("");
    };

    const closeModal = () => {
        setShowModal(false);
        setError("");
    };

    return (
        <div className="login-page">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="logo-section">
                        <div className="logo">🎓</div>
                        <span className="university-name">Father Saturnino Urios University</span>
                    </div>
                    <nav className="nav-links">
                        <a href="#calendar">Calendar</a>
                        <a href="#contact">Contact</a>
                        <a href="#about">About us</a>
                        <a href="#website">FSUU Website</a>
                        <a href="#gsuite">FSUU G-Suite</a>
                        <button className="nav-login-btn" onClick={openModal}>Log in</button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay">
                    <div className="hero-text">
                        <h1>Easy and enjoyable</h1>
                        <p>
                            NEO has a beautiful and intuitive<br />
                            user interface that will make your<br />
                            learning easy and enjoyable.
                        </p>
                    </div>
                </div>
            </section>

            {/* Image Cards */}
            <section className="cards">
                <div className="cards-container">
                    <div className="card">
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop" 
                            alt="Students studying together" 
                        />
                    </div>
                    <div className="card">
                        <img 
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=300&fit=crop" 
                            alt="Group collaboration" 
                        />
                    </div>
                    <div className="card">
                        <img 
                            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop" 
                            alt="Student learning" 
                        />
                    </div>
                </div>
            </section>

            {/* Login Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={closeModal}>×</button>
                        
                        <div className="login-card">
                            <h2>Log in</h2>
                            
                            <form onSubmit={handleLogin}>
                                {error && <div className="error-alert">{error}</div>}

                                <div className="form-group">
                                    <label htmlFor="username">Username</label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        disabled={isLoading}
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <div className="password-input">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isLoading}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex="-1"
                                        >
                                            {showPassword ? "👁️" : "👁️‍🗨️"}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-options">
                                    <label className="remember">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <a href="#forgot" className="forgot">Forgot password?</a>
                                </div>

                                <button type="submit" className="submit-btn" disabled={isLoading}>
                                    {isLoading ? "Logging in..." : "Log in"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Login;