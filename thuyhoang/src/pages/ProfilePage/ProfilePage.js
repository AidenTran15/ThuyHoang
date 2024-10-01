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
    return <div className="profile-page-loading">Loading...</div>; // Display loading while data is being fetched
  }

  return (
    <div className="profile-page-container">
      <div className="profile-page-sidebar">
        <h2 className="profile-page-title">Thông Tin Khách Hàng</h2>
        <ul className="profile-page-list">
          <li className="profile-page-list-item"><span>Tên:</span> {customerInfo.name}</li>
          <li className="profile-page-list-item"><span>Số Điện Thoại:</span> {customerInfo.phone_number}</li>
          <li className="profile-page-list-item"><span>Địa Chỉ:</span> {customerInfo.address}</li>
          <li className="profile-page-list-item"><span>Giá Quần Áo:</span> {customerInfo.short_price} VND</li>
        </ul>
      </div>

      <div className="profile-page-content">
        <div className="profile-page-card">
          <h3 className="profile-page-card-title">Đặt Lại Mật Khẩu</h3>
          <div className="profile-page-password-reset">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="profile-page-input"
            />
            <button onClick={handlePasswordReset} className="profile-page-button">
              Đặt Lại Mật Khẩu
            </button>
          </div>
          {message && <p className="profile-page-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
