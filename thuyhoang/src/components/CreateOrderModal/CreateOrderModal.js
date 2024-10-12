import React, { useEffect, useState } from 'react';
import axios from 'axios';
import emailjs from 'emailjs-com'; // Import EmailJS library
import './CreateOrderModal.css';

// Initialize EmailJS with your environment variable user ID
emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID); // Use environment variables to initialize

const CreateOrderModal = ({ newOrder, setNewOrder, handleClose, setOrders, orders }) => {
  const [uniqueColors, setUniqueColors] = useState([]);
  const [products, setProducts] = useState([]);
  const [maxQuantities, setMaxQuantities] = useState({});
  const [productIDs, setProductIDs] = useState({});
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state

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
    // Fetch product data from API
    axios
      .get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then((response) => {
        const productData = JSON.parse(response.data.body);
        setProducts(productData);

        const sortedColors = [...new Set(productData.map((product) => product.Color))].sort((a, b) => {
          const aValue = parseInt(a.match(/\d+/)); // Extract the number from the string
          const bValue = parseInt(b.match(/\d+/)); // Extract the number from the string
          return aValue - bValue;
        });

        setUniqueColors(sortedColors);
      })
      .catch((error) => console.error('Lỗi khi lấy danh sách sản phẩm:', error));
  }, []);

  const getMaxQuantityAndProductID = (color, size) => {
    if (!color || !size) return 0;

    const product = products.find((product) => product.Color === color && product.Size?.toString() === size?.toString());
    if (product) {
      setProductIDs((prev) => ({ ...prev, [`${color}-${size}`]: product.ProductID }));
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
      setMaxQuantities((prev) => ({ ...prev, [`${color}-${value}`]: maxQuantity }));
    }
  };

  const addProduct = () => {
    setNewOrder((prev) => ({
      ...prev,
      productList: [...prev.productList, { color: '', size: '', quantity: '', isConfirmed: false }],
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
      setNewOrder((prev) => ({
        ...prev,
        customer: loggedInCustomer.name,
      }));
    }
  }, [loggedInCustomer, newOrder.customer, setNewOrder]);

  useEffect(() => {
    const totalQuantity = newOrder.productList.reduce((total, product) => total + parseInt(product.quantity || 0), 0);
    const totalAmount = loggedInCustomer ? totalQuantity * (loggedInCustomer.short_price || 0) : 0;

    if (newOrder.totalQuantity !== totalQuantity || newOrder.total !== totalAmount) {
      setNewOrder((prev) => ({
        ...prev,
        totalQuantity,
        total: totalAmount,
      }));
    }
  }, [newOrder.productList, loggedInCustomer, newOrder.totalQuantity, newOrder.total, setNewOrder]);

  const handleCreateOrderSaveClick = () => {
    setIsLoading(true); // Start loading spinner

    const orderWithID = {
      orderID: Math.floor(10000 + Math.random() * 90000).toString(),
      customer_name: newOrder.customer,
      product_list: newOrder.productList.map((product, index) => ({
        product_id: productIDs[`${product.color}-${product.size}`] || `P00${index + 1}`,
        color: product.color,
        size: product.size,
        quantity: product.quantity,
      })),
      total_quantity: newOrder.totalQuantity,
      total_amount: newOrder.total,
      status: 'Pending',
      note: note,
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const requestBody = JSON.stringify({
      body: JSON.stringify(orderWithID),
    });

    // Save order to the database
    axios
      .post('https://n73lcvb962.execute-api.ap-southeast-2.amazonaws.com/prod/add', requestBody, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => {
        console.log('Đơn hàng đã được lưu thành công:', response.data);

        // Update the orders state instantly
        setOrders([orderWithID, ...orders]);

        // Send an email notification using EmailJS
        emailjs
          .send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID, // Use environment variable for service ID
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID, // Use environment variable for template ID
            {
              to_name: 'Tên người nhận', // Replace with the actual recipient's name
              from_name: newOrder.customer,
              message: `
                Đã có một đơn hàng mới được tạo bởi ${newOrder.customer}.
                \n\nTổng số lượng: ${newOrder.totalQuantity}
                \nTổng số tiền: ${formatCurrencyVND(newOrder.total)}
                \nGhi chú: ${note}
                \nChi tiết đơn hàng:
                \n${newOrder.productList.map((product) => `${product.color} - Size: ${product.size} - Số lượng: ${product.quantity}`).join('\n')}
              `,
            }
          )
          .then((result) => {
            console.log('Email đã được gửi thành công:', result);
            alert('Email đã được gửi thành công!');
            setIsLoading(false); // Stop loading spinner
            handleClose(); // Close the modal after saving and sending email
          })
          .catch((error) => {
            console.error('Lỗi khi gửi email:', error); // Improved error logging
            alert('Gửi email thất bại. Vui lòng thử lại.');
            setIsLoading(false); // Stop loading spinner
          });
      })
      .catch((error) => {
        console.error('Lỗi yêu cầu:', error.message || error); // Improved error logging
        if (error.response) {
          console.error('Lỗi máy chủ:', error.response.data);
          alert(`Lỗi: ${error.response.status} - ${error.response.data.message}`);
        } else if (error.request) {
          console.error('Lỗi mạng, không có phản hồi từ máy chủ:', error.request);
          alert('Lỗi mạng: Không có phản hồi từ máy chủ.');
        } else {
          console.error('Lỗi yêu cầu:', error.message);
          alert('Lỗi khi lưu đơn hàng: ' + error.message);
        }
        setIsLoading(false); // Stop loading spinner
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
                    onChange={(e) => handleProductChange(index, 'color', e.target.value)}
                    className="input-field color-input"
                  >
                    <option value="">Chọn Màu Sắc</option>
                    {uniqueColors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="product-field-group">
                <label className="input-label">Kích Cỡ</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.size}</span>
                ) : (
                  <input
                    type="text"
                    value={product.size || ''}
                    onChange={(e) => handleProductChange(index, 'size', e.target.value)}
                    className="input-field size-input"
                    placeholder="Nhập Kích Cỡ"
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
                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                    className="input-field quantity-input"
                  />
                )}
              </div>

              {!product.isConfirmed ? (
                <button className="add-button" onClick={() => confirmProduct(index)}>
                  Thêm
                </button>
              ) : (
                <button className="remove-product-button" onClick={() => removeProduct(index)}>
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}

        {newOrder.productList.some((product) => product.isConfirmed) && (
          <button className="add-product-button" onClick={addProduct}>
            Thêm Sản Phẩm
          </button>
        )}

        <div className="input-group">
          <label className="input-label">Tổng Số Lượng</label>
          <input type="number" name="totalQuantity" value={newOrder.totalQuantity} readOnly className="input-field" />
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
          <button className="save-button" onClick={handleCreateOrderSaveClick} disabled={isLoading}>
            {isLoading ? (
              <div className="spinner"></div> // Add spinner when loading
            ) : (
              'Lưu'
            )}
          </button>
          <button className="cancel-button" onClick={handleClose} disabled={isLoading}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;
