// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import DoneOrders from './pages/DoneOrders/DoneOrders';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import ProfilePage from './pages/ProfilePage/ProfilePage'; // Import ProfilePage component

const App = () => {
  return (
    <Router>
      <NavBar /> {/* NavBar will appear at the top of every page */}
      <Routes>
        <Route path="/done-orders" element={<DoneOrders />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* Add ProfilePage Route */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
      <Footer /> {/* Footer will appear at the bottom of every page */}
    </Router>
  );
};

export default App;
