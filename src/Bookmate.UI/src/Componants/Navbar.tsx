import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

export default function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthenticated(Boolean(localStorage.getItem("token")));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthenticated(false);
    navigate("/login");
  };

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
        <Link to="/preferences">Preferences</Link>
        <Link to="/interactions">Interactions</Link>
        {authenticated ? (
          <button className="nav-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}