import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav">
      <h1 className="logo">Bookmate</h1>

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
