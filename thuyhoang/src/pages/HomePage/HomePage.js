import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './HomePage.css';
import CreateOrderModal from '../../components/CreateOrderModal/CreateOrderModal';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    productList: [{ color: 'Đỏ', size: 30, quantity: 1 }],
  });
  const [orders, setOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
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


  const formatCurrencyVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  

  // Function to scroll to top of the page
  const scrollToTop = () => {
    document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to load orders
  const loadOrders = () => {
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

          // Filter for pending orders only
          const filteredPendingOrders = allOrders.filter(
            (order) => order.Customer === loggedInCustomer.name && order.Status === 'Pending'
          );
          setPendingOrders(filteredPendingOrders);
          setLoadingOrders(false);
          scrollToTop(); // Scroll to the top after loading orders
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
  };

  // Load orders when the component is mounted
  useEffect(() => {
    loadOrders();
  }, [loggedInCustomer]);

  return (
    <div id="main-content" className="main-content">
      <div className="home-page">
        <div className="orders-section">
          <div className="orders-header">
            <h2>Đơn Hàng Của Bạn</h2>
            <button
              className="create-order-btn"
              onClick={() => {
                setIsModalOpen(true);
                scrollToTop(); // Scroll to the top when opening the modal
              }}
            >
              Tạo Đơn Hàng Mới
            </button>
          </div>
          {loadingOrders ? (
            <p className="loading-text">Đang tải đơn hàng của bạn...</p>
          ) : orderError ? (
            <p className="error-text">{orderError}</p>
          ) : pendingOrders.length === 0 ? (
            <p className="no-orders-text">Bạn chưa có đơn hàng nào đang chờ xử lý.</p>
          ) : (
            <div className="orders-grid">
              {pendingOrders.map((order, index) => (
                <div key={index} className="order-card">
                  <h3 className="order-id">Đơn Hàng #{order.orderID}</h3>
                  <div className="order-details">
  <p><strong className="order-info">Ngày Đặt Hàng:</strong> <div className="normal-text">{order.OrderDate}</div></p>
  <p><strong className="order-info">Tổng Số Lượng:</strong> <div className="normal-text">{order.TotalQuantity}</div></p>
  <p><strong className="order-info">Tổng Giá Trị:</strong> <div className="normal-text">{formatCurrencyVND(order.Total)}</div></p>
  <p><strong className="order-info">Trạng Thái:</strong> <div className="normal-text">{order.Status}</div></p>
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

        {isModalOpen && (
          <CreateOrderModal
            newOrder={newOrder}
            setNewOrder={setNewOrder}
            setOrders={setOrders}
            orders={orders}
            handleClose={() => {
              setIsModalOpen(false);
              loadOrders();  // Refresh orders after closing the modal
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
