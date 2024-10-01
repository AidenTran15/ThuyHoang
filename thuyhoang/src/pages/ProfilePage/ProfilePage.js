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
    return <div>Loading...</div>; // Display loading while data is being fetched
  }

  return (
    <div className="profile-container">
      <h2>Thông Tin Khách Hàng</h2>
      <div className="profile-info">
        <p><strong>Tên:</strong> {customerInfo.name}</p>
        <p><strong>Số Điện Thoại:</strong> {customerInfo.phone_number}</p>
        <p><strong>Địa Chỉ:</strong> {customerInfo.address}</p>
        <p><strong>Giá Quần Áo:</strong> {customerInfo.short_price} VND</p>
      </div>
      <div className="password-reset">
        <h3>Đặt Lại Mật Khẩu</h3>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Nhập mật khẩu mới"
        />
        <button onClick={handlePasswordReset}>Đặt Lại Mật Khẩu</button>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;
