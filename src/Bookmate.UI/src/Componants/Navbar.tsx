import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Navbar.css";
import { FaBell, FaUserCircle } from "react-icons/fa"; // bell & profile icons
import logo from "../assets/Images/LOGO.png";

export default function Navbar() {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="nav">
      {/* LEFT: Logo */}
      <div className="nav-logo">
        <img src={logo} alt="Bookmate Logo" className="logo-img" />
        <span className="logo-text">Bookmate</span>
      </div>

      {/* CENTER: Search */}
      <div className="nav-search">
        <input type="text" placeholder="Search your books..." />
      </div>

      {/* RIGHT: Links + Icons */}
      <div className="nav-links">
        <Link to="/wishlist">Wishlist</Link>

        {/* Bell Icon */}
        <FaBell className="icon" />

        {/* Profile Icon */}
        <div className="profile-wrapper" onClick={() => setShowProfile(!showProfile)}>
          <FaUserCircle className="icon" />

          {/* Dropdown after clicking profile */}
          {showProfile && (
            <div className="profile-dropdown">
              <p>My Account</p>
              <p>Settings</p>
              <p>Logout</p>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
