import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CreateOrderModal.css';

const CreateOrderModal = ({ newOrder, setNewOrder, handleClose, setOrders, orders }) => {
  const [uniqueColors, setUniqueColors] = useState([]);
  const [products, setProducts] = useState([]);
  const [maxQuantities, setMaxQuantities] = useState({});
  const [productIDs, setProductIDs] = useState({});

  // Format currency in VND
  const formatCurrencyVND = (amount) => {
    if (isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Retrieve logged-in customer data from localStorage
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

  // Fetch products data from API
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

  // Update max quantity and product ID based on selected color and size
  const getMaxQuantityAndProductID = (color, size) => {
    const product = products.find(product => product.Color === color && product.Size.toString() === size.toString());
    if (product) {
      setProductIDs(prev => ({ ...prev, [`${color}-${size}`]: product.ProductID }));
      return product.Quantity;
    }
    return 0;
  };

  // Handle changes in the product selection fields
  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index][field] = value;
    setNewOrder({ ...newOrder, productList: updatedProducts });

    // Reset size and recalculate max quantities when color changes
    if (field === 'color') {
      updatedProducts[index].size = '';
      updatedProducts[index].quantity = '';
    }

    if (field === 'size') {
      const color = updatedProducts[index].color;
      const maxQuantity = getMaxQuantityAndProductID(color, value);
      setMaxQuantities(prev => ({ ...prev, [`${color}-${value}`]: maxQuantity }));
    }

    calculateTotal(updatedProducts);
  };

  // Handle input changes for other fields (e.g., note)
  const handleInputChange = (field, value) => {
    setNewOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Calculate total quantity and total amount for the order based on customer's price
  const calculateTotal = (productList) => {
    const totalQuantity = productList.reduce((total, product) => total + (parseInt(product.quantity) || 0), 0);
    
    // Use the customer's price if it exists
    const customerPrice = loggedInCustomer?.short_price || 0;

    // Calculate total amount based on the customer's price
    const totalAmount = totalQuantity * customerPrice;

    setNewOrder((prev) => ({
      ...prev,
      totalQuantity,
      total: totalAmount
    }));
  };

  // Function to confirm a product in the order list
  const confirmProduct = (index) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index].isConfirmed = true;
    setNewOrder({ ...newOrder, productList: updatedProducts });
  };

  // Function to remove a product from the order list
  const removeProduct = (index) => {
    const updatedProducts = newOrder.productList.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, productList: updatedProducts });
    calculateTotal(updatedProducts); // Recalculate total after removing
  };

  // Handle creating and saving the order
  const handleCreateOrderSaveClick = () => {
    const { customer, productList, totalQuantity, total, note } = newOrder;

    if (!customer || productList.length === 0 || totalQuantity === 0 || total === 0) {
      alert('All required fields must be filled out before saving the order.');
      return;
    }

    const orderWithID = {
      orderID: Math.floor(10000 + Math.random() * 90000).toString(),
      customer_name: customer,
      product_list: productList.map((product, index) => ({
        product_id: productIDs[`${product.color}-${product.size}`] || `P00${index + 1}`,
        color: product.color,
        size: product.size,
        quantity: product.quantity
      })),
      total_quantity: totalQuantity,
      total_amount: total,
      status: 'Pending',
      note: note || '', // Include note field if provided, otherwise empty string
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    axios.post('https://n73lcvb962.execute-api.ap-southeast-2.amazonaws.com/prod/add', JSON.stringify({ body: JSON.stringify(orderWithID) }), {
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        console.log('Order saved successfully:', response.data);
        setOrders([orderWithID, ...orders]);
        handleClose(); // Close the modal after saving
      })
      .catch(error => {
        console.error('Error saving order:', error);
        alert('Error saving the order. Please try again.');
      });
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">Tạo Đơn Hàng Mới</h3>
        <div className="input-group">
          <label className="input-label">Tên Khách Hàng</label>
          <input type="text" value={loggedInCustomer?.name || ''} readOnly className="input-field" />
        </div>
        {newOrder.productList.map((product, index) => (
          <div key={index} className="product-card">
            <div className="product-row">
              <div className="product-field-group">
                <label className="input-label">Màu Sắc</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.color}</span>
                ) : (
                  <select value={product.color} onChange={e => handleProductChange(index, 'color', e.target.value)} className="input-field color-input">
                    <option value="">Chọn màu sắc</option>
                    {uniqueColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="product-field-group">
                <label className="input-label">Kích Cỡ</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.size}</span>
                ) : (
                  <input type="text" value={product.size} onChange={e => handleProductChange(index, 'size', e.target.value)} className="input-field size-input" placeholder="Nhập kích cỡ" />
                )}
              </div>
              <div className="product-field-group">
                <label className="input-label">Số Lượng</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.quantity}</span>
                ) : (
                  <input type="number" min="1" max={maxQuantities[`${product.color}-${product.size}`] || 0} value={product.quantity} onChange={e => handleProductChange(index, 'quantity', e.target.value)} className="input-field quantity-input" />
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
        <div className="input-group">
          <label className="input-label">Tổng Số Lượng</label>
          <input type="number" value={newOrder.totalQuantity} readOnly className="input-field" />
        </div>
        <div className="input-group">
          <label className="input-label">Tổng Số Tiền</label>
          <input type="text" value={formatCurrencyVND(newOrder.total)} readOnly className="input-field" />
        </div>
        <div className="input-group">
          <label className="input-label">Ghi Chú</label>
          <textarea value={newOrder.note || ''} onChange={e => handleInputChange('note', e.target.value)} placeholder="Ghi chú cho đơn hàng (tùy chọn)" className="input-field" rows="3" />
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
