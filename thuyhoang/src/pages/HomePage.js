import React, { useState } from 'react';
import CreateOrderModal from '../components/CreateOrderModal';

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    productList: [{ color: 'Red', size: 30, quantity: 1 }],
  });

  const handleOrderSaveClick = () => {
    // Submit order logic
    console.log('Order saved:', newOrder);
    setIsModalOpen(false);
  };

  return (
    <div>
      <h1>Welcome to the Order System</h1>
      <button onClick={() => setIsModalOpen(true)}>Create Order</button>

      {isModalOpen && (
        <CreateOrderModal
          newOrder={newOrder}
          setNewOrder={setNewOrder}
          handleOrderSaveClick={handleOrderSaveClick}
          handleClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
