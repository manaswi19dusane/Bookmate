import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import logo from "../assets/Images/LOGO.png";
import { useAuth } from "../context/AuthContext";

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
  const { isAuthenticated, logout, user, isAdmin } = useAuth();
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthenticated(isAuthenticated);
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
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
        <span className="nav-user">{user?.email ?? "Guest"}</span>
        <Link to="/library">Library</Link>
        <Link to="/institution">Institution</Link>
        <Link to="/club">Club</Link>
        <Link to="/community">Community</Link>
        <Link to="/marketplace">Marketplace</Link>
        <Link to="/recommendations">Recommendations</Link>
        <Link to="/preferences">Preferences</Link>
        <Link to="/guide">Guide</Link>
        {isAdmin ? <Link to="/admin">Admin</Link> : null}
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
