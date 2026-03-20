import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Navbar.css";
import { FaBell, FaUserCircle } from "react-icons/fa";
import logo from "../assets/Images/LOGO.png";

/*
  👉 Props coming from Layout.tsx
  searchQuery = current search text
  setSearchQuery = function to update search text
*/
type NavbarProps = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
};

export default function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {

  // Profile dropdown toggle state
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="navbar">

      {/* LEFT SECTION */}
      <div className="nav-left">
        <img src={logo} alt="Bookmate Logo" className="logo-img" />
        <span className="brand">Bookmate</span>
      </div>

      {/* CENTER SECTION (SEARCH BAR) */}
      <div className="nav-center">
        <div className="nav-search-box">
          <span className="nav-search-icon">🔍</span>

          {/* 
            👉 Controlled Input
            value = searchQuery from Layout
            onChange = update Layout state
          */}
          <input
            type="text"
            placeholder="Search your books..."
            className="nav-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Dropdown */}
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
