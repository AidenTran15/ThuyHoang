// src/components/NavBar/NavBar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();

  // Determine current routes
  const isHomePage = location.pathname === '/home';
  const isLoginPage = location.pathname === '/';
  const isDoneOrdersPage = location.pathname === '/done-orders';
  const isProfilePage = location.pathname === '/profile'; // Check if on profile page

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-header">
          <h1>Thuỷ Hoàng</h1>
        </div>
        <ul className="navbar-links">
          {/* Show "Trang Chủ" only on the "Đơn Hoàn Thành" or "Hồ Sơ" pages */}
          {(isDoneOrdersPage || isProfilePage) && (
            <li><Link to="/home">Trang Chủ</Link></li>
          )}

          {/* Show "Đơn Hoàn Thành" only on the "Trang Chủ" or "Hồ Sơ" pages */}
          {(isHomePage || isProfilePage) && (
            <li><Link to="/done-orders">Đơn Hoàn Thành</Link></li>
          )}

          {/* Show "Hồ Sơ" only on the "Trang Chủ" or "Đơn Hoàn Thành" pages */}
          {(isHomePage || isDoneOrdersPage) && (
            <li><Link to="/profile">Hồ Sơ</Link></li>
          )}

          {/* On other pages (e.g., login page), show all three links */}
          {!isHomePage && !isLoginPage && !isDoneOrdersPage && !isProfilePage && (
            <>
              <li><Link to="/home">Trang Chủ</Link></li>
              <li><Link to="/done-orders">Đơn Hoàn Thành</Link></li>
              <li><Link to="/profile">Hồ Sơ</Link></li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
