import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CreateOrderModal.css';

const CreateOrderModal = ({ newOrder, setNewOrder, handleOrderSaveClick, handleClose }) => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [uniqueColors, setUniqueColors] = useState([]);
  const [filteredSizes, setFilteredSizes] = useState({});
  const [maxQuantities, setMaxQuantities] = useState({});
  const [productIDs, setProductIDs] = useState({});

  useEffect(() => {
    // Fetch products to populate colors and sizes
    axios.get('https://jic2uc8adb.execute-api.ap-southeast-2.amazonaws.com/prod/get')
      .then(response => {
        const productData = JSON.parse(response.data.body);
        setProducts(productData);
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
    const product = products.find(
      (product) => product.Color === color && product.Size === size
    );
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
      filterSizesByColor(value);
      updatedProducts[index].size = '';
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
      productList: [...prev.productList, { color: uniqueColors[0], size: '', quantity: 1 }],
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Create Order</h3>

        {newOrder.productList.map((product, index) => (
          <div key={index} className="product-card">
            <div className="product-row">
              <div className="product-field-group">
                <label>Color</label>
                <select
                  value={product.color}
                  onChange={(e) => handleProductChange(index, 'color', e.target.value)}
                >
                  {uniqueColors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
              <div className="product-field-group">
                <label>Size</label>
                <select
                  value={product.size}
                  onChange={(e) => handleProductChange(index, 'size', e.target.value)}
                >
                  {(filteredSizes[product.color] || []).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="product-field-group">
                <label>Quantity (Max: {maxQuantities[`${product.color}-${product.size}`] || 0})</label>
                <input
                  type="number"
                  value={product.quantity}
                  min="1"
                  max={maxQuantities[`${product.color}-${product.size}`] || 0}
                  onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}

        <button onClick={addProduct}>Add Another Product</button>

        <button onClick={handleOrderSaveClick}>Save Order</button>
        <button onClick={handleClose}>Cancel</button>
      </div>
    </div>
  );
};

export default CreateOrderModal;
