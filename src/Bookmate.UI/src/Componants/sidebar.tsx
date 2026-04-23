import { NavLink } from "react-router-dom";
import "../css/Sidebar.css";
import {
  FaHome, FaPlus, FaHeart, FaRobot, FaBookOpen,
  FaStore, FaSlidersH, FaRegCompass, FaExchangeAlt, FaStar,
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
            <FaHome /><span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/add" className="sidebar-link">
            <FaPlus /><span>Add Book</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/wishlist" className="sidebar-link">
            <FaHeart /><span>Wishlist</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/lending" className="sidebar-link">
            <FaExchangeAlt /><span>Lending</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/recommendations" className="sidebar-link">
            <FaStar /><span>Recommendations</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/preferences" className="sidebar-link">
            <FaSlidersH /><span>Preferences</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/interactions" className="sidebar-link">
            <FaBookOpen /><span>Activity</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/marketplace" className="sidebar-link">
            <FaStore /><span>Marketplace</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/guide" className="sidebar-link">
            <FaRegCompass /><span>User Guide</span>
          </NavLink>
        </li>
        <li onClick={onOpenChat} className="sidebar-link">
          <FaRobot /><span>AI Chat</span>
        </li>
      </ul>
    </aside>
  );
}
