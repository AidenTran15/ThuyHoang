import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-header">
          <h1>Thuỷ Hoàng</h1>
        </div>
        <ul className="navbar-links">
          <li><Link to="/home">Trang Chủ</Link></li>
          {/* <li><Link to="/login">Login</Link></li> */}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;
