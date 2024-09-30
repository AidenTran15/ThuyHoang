import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './DoneOrders.css'; // You can create a CSS file specific to this page

const DoneOrders = () => {
  const [doneOrders, setDoneOrders] = useState([]); // State for Done orders
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

          // Filter for done orders only
          const filteredDoneOrders = allOrders.filter(
            (order) => order.Customer === loggedInCustomer.name && order.Status === 'Done'
          );
          setDoneOrders(filteredDoneOrders);
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

  const formatCurrencyVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="done-orders-page-od">
      <div className="orders-container-od">
        <h2>Đơn Hàng Đã Hoàn Thành</h2>
        {loadingOrders ? (
          <p className="loading-text">Đang tải đơn hàng đã hoàn thành...</p>
        ) : orderError ? (
          <p className="error-text">{orderError}</p>
        ) : doneOrders.length === 0 ? (
          <p className="no-orders-text">Bạn chưa có đơn hàng đã hoàn thành.</p>
        ) : (
          <div className="orders-grid">
            {doneOrders.map((order, index) => (
              <div key={index} className="order-card">
                <h3 className="order-id">Đơn Hàng #{order.orderID}</h3>
<div className="order-details">
  <p><strong className="order-info">Ngày Đặt Hàng:</strong> <div className="normal-text">{order.OrderDate}</div></p>
  <p><strong className="order-info">Tổng Số Lượng:</strong> <div className="normal-text">{order.TotalQuantity}</div></p>
  <p><strong className="order-info">Tổng Giá Trị:</strong> <div className="normal-text">{formatCurrencyVND(order.Total)}</div></p>
  <p><strong className="order-info">Trạng Thái:</strong> {order.Status === 'Done' ? 'Hoàn Thành' : order.Status}</p>
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

export default DoneOrders;
