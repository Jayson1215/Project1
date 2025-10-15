import Example from "./Example";
import React from "home";
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./Home";

export default function Router() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Example />} />
                <Route path="/Home" element={<Home />} />
            </Routes>
        </Router>
    );
}

if (document.getElementById('router')) {
    ReactDOM.render(<Router />, document.getElementById('router'));
}