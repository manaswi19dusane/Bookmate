import { Link } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  return (
    <nav className="nav">
      <h1 className="logo">Bookmate</h1>

      <div className="nav-links">
        <Link to="/">Books</Link>
        <Link to="/add">Add Book</Link>
        <Link to="/wishlist">Wishlist</Link>
      </div>
    </nav>
  );
}
