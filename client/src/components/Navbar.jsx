import React, { useState, useEffect } from "react";
import { FaRobot, FaMoon, FaSun } from "react-icons/fa";
function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  useEffect(() => {
    document.body.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);
  return (
    <nav className="navbar">
      <div className="logo">
        <FaRobot />
        <span>Resurrection AI</span>
      </div>
      <div className="nav-links">
        <a href="#">Features</a>
        <a href="#">About</a>
        <a href="#">Pricing</a>
      </div>
      <div className="nav-actions">
        <button
          className="theme-btn"
          onClick={() =>
            setDarkMode(!darkMode)
          }>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        <button className="upload-btn">
          Upload Project
        </button>
      </div>
    </nav>
  );
}

export default Navbar;