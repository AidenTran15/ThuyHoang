import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CreateOrderModal.css';

const CreateOrderModal = ({ newOrder, setNewOrder, handleCreateOrderSaveClick, handleClose }) => {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerError, setCustomerError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [uniqueColors, setUniqueColors] = useState([]);
  const [filteredSizes, setFilteredSizes] = useState({});
  const [products, setProducts] = useState([]);
  const [maxQuantities, setMaxQuantities] = useState({});
  const [productIDs, setProductIDs] = useState({});

  // Fetch customers when the modal opens
  useEffect(() => {
    axios.get('https://twnbtj6wuc.execute-api.ap-southeast-2.amazonaws.com/prod/customers') // Update the endpoint to your actual API
      .then(response => {
        const customerData = JSON.parse(response.data.body);
        setCustomers(Array.isArray(customerData) ? customerData : []);
        setLoadingCustomers(false);
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
        setCustomerError('Error fetching customers');
        setLoadingCustomers(false);
      });
  }, []);

  // Fetch the available products
  useEffect(() => {
    axios.get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        const productData = JSON.parse(response.data.body);
        setProducts(productData);

        // Extract unique colors from the product data
        const colors = [...new Set(productData.map(product => product.Color))];
        setUniqueColors(colors);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  }, []);

  const filterSizesByColor = (color) => {
    const sizesForColor = products
      .filter(product => product.Color === color)
      .map(product => product.Size);
    setFilteredSizes({ [color]: [...new Set(sizesForColor)] });
  };

  const getMaxQuantityAndProductID = (color, size) => {
    const product = products.find(product => product.Color === color && product.Size.toString() === size.toString());

    if (product) {
      setProductIDs(prev => ({ ...prev, [`${color}-${size}`]: product.ProductID }));
      return product.Quantity;
    } else {
      return 0;
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...newOrder.productList];
    updatedProducts[index][field] = value;
    setNewOrder({ ...newOrder, productList: updatedProducts });

    if (field === 'color') {
      filterSizesByColor(value);
      updatedProducts[index].size = '';
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
        { color: uniqueColors[0] || 'red', size: 30, quantity: 1, isConfirmed: false },
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

  const handleNewOrderInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (e) => {
    const selectedCustomerName = e.target.value;
    const customer = customers.find(c => c.name === selectedCustomerName);
    setSelectedCustomer(customer);
    setNewOrder({ ...newOrder, customer: selectedCustomerName });
  };

  // Calculate the total quantity and amount whenever productList or selectedCustomer changes
  useEffect(() => {
    const totalQuantity = newOrder.productList.reduce((total, product) => total + parseInt(product.quantity || 0), 0);
    const totalAmount = selectedCustomer 
      ? totalQuantity * (selectedCustomer.short_price || 0) 
      : 0;

    setNewOrder(prev => ({
      ...prev,
      totalQuantity,
      total: totalAmount,
    }));
  }, [newOrder.productList, selectedCustomer, setNewOrder]);

  return (
    <div className="modal">
      <div className="modal-content">
        <h3 className="modal-title">Create New Order</h3>

        {/* Customer selection section */}
        <div className="input-group">
          <label className="input-label">Customer Name</label>
          {loadingCustomers ? (
            <p>Loading customers...</p>
          ) : customerError ? (
            <p>{customerError}</p>
          ) : (
            <select
              name="customer"
              value={newOrder.customer || ''}
              onChange={handleCustomerChange}
              className="input-field"
            >
              <option value="" disabled>Select a customer</option>
              {customers.map(customer => (
                <option key={customer.phone_number} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {newOrder.productList.map((product, index) => (
          <div key={index} className="product-card">
            <div className="product-row">
              <div className="product-field-group">
                <label className="input-label">Color</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.color}</span>
                ) : (
                  <select
                    value={product.color}
                    onChange={e => handleProductChange(index, 'color', e.target.value)}
                    className="input-field"
                  >
                    {uniqueColors.map(color => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="product-field-group">
                <label className="input-label">Size</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.size}</span>
                ) : (
                  <select
                    value={product.size}
                    onChange={e => handleProductChange(index, 'size', e.target.value)}
                    className="input-field"
                  >
                    {(filteredSizes[product.color] || []).map(size => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="product-field-group">
                <label className="input-label">Quantity (Max: {maxQuantities[`${product.color}-${product.size}`] || 0})</label>
                {product.isConfirmed ? (
                  <span className="locked-field">{product.quantity}</span>
                ) : (
                  <select
                    value={product.quantity}
                    onChange={e => handleProductChange(index, 'quantity', e.target.value)}
                    className="input-field"
                  >
                    {[...Array(maxQuantities[`${product.color}-${product.size}`] || 0).keys()].map(q => (
                      <option key={q + 1} value={q + 1}>
                        {q + 1}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="product-field-group">
                <label className="input-label">Product ID</label>
                <span>{productIDs[`${product.color}-${product.size}`] || 'N/A'}</span>
              </div>

              {!product.isConfirmed ? (
                <button className="add-button" onClick={() => confirmProduct(index)}>
                  Add
                </button>
              ) : (
                <button className="remove-product-button" onClick={() => removeProduct(index)}>
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}

        {newOrder.productList.some(product => product.isConfirmed) && (
          <button className="add-product-button" onClick={addProduct}>
            Add More
          </button>
        )}

        <div className="input-group">
          <label className="input-label">Total Quantity</label>
          <input
            type="number"
            name="totalQuantity"
            value={newOrder.totalQuantity}
            readOnly
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Total Amount</label>
          <input
            type="number"
            name="total"
            value={newOrder.total}
            readOnly
            className="input-field"
          />
        </div>

        <div className="modal-footer">
          <button className="save-button" onClick={handleCreateOrderSaveClick}>
            Save
          </button>
          <button className="cancel-button" onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderModal;
