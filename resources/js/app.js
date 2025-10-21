import React from "react";
import ReactDOM from "react-dom/client";

// ✅ Wait until DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const rootElement = document.getElementById("app");
    if (!rootElement) return;

    // Create React root
    const root = ReactDOM.createRoot(rootElement);

    // Current path
    const path = window.location.pathname.toLowerCase();

    // Optional loading screen
    root.render(
        <div
            style={{
                color: "#fff",
                textAlign: "center",
                marginTop: "20vh",
                fontSize: "1.2rem",
                fontFamily: "Segoe UI, sans-serif",
            }}
        >
            Loading EduPortal...
        </div>
    );

    // Normalize path (remove trailing slash)
    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

    // ✅ Route Handling
    switch (normalizedPath) {
        case "":
        case "/":
        case "/login":
            import("./components/Login.js")
                .then((module) => root.render(React.createElement(module.default)))
                .catch((err) => console.error("❌ Failed to load Login:", err));
            break;

        case "/dashboard":
            import("./components/Dashboard.js")
                .then((module) => root.render(React.createElement(module.default)))
                .catch((err) => console.error("❌ Failed to load Dashboard:", err));
            break;

        case "/users":
            import("./components/Users.js")
                .then((module) => root.render(React.createElement(module.default)))
                .catch((err) => console.error("❌ Failed to load Users:", err));
            break;

        case "/students":
            import("./components/Students.js")
                .then((module) => root.render(React.createElement(module.default)))
                .catch((err) => console.error("❌ Failed to load Students:", err));
            break;

        case "/faculty":
            import("./components/Faculty.js")
                .then((module) => root.render(React.createElement(module.default)))
                .catch((err) => console.error("❌ Failed to load Faculty:", err));
            break;

        // ✅ Courses Route
        case "/courses":
            import("./components/Courses.js")
                .then((module) => root.render(React.createElement(module.default)))
                .catch((err) => console.error("❌ Failed to load Courses:", err));
            break;

        // ✅ Departments Route
        case "/departments":
            import("./components/Departments.js")
                .then((module) => root.render(React.createElement(module.default)))
                .catch((err) => console.error("❌ Failed to load Departments:", err));
            break;

        // ✅ Academic Years Route
        case "/academicyears":
            import("./components/AcademicYears.js")
                .then((module) => root.render(React.createElement(module.default)))
                .catch((err) => console.error("❌ Failed to load AcademicYears:", err));
            break;

        // ✅ 404 Fallback
        default:
            root.render(
                <div
                    style={{
                        color: "#fff",
                        textAlign: "center",
                        marginTop: "20vh",
                        fontFamily: "Segoe UI, sans-serif",
                    }}
                >
                    <h1>404 - Page Not Found</h1>
                    <p>
                        The page <strong>{path}</strong> does not exist.
                    </p>
                </div>
            );
            break;
    }

    console.log("✅ EduPortal app.js initialized successfully!");
});
