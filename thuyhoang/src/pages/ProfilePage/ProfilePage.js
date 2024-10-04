import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const [customerInfo, setCustomerInfo] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedCustomer = localStorage.getItem('loggedInCustomer');
    if (storedCustomer) {
      const parsedCustomer = JSON.parse(storedCustomer);
      console.log('Current customer from localStorage:', parsedCustomer);

      if (!parsedCustomer.phone_number) {
        console.error('Phone number missing in customer info from localStorage:', parsedCustomer);
        fetchCustomerInfoFromAPI(parsedCustomer.name);
      } else {
        setCustomerInfo(parsedCustomer);
        setMessage('');
      }
    } else {
      fetchCustomerInfoFromAPI();
    }
  }, []);

  const fetchCustomerInfoFromAPI = (customerName) => {
    axios
      .get('https://twnbtj6wuc.execute-api.ap-southeast-2.amazonaws.com/prod/customers')
      .then((response) => {
        console.log('Customer data from API:', response.data);
        const parsedData = JSON.parse(response.data.body);
        console.log('Parsed customer data:', parsedData);

        const foundCustomer = customerName
          ? parsedData.find((customer) => customer.name === customerName)
          : parsedData[0];

        if (foundCustomer) {
          setCustomerInfo(foundCustomer);
          localStorage.setItem('loggedInCustomer', JSON.stringify(foundCustomer));
          setMessage('');
        } else {
          setMessage('Không tìm thấy khách hàng trong API.');
        }
      })
      .catch((error) => {
        console.error('Error fetching customer information:', error);
        setMessage('Không thể tải thông tin khách hàng từ API.');
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInCustomer');
    navigate('/login');
  };

  const handlePasswordReset = () => {
    if (!customerInfo) {
      setMessage('Thông tin khách hàng chưa được tải.');
      return;
    }

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
      .put('https://3dm9uksgnf.execute-api.ap-southeast-2.amazonaws.com/prod/update', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
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
      <div className="profile-modern-content">
        <div className="profile-modern-card">
          <h2 className="profile-modern-card-title">Chi Tiết Hồ Sơ</h2>
          <div className="profile-modern-info-grid">
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Tên:</span> {customerInfo.name}
            </div>
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Số Điện Thoại:</span> {customerInfo.phone_number || 'Không có số điện thoại'}
            </div>
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Địa Chỉ:</span> {customerInfo.address}
            </div>
            <div className="profile-modern-info-item">
              <span className="profile-modern-info-label">Giá Quần Áo:</span> {customerInfo.short_price} VND
            </div>
          </div>
          {/* Move the logout button to the bottom of Chi Tiết Hồ Sơ section */}
          <div className="profile-modern-logout-section">
            <button className="profile-modern-logout-button" onClick={handleLogout}>
              Đăng Xuất
            </button>
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
