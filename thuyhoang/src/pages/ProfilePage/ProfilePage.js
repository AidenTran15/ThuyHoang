// src/pages/ProfilePage/ProfilePage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ProfilePage.css';

const ProfilePage = () => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  // Fetch customer information when the component mounts
  useEffect(() => {
    axios
      .get('https://twnbtj6wuc.execute-api.ap-southeast-2.amazonaws.com/prod/customers')
      .then((response) => {
        console.log('Customer data:', response.data);
        
        // Parse the JSON string from response.data.body
        const parsedData = JSON.parse(response.data.body);
        console.log('Parsed customer data:', parsedData);

        // Assuming you want to display the first customer in the list
        setCustomerInfo(parsedData[0]);
      })
      .catch((error) => {
        console.error('Error fetching customer information:', error);
      });
  }, []);

  // Handle password reset
  const handlePasswordReset = () => {
    if (!customerInfo) {
      setMessage('Customer information is not loaded yet.');
      return;
    }

    // Prepare the payload with the "body" field as a string
    const payload = {
      body: JSON.stringify({
        phone_number: customerInfo.phone_number, // Include the phone number
        name: customerInfo.name,
        address: customerInfo.address,
        short_price: customerInfo.short_price,
        password: newPassword, // Update the password
      }),
    };

    axios
      .put(
        'https://3dm9uksgnf.execute-api.ap-southeast-2.amazonaws.com/prod/update',
        payload, // Send payload with body as a stringified JSON
        {
          headers: {
            'Content-Type': 'application/json', // Set the Content-Type header
          },
        }
      )
      .then((response) => {
        console.log('Update response:', response.data);
        setMessage('Password updated successfully.');
        setNewPassword('');
      })
      .catch((error) => {
        setMessage('Failed to update password.');
        console.error('Error updating password:', error);
      });
  };

  if (!customerInfo) {
    return <div className="profile-modern-loading">Loading...</div>; // Display loading while data is being fetched
  }

  return (
    <div className="profile-modern-container">
      <div className="profile-modern-header">
        <h1 className="profile-modern-title">Customer Information</h1>
  
      </div>

      <div className="profile-modern-content">
        <div className="profile-modern-card">
          <h2 className="profile-modern-card-title">Profile Details</h2>
          <div className="profile-modern-info-grid">
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Name:</span> {customerInfo.name}
            </div>
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Phone Number:</span> {customerInfo.phone_number}
            </div>
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Address:</span> {customerInfo.address}
            </div>
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Pants Price:</span> {customerInfo.short_price} VND
            </div>
          </div>
        </div>

        <div className="profile-modern-card">
          <h2 className="profile-modern-card-title">Reset Password</h2>
          <div className="profile-modern-password-reset">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="profile-modern-input"
            />
            <button onClick={handlePasswordReset} className="profile-modern-button">
              Update Password
            </button>
          </div>
          {message && <p className="profile-modern-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
