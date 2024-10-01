// src/components/NavBar/NavBar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Determine current routes
  const isHomePage = location.pathname === '/home';
  const isLoginPage = location.pathname === '/';
  const isDoneOrdersPage = location.pathname === '/done-orders';
  const isProfilePage = location.pathname === '/profile';

  // Toggle dropdown state
  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-header">
          <h1>Thuỷ Hoàng</h1>
        </div>
        <ul className="navbar-links">
          {/* Dropdown Menu */}
          <li className="navbar-dropdown">
            <button className="dropdown-button" onClick={toggleDropdown}>
              Menu
            </button>
            {dropdownOpen && (
              <div className="dropdown-content">
                {/* Show "Trang Chủ" link */}
                <Link to="/home" onClick={() => setDropdownOpen(false)}>Trang Chủ</Link>

                {/* Show "Đơn Hoàn Thành" link */}
                <Link to="/done-orders" onClick={() => setDropdownOpen(false)}>Đơn Hoàn Thành</Link>

                {/* Show "Hồ Sơ" link */}
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>Hồ Sơ</Link>
              </div>
            )}
          </li>

          {/* On the "Đơn Hoàn Thành" page, show "Trang Chủ" link separately */}
          {isDoneOrdersPage && (
            <li>
              <Link to="/home">Trang Chủ</Link>
            </li>
          )}

          {/* On the "Trang Chủ" page, show "Đơn Hoàn Thành" link separately */}
          {isHomePage && (
            <li>
              <Link to="/done-orders">Đơn Hoàn Thành</Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
