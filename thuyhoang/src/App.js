import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import DoneOrders from './pages/DoneOrders/DoneOrders';
import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer';
import ProfilePage from './pages/ProfilePage/ProfilePage'; // Import ProfilePage component

// Component to manage layout with conditional NavBar and Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const noNavBarFooterRoutes = ['/login', '/']; // Routes where NavBar and Footer should not be displayed

  return (
    <>
      {/* Conditionally render NavBar based on the current path */}
      {!noNavBarFooterRoutes.includes(location.pathname) && <NavBar />}
      {children}
      {/* Conditionally render Footer based on the current path */}
      {!noNavBarFooterRoutes.includes(location.pathname) && <Footer />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/done-orders" element={<DoneOrders />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} /> {/* Add ProfilePage Route */}
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
