import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // New CSS styles

const LoginPage = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('https://v6fw8s7cvd.execute-api.ap-southeast-2.amazonaws.com/prod/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: JSON.stringify({ name, password }),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const parsedBody = JSON.parse(result.body);
        if (parsedBody.customer) {
          localStorage.setItem('loggedInCustomer', JSON.stringify(parsedBody.customer));
          navigate('/home');
        } else {
          setError('Login failed: No customer data found.');
        }
      } else {
        setError(result.error);
        localStorage.removeItem('loggedInCustomer');
      }
    } catch (error) {
      setError('An error occurred during login.');
      localStorage.removeItem('loggedInCustomer');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Đăng Nhập</h2>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="name">Tài Khoản:</label>
            <input
              type="text"
              id="name"
              className="login-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật Khẩu:</label>
            <input
              type="password"
              id="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Đăng Nhập</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
