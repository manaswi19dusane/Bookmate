import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Navbar.css";
import { FaBell, FaUserCircle, FaSearch } from "react-icons/fa";
import logo from "../assets/Images/LOGO.png";

export default function Navbar() {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="navbar">

      {/* LEFT SECTION */}
      <div className="nav-left">
        <img src={logo} alt="Bookmate Logo" className="logo-img" />
        <span className="brand">Bookmate</span>
      </div>

      {/* CENTER SECTION */}
      <div className="nav-center">
        <div className="nav-search-box">
          <span className="nav-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search your books..."
            className="nav-search-input"
          />
        </div>
      </div>
      {/* RIGHT SECTION */}
      <div className="nav-right">
        <Link to="/wishlist">Wishlist</Link>

        <FaBell className="nav-icon" />

        <div
          className="profile-wrapper"
          onClick={() => setShowProfile(!showProfile)}
        >
          <FaUserCircle className="nav-icon" />

          {showProfile && (
            <div className="profile-dropdown">
              <Link to="/account">My Account</Link>
              <Link to="/settings">Settings</Link>
              <Link to="/login">Logout</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
