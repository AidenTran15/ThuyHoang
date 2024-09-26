import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CreateOrderModal from '../../components/CreateOrderModal/CreateOrderModal';
import './HomePage.css'; // Đảm bảo liên kết với tệp CSS này

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    productList: [{ color: 'Đỏ', size: 30, quantity: 1 }],
  });
  const [orders, setOrders] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState(null);

  // Lấy thông tin khách hàng đã đăng nhập từ localStorage
  const loggedInCustomer = useMemo(() => {
    try {
      const storedCustomer = localStorage.getItem('loggedInCustomer');
      if (storedCustomer && storedCustomer !== 'undefined') {
        return JSON.parse(storedCustomer);
      }
    } catch (e) {
      console.error('Lỗi phân tích khách hàng đăng nhập từ localStorage:', e);
    }
    return null;
  }, []);

  // Lấy tất cả đơn hàng và lọc các đơn hàng thuộc về khách hàng đã đăng nhập
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
            setOrderError('Lỗi mạng, không nhận được phản hồi. Kiểm tra kết nối mạng hoặc API của bạn.');
          } else {
            setOrderError('Lỗi trong quá trình thiết lập yêu cầu: ' + error.message);
          }
          setLoadingOrders(false);
        });
    }
  }, [loggedInCustomer]);

  const handleOrderSaveClick = () => {
    // Logic lưu đơn hàng
    console.log('Đơn hàng đã lưu:', newOrder);
    setIsModalOpen(false);
  };

  return (
    <div className="home-page">
      <div className="header-section">
        {/* <h1>Chào mừng đến Vải Thuỷ Hoàng</h1> */}
        <button className="create-order-btn" onClick={() => setIsModalOpen(true)}>
          Tạo Đơn Hàng
        </button>
      </div>

      {isModalOpen && (
        <CreateOrderModal
          newOrder={newOrder}
          setNewOrder={setNewOrder}
          handleCreateOrderSaveClick={handleOrderSaveClick}
          handleClose={() => setIsModalOpen(false)}
        />
      )}

      <div className="orders-section">
        <h2>Đơn Hàng Của Bạn</h2>
        {loadingOrders ? (
          <p className="loading-text">Đang tải đơn hàng của bạn...</p>
        ) : orderError ? (
          <p className="error-text">{orderError}</p>
        ) : customerOrders.length === 0 ? (
          <p className="no-orders-text">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã Đơn Hàng</th>
                <th>Danh Sách Sản Phẩm</th>
                <th>Tổng Số Lượng</th>
                <th>Tổng Số Tiền</th>
                <th>Trạng Thái</th>
                <th>Ngày Đặt Hàng</th>
              </tr>
            </thead>
            <tbody>
              {customerOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order.orderID}</td>
                  <td>
                    <ul>
                      {order.ProductList.map((product, i) => (
                        <li key={i}>
                          {product.color} {product.size} - {product.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td>{order.TotalQuantity}</td>
                  <td>{order.Total}</td>
                  <td>{order.Status}</td>
                  <td>{order.OrderDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Home;
