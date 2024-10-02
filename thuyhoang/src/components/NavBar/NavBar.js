import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Toggle dropdown state
  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  // Check screen size and update isMobile state
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        {/* Render the links differently based on the screen size */}
        <ul className="navbar-links">
          {isMobile ? (
            <li className="navbar-dropdown">
              <button className="dropdown-button" onClick={toggleDropdown}>
                Thực Đơn
                <span className={`arrow ${dropdownOpen ? 'arrow-up' : 'arrow-down'}`}></span>
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
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
          ) : (
            dropdownLinks.map((page) => (
              <li key={page.path}>
                <Link to={page.path} className="navbar-link">
                  {page.name}
                </Link>
              </li>
            ))
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
