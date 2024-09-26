import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const location = useLocation();

  // Determine current routes
  const isHomePage = location.pathname === '/home';
  const isLoginPage = location.pathname === '/';
  const isDoneOrdersPage = location.pathname === '/done-orders';

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-header">
          <h1>Thuỷ Hoàng</h1>
        </div>
        <ul className="navbar-links">
          {/* Show "Trang Chủ" only on the "Đơn Hoàn Thành" page */}
          {isDoneOrdersPage && <li><Link to="/home">Trang Chủ</Link></li>}

          {/* Show "Đơn Hoàn Thành" only on the "Trang Chủ" page */}
          {isHomePage && <li><Link to="/done-orders">Đơn Hoàn Thành</Link></li>}

          {/* On other pages, show both links */}
          {!isHomePage && !isLoginPage && !isDoneOrdersPage && (
            <>
              <li><Link to="/home">Trang Chủ</Link></li>
              <li><Link to="/done-orders">Đơn Hoàn Thành</Link></li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
