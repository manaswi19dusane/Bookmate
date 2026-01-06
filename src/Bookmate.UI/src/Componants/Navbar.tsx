import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Navbar.css";
import logo from "../assets/Images/LOGO.png";
export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      {/* LOGO HERE */}
      <div className="logo-box">
        <img src={logo} alt="Bookmate Logo" className="logo-img" />
        <span className="logo-text">Bookmate</span>
      </div>

      {/* Hamburger icon (mobile) */}
      <div className="hamburger" onClick={() => setOpen(!open)}>
        ☰
      </div>

      {/* Links */}
      <div className={`nav-links ${open ? "show" : ""}`}>
        <Link to="/" onClick={() => setOpen(false)}>Books</Link>
        <Link to="/add" onClick={() => setOpen(false)}>Add Book</Link>
        <Link to="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
      </div>
    </nav>
  );
}
