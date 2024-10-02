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

  // Pages and their corresponding links
  const pages = [
    { name: 'Trang Chủ', path: '/home' },
    { name: 'Đơn Hoàn Thành', path: '/done-orders' },
    { name: 'Hồ Sơ', path: '/profile' }
  ];

  // Filter out the current page from the dropdown links
  const dropdownLinks = pages.filter(page => page.path !== location.pathname);

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-header">
          <h1>Thuỷ Hoàng</h1>
        </div>
        <ul className="navbar-links">
          {/* Dropdown menu */}
          <li className="navbar-dropdown">
            <button className="dropdown-button" onClick={toggleDropdown}>
              Menu
              <span className={`arrow ${dropdownOpen ? 'arrow-up' : 'arrow-down'}`}></span>
            </button>
            {dropdownOpen && (
              <div className="dropdown-content">
                {/* Render links for pages other than the current page */}
                {dropdownLinks.map((page) => (
                  <Link
                    key={page.path}
                    to={page.path}
                    onClick={() => setDropdownOpen(false)}
                  >
                    {page.name}
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
