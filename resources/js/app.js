import React from "react";
import ReactDOM from "react-dom/client";

document.addEventListener("DOMContentLoaded", () => {
    const rootElement = document.getElementById("app");
    if (!rootElement) return;

    const root = ReactDOM.createRoot(rootElement);
    const path = window.location.pathname.toLowerCase();

    // Optional: loading placeholder
    root.render(
        <div
            style={{
                color: "#fff",
                textAlign: "center",
                marginTop: "20vh",
                fontSize: "1.2rem",
                fontFamily: "Segoe UI, sans-serif"
            }}
        >
            Loading EduPortal...
        </div>
    );

    // Normalize trailing slash
    const normalizedPath = path.endsWith("/") ? path.slice(0, -1) : path;

    // Route handling
    if (normalizedPath === "" || normalizedPath === "/" || normalizedPath === "/login") {
        import("./components/Login.js")
            .then((module) => root.render(React.createElement(module.default)))
            .catch((err) => console.error("❌ Failed to load Login:", err));

    } else if (normalizedPath === "/dashboard") {
        import("./components/Dashboard.js")
            .then((module) => root.render(React.createElement(module.default)))
            .catch((err) => console.error("❌ Failed to load Dashboard:", err));

    } else if (normalizedPath === "/users") {
        import("./components/Users.js")
            .then((module) => root.render(React.createElement(module.default)))
            .catch((err) => console.error("❌ Failed to load Users:", err));

    } else if (normalizedPath === "/students") {
        import("./components/Students.js")
            .then((module) => root.render(React.createElement(module.default)))
            .catch((err) => console.error("❌ Failed to load Students:", err));

    } else {
        // Fallback for unknown routes
        root.render(
            <div
                style={{
                    color: "#fff",
                    textAlign: "center",
                    marginTop: "20vh",
                    fontFamily: "Segoe UI, sans-serif"
                }}
            >
                <h1>404 - Page Not Found</h1>
                <p>The page <strong>{path}</strong> does not exist.</p>
            </div>
        );
    }

    console.log("✅ EduPortal app.js initialized successfully!");
});
