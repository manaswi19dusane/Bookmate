import { NavLink } from "react-router-dom";
import "../css/Sidebar.css";
import {
  FaHome,
  FaPlus,
  FaHeart,
  FaRobot,
  FaFilter,
} from "react-icons/fa";

interface SidebarProps {
  onOpenChat: () => void;
}

export default function Sidebar({ onOpenChat }: SidebarProps) {
  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" className="sidebar-link">
            <FaHome />
            <span>Home</span>
          </NavLink>
        </li>

        <li>
          <NavLink to="/add" className="sidebar-link">
            <FaPlus />
            <span>Add Book</span>
          </NavLink>
        </li>

        {/* <li>
          <NavLink to="/filters" className="sidebar-link">
            <FaFilter />
            <span>Filters</span>
          </NavLink>
        </li> */}

        <li>
          <NavLink to="/wishlist" className="sidebar-link">
            <FaHeart />
            <span>Wishlist</span>
          </NavLink>
        </li>

        <li onClick={onOpenChat} className="sidebar-link">
          <FaRobot />
          <span>AI Chat</span>
        </li>
      </ul>
    </aside>
  );
}
