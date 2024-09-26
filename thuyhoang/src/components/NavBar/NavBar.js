import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-header">
          <h1>Thuỷ Hoàng</h1>
        </div>
        <ul className="navbar-links">
          {/* Only show Trang Chủ if we are not on the home page */}
          {location.pathname !== '/home' && (
            <li><Link to="/home">Trang Chủ</Link></li>
          )}
          {/* Only show Đơn Hoàn Thành if we are not on the done-orders page */}
          {location.pathname !== '/done-orders' && (
            <li><Link to="/done-orders">Đơn Hoàn Thành</Link></li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
