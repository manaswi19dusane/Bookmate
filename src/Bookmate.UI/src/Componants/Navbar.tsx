import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../css/Navbar.css";
import logo from "../assets/Images/LOGO.png";
import { useAuth } from "../context/AuthContext";

type NavbarProps = {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
};

const navLinks = [
  { to: "/library", label: "Library" },
  { to: "/institution", label: "Institution" },
  { to: "/club", label: "Club" },
  { to: "/community", label: "Community" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/recommendations", label: "Recommendations" },
  { to: "/preferences", label: "Preferences" },
  { to: "/guide", label: "Guide" },
];

export default function Navbar({ searchQuery, setSearchQuery }: NavbarProps) {
  const { isAuthenticated, logout, user } = useAuth();
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setAuthenticated(isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src={logo} alt="Bookmate Logo" className="logo-img" />
        <span className="brand">Bookmate</span>
      </div>

      <div className="nav-center">
        <div className="nav-search-box">
          <span className="nav-search-icon">Search</span>
          <input
            type="text"
            placeholder="Search your books..."
            className="nav-search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="nav-right">
        <span className="nav-user">{user?.email ?? "Guest"}</span>
        <div className="nav-links-desktop">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
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
        <button
          type="button"
          className="nav-button mobile-menu-button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          Menu
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="nav-mobile-panel">
          <div className="nav-search-box nav-search-box-mobile">
            <span className="nav-search-icon">Search</span>
            <input
              type="text"
              placeholder="Search your books..."
              className="nav-search-input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="nav-mobile-links">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
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
        </div>
      ) : null}
    </nav>
  );
}
