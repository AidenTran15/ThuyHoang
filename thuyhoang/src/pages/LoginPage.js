import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
          body: JSON.stringify({ name, password })  // Correct body format
        }),
      });

      // Parse the result to get the customer data
      const result = await response.json();
      console.log('Login API response:', result);

      if (response.ok) {
        // Parse the body because it's a stringified JSON
        const parsedBody = JSON.parse(result.body);

        if (parsedBody.customer) {
          console.log('Login successful, storing customer info:', parsedBody.customer);
          localStorage.setItem('loggedInCustomer', JSON.stringify(parsedBody.customer));

          // Redirect to home page
          navigate('/home');
        } else {
          console.error('Login failed: No customer data returned.');
          setError('Login failed: No customer data found.');
        }
      } else {
        console.error('Login error:', result.error);
        setError(result.error);
        localStorage.removeItem('loggedInCustomer'); // Ensure no invalid data is stored
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An error occurred during login.');
      localStorage.removeItem('loggedInCustomer'); // Ensure no invalid data is stored
    }
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LoginPage;
