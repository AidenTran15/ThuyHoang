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
      setMessage('Thông tin khách hàng chưa được tải.');
      return;
    }

    // Prepare the payload with the "body" field as a string
    const payload = {
      body: JSON.stringify({
        phone_number: customerInfo.phone_number,
        name: customerInfo.name,
        address: customerInfo.address,
        short_price: customerInfo.short_price,
        password: newPassword,
      }),
    };

    axios
      .put(
        'https://3dm9uksgnf.execute-api.ap-southeast-2.amazonaws.com/prod/update',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        console.log('Update response:', response.data);
        setMessage('Mật khẩu đã được cập nhật thành công.');
        setNewPassword('');
      })
      .catch((error) => {
        setMessage('Cập nhật mật khẩu thất bại.');
        console.error('Error updating password:', error);
      });
  };

  if (!customerInfo) {
    return <div className="profile-modern-loading">Đang tải...</div>;
  }

  return (
    <div className="profile-modern-container">
      {/* Removed the header section */}
      <div className="profile-modern-content">
        <div className="profile-modern-card">
          <h2 className="profile-modern-card-title">Chi Tiết Hồ Sơ</h2>
          <div className="profile-modern-info-grid">
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Tên:</span> {customerInfo.name}
            </div>
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Số Điện Thoại:</span> {customerInfo.phone_number}
            </div>
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Địa Chỉ:</span> {customerInfo.address}
            </div>
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Giá Quần Áo:</span> {customerInfo.short_price} VND
            </div>
          </div>
        </div>

        <div className="profile-modern-card">
          <h2 className="profile-modern-card-title">Đặt Lại Mật Khẩu</h2>
          <div className="profile-modern-password-reset">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="profile-modern-input"
            />
            <button onClick={handlePasswordReset} className="profile-modern-button">
              Cập Nhật Mật Khẩu
            </button>
          </div>
          {message && <p className="profile-modern-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
