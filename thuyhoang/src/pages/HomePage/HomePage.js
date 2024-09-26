import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './HomePage.css'; // Hãy đảm bảo cập nhật CSS cho layout mới

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    productList: [{ color: 'Đỏ', size: 30, quantity: 1 }],
  });
  const [orders, setOrders] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState(null);

  const loggedInCustomer = useMemo(() => {
    try {
      const storedCustomer = localStorage.getItem('loggedInCustomer');
      if (storedCustomer && storedCustomer !== 'undefined') {
        return JSON.parse(storedCustomer);
      }
    } catch (e) {
      console.error('Lỗi khi phân tích loggedInCustomer từ localStorage:', e);
    }
    return null;
  }, []);

  useEffect(() => {
    if (loggedInCustomer && loggedInCustomer.name) {
      axios
        .get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get', {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          const allOrders = JSON.parse(response.data.body);
          setOrders(allOrders);

          const filteredOrders = allOrders.filter((order) => order.Customer === loggedInCustomer.name);
          setCustomerOrders(filteredOrders);
          setLoadingOrders(false);
        })
        .catch((error) => {
          if (error.response) {
            setOrderError('Lỗi phản hồi từ máy chủ: ' + error.response.status);
          } else if (error.request) {
            setOrderError('Lỗi mạng, không có phản hồi. Vui lòng kiểm tra mạng hoặc API của bạn.');
          } else {
            setOrderError('Lỗi trong việc thiết lập yêu cầu: ' + error.message);
          }
          setLoadingOrders(false);
        });
    }
  }, [loggedInCustomer]);

  const handleOrderSaveClick = () => {
    console.log('Đơn hàng đã lưu:', newOrder);
    setIsModalOpen(false);
  };

  return (
    <div className="home-page">
      <div className="header-section">
        <h1>Chào Mừng Đến Với Bảng Quản Lý Đơn Hàng</h1>
        <button className="create-order-btn" onClick={() => setIsModalOpen(true)}>
          Tạo Đơn Hàng Mới
        </button>
      </div>

      <div className="orders-section">
        <h2>Đơn Hàng Của Bạn</h2>
        {loadingOrders ? (
          <p className="loading-text">Đang tải đơn hàng của bạn...</p>
        ) : orderError ? (
          <p className="error-text">{orderError}</p>
        ) : customerOrders.length === 0 ? (
          <p className="no-orders-text">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="orders-grid">
            {customerOrders.map((order, index) => (
              <div key={index} className="order-card">
                <h3 className="order-id">Đơn Hàng #{order.orderID}</h3>
                <div className="order-details">
                  <p><strong>Ngày Đặt Hàng:</strong> {order.OrderDate}</p>
                  <p><strong>Tổng Số Lượng:</strong> {order.TotalQuantity}</p>
                  <p><strong>Tổng Giá Trị:</strong> {order.Total}</p>
                  <p><strong>Trạng Thái:</strong> {order.Status}</p>
                </div>
                <div className="product-list">
                  <h4>Sản Phẩm:</h4>
                  <ul>
                    {order.ProductList.map((product, i) => (
                      <li key={i}>
                        {product.color} {product.size} - {product.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
