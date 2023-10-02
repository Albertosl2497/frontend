import { useState } from "react";
import { Link } from "react-router-dom";
import "./Sidebar.css";
import { FaChevronRight } from "react-icons/fa";
import Logo from "../Assets/logo.png";

function Sidebar({
  handleSidebarToggle,
  isSidebarOpen,
  handleLogout,
  setSelectedTickets,
}) {
  return (
    <>
      <nav className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <button className="sidebar-open-btn" onClick={handleSidebarToggle}>
          <FaChevronRight className={`icon ${isSidebarOpen ? "" : "close"}`} />
        </button>

        <div className="sidebar-header">
          {/* Logo Heading */}
          <div className="row">
            <img src={Logo} alt="Logo" />
            <div className="col">
              <h1>SORTEOS </h1>
              <h1>SONORENSE</h1>
            </div>
          </div>
        </div>

        {/*  Links */}
        <ul className="nav flex-column">
          <li className="nav-item" onClick={() => setSelectedTickets(1)}>
            <div to="/dashboard" className="nav-link">
              <span>Tickets Operations</span>
            </div>
          </li>
          <li className="nav-item" onClick={() => setSelectedTickets(2)}>
            <div to="/users" className="nav-link">
              <span>Users Management</span>
            </div>
          </li>
        </ul>

        {/* Logout */}
        <button className="sidebar-logout" onClick={() => handleLogout()}>
          Logout
        </button>
      </nav>
    </>
  );
}

export default Sidebar;
