import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CreateOrderModal from '../components/CreateOrderModal';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    productList: [{ color: 'Red', size: 30, quantity: 1 }],
  });
  const [orders, setOrders] = useState([]);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState(null);

  // Use useMemo to safely parse the logged-in customer from localStorage only once
  const loggedInCustomer = useMemo(() => {
    try {
      const storedCustomer = localStorage.getItem('loggedInCustomer');
      if (storedCustomer && storedCustomer !== 'undefined') {
        return JSON.parse(storedCustomer);
      }
    } catch (e) {
      console.error('Error parsing loggedInCustomer from localStorage:', e);
    }
    return null;
  }, []);

  // Fetch all orders and filter those that match the logged-in customer name
  useEffect(() => {
    if (loggedInCustomer && loggedInCustomer.name) {
      axios.get('https://fme5f3bdqi.execute-api.ap-southeast-2.amazonaws.com/prod/get', {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        const allOrders = JSON.parse(response.data.body); // Parse response body
        setOrders(allOrders);
        
        // Filter orders for the logged-in customer
        const filteredOrders = allOrders.filter(order => order.Customer === loggedInCustomer.name);
        setCustomerOrders(filteredOrders);
        setLoadingOrders(false);
      })
      .catch(error => {
        if (error.response) {
          console.error('Error response from server:', error.response);
          setOrderError('Error response from server: ' + error.response.status);
        } else if (error.request) {
          console.error('Network error, no response received:', error.request);
          setOrderError('Network error, no response received. Check your network or API.');
        } else {
          console.error('Error in request setup:', error.message);
          setOrderError('Error in request setup: ' + error.message);
        }
        setLoadingOrders(false);
      });
    }
  }, [loggedInCustomer]); // This will now only run once when loggedInCustomer is calculated

  const handleOrderSaveClick = () => {
    // Submit order logic
    console.log('Order saved:', newOrder);
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Welcome to the Order System</h1>

      {/* Create New Order Button */}
      <button onClick={() => setIsModalOpen(true)}>Create Order</button>

      {isModalOpen && (
        <CreateOrderModal
          newOrder={newOrder}
          setNewOrder={setNewOrder}
          handleCreateOrderSaveClick={handleOrderSaveClick}
          handleClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Customer Order Section */}
      <div className="customer-orders">
        <h2>Your Orders</h2>
        {loadingOrders ? (
          <p>Loading your orders...</p>
        ) : orderError ? (
          <p>{orderError}</p>
        ) : customerOrders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product List</th>
                <th>Total Quantity</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Order Date</th>
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
