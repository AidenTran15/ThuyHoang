import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          <li className="navbar-dropdown">
            <button className="dropdown-button" onClick={toggleDropdown}>
              Menu
              {/* Down arrow */}
              <span className={`arrow ${dropdownOpen ? 'arrow-up' : 'arrow-down'}`}></span>
            </button>
            {dropdownOpen && (
              <div className="dropdown-content">
                {/* Dropdown links */}
                <Link to="/home" onClick={() => setDropdownOpen(false)}>Trang Chủ</Link>
                <Link to="/done-orders" onClick={() => setDropdownOpen(false)}>Đơn Hoàn Thành</Link>
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>Hồ Sơ</Link>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
