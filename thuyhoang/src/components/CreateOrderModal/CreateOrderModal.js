import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CreateOrderModal.css';

const CreateOrderModal = ({ newOrder, setNewOrder, handleClose, setOrders, orders }) => {
  const [uniqueColors, setUniqueColors] = useState([]);
  const [products, setProducts] = useState([]);
  const [maxQuantities, setMaxQuantities] = useState({});
  const [productIDs, setProductIDs] = useState({});
  const [note, setNote] = useState(''); // New state for the note field

  const formatCurrencyVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const loggedInCustomer = (() => {
    try {
      const storedCustomer = localStorage.getItem('loggedInCustomer');
      if (storedCustomer && storedCustomer !== 'undefined') {
        return JSON.parse(storedCustomer);
      }
    } catch (e) {
      console.error('Error parsing loggedInCustomer from localStorage:', e);
    }
    return null;
  })();

  useEffect(() => {
    axios.get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        const productData = JSON.parse(response.data.body);
        setProducts(productData);
        const colors = [...new Set(productData.map(product => product.Color))];
        setUniqueColors(colors);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  const getMaxQuantityAndProductID = (color, size) => {
    const product = products.find(product => product.Color === color && product.Size.toString() === size.toString());
    if (product) {
      setProductIDs(prev => ({ ...prev, [`${color}-${size}`]: product.ProductID }));
      return product.Quantity;
    }
    return 0;
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index][field] = value;
    setNewOrder({ ...newOrder, productList: updatedProducts });

    if (field === 'color') {
      updatedProducts[index].size = ''; // Reset size when color changes
    }

    if (field === 'size') {
      const color = updatedProducts[index].color;
      const maxQuantity = getMaxQuantityAndProductID(color, value);
      setMaxQuantities(prev => ({ ...prev, [`${color}-${value}`]: maxQuantity }));
    }
  };

  const addProduct = () => {
    setNewOrder(prev => ({
      ...prev,
      productList: [
        ...prev.productList,
        { color: '', size: '', quantity: '', isConfirmed: false },
      ],
    }));
  };

  const confirmProduct = (index) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index].isConfirmed = true;
    setNewOrder({ ...newOrder, productList: updatedProducts });
  };

  const removeProduct = (index) => {
    const updatedProducts = newOrder.productList.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, productList: updatedProducts });
  };

  useEffect(() => {
    if (loggedInCustomer && loggedInCustomer.name && newOrder.customer !== loggedInCustomer.name) {
      setNewOrder(prev => ({
        ...prev,
        customer: loggedInCustomer.name
      }));
    }
  }, [loggedInCustomer, newOrder.customer, setNewOrder]);

  useEffect(() => {
    const totalQuantity = newOrder.productList.reduce((total, product) => total + parseInt(product.quantity || 0), 0);
    const totalAmount = loggedInCustomer ? totalQuantity * (loggedInCustomer.short_price || 0) : 0;

    if (newOrder.totalQuantity !== totalQuantity || newOrder.total !== totalAmount) {
      setNewOrder(prev => ({
        ...prev,
        totalQuantity,
        total: totalAmount,
      }));
    }
  }, [newOrder.productList, loggedInCustomer, newOrder.totalQuantity, newOrder.total, setNewOrder]);

  const handleCreateOrderSaveClick = () => {
    const orderWithID = {
      orderID: Math.floor(10000 + Math.random() * 90000).toString(),
      customer_name: newOrder.customer,
      product_list: newOrder.productList.map((product, index) => ({
        product_id: productIDs[`${product.color}-${product.size}`] || `P00${index + 1}`,
        color: product.color,
        size: product.size,
        quantity: product.quantity
      })),
      total_quantity: newOrder.totalQuantity,
      total_amount: newOrder.total,
      status: 'Pending',
      note: note, // Include the note field in the order object
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const requestBody = JSON.stringify({
      body: JSON.stringify(orderWithID)
    });

    axios.post('https://n73lcvb962.execute-api.ap-southeast-2.amazonaws.com/prod/add', requestBody, {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        console.log('Order saved successfully:', response.data);

        // Update the orders state instantly
        setOrders([orderWithID, ...orders]);

        handleClose();  // Close the modal after saving
      })
      .catch(error => {
        if (error.response) {
          console.error('Server Error:', error.response.data);
          alert(`Lỗi: ${error.response.status} - ${error.response.data.message}`);
        } else if (error.request) {
          console.error('Network error, no response received:', error.request);
          alert('Lỗi mạng: không có phản hồi từ máy chủ.');
        } else {
          console.error('Request Error:', error.message);
          alert('Lỗi khi lưu đơn hàng: ' + error.message);
        }
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">Tạo Đơn Hàng Mới</h3>

        <div className="input-group">
          <label className="input-label">Tên Khách Hàng</label>
          <input
            type="text"
            value={loggedInCustomer?.name ? `${loggedInCustomer.name}` : 'Không tìm thấy khách hàng'}
            readOnly
            className="input-field"
          />
        </div>

        {newOrder.productList.map((product, index) => (
          <div key={index} className="product-card">
            <div className="product-row">
              <div className="product-field-group">
                <label className="input-label">Màu Sắc</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.color}</span>
                ) : (
                  <select
                    value={product.color}
                    onChange={e => handleProductChange(index, 'color', e.target.value)}
                    className="input-field color-input"
                  >
                    <option value="">Chọn màu sắc</option>
                    {uniqueColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="product-field-group">
                <label className="input-label">Số Size</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.size}</span>
                ) : (
                  <input
                    type="text"
                    value={product.size}
                    onChange={e => handleProductChange(index, 'size', e.target.value)}
                    className="input-field size-input"
                    placeholder="Nhập kích cỡ"
                  />
                )}
              </div>

              <div className="product-field-group">
                <label className="input-label">Số Lượng</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.quantity}</span>
                ) : (
                  <input
                    type="number"
                    min="1"
                    max={maxQuantities[`${product.color}-${product.size}`] || 0}
                    value={product.quantity}
                    onChange={e => handleProductChange(index, 'quantity', e.target.value)}
                    className="input-field quantity-input"
                  />
                )}
              </div>

              {!product.isConfirmed ? (
                <button className="add-button" onClick={() => confirmProduct(index)}>Thêm</button>
              ) : (
                <button className="remove-product-button" onClick={() => removeProduct(index)}>Xóa</button>
              )}
            </div>
          </div>
        ))}

        {newOrder.productList.some(product => product.isConfirmed) && (
          <button className="add-product-button" onClick={addProduct}>Thêm Sản Phẩm</button>
        )}

        <div className="input-group">
          <label className="input-label">Tổng Số Lượng</label>
          <input
            type="number"
            name="totalQuantity"
            value={newOrder.totalQuantity}
            readOnly
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Tổng Số Tiền</label>
          <input
            type="text"
            name="total"
            value={formatCurrencyVND(newOrder.total)}
            readOnly
            className="input-field"
          />
        </div>

        {/* New Note Input Field */}
        <div className="input-group">
          <label className="input-label">Ghi Chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-field note-input"
            placeholder="Thêm ghi chú cho đơn hàng..."
          />
        </div>

        <div className="modal-footer">
          <button className="save-button" onClick={handleCreateOrderSaveClick}>Lưu</button>
          <button className="cancel-button" onClick={handleClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;
