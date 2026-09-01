import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">

      {/* ================= LOGO ================= */}
      <Link
        to="/dashboard"
        className="navbar-logo"
        onClick={closeMenu}
      >
        🗳️ <span>Vote<span className="logo-green">Hub</span></span>
      </Link>

      {/* ================= DESKTOP MENU ================= */}
      <div className="navbar-links">

        <Link
          to="/dashboard"
          className={isActive("/dashboard") ? "nav-link active" : "nav-link"}
        >
          🏠 Home
        </Link>

        <Link
          to="/results"
          className={isActive("/results") ? "nav-link active" : "nav-link"}
        >
          📊 Results
        </Link>

        <Link
          to="/candidate"
          className={isActive("/candidate") ? "nav-link active" : "nav-link"}
        >
          📝 Candidate
        </Link>

        <button
          className="logout-btn"
          onClick={logout}
        >
          🚪 Logout
        </button>

      </div>

      {/* ================= MOBILE BUTTON ================= */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && (
        <div className="mobile-menu">

          <Link
            to="/dashboard"
            className={isActive("/dashboard") ? "mobile-link active" : "mobile-link"}
            onClick={closeMenu}
          >
            🏠 Home
          </Link>

          <Link
            to="/results"
            className={isActive("/results") ? "mobile-link active" : "mobile-link"}
            onClick={closeMenu}
          >
            📊 Results
          </Link>

          <Link
            to="/candidate"
            className={isActive("/candidate") ? "mobile-link active" : "mobile-link"}
            onClick={closeMenu}
          >
            📝 Candidate Profile
          </Link>

          <button
            className="mobile-logout"
            onClick={logout}
          >
            🚪 Logout
          </button>

        </div>
      )}

    </nav>
  );
}

export default Navbar;