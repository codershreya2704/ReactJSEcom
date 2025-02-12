import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import  "./products.css";
import { FcCloseUpMode } from "react-icons/fc";

const Cart = (props) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // Fetch cart items from the backend
  useEffect(() => {
    const fetchCartItems = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      

      if (!userId || !token) {
        alert('Please log in to view your cart');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/cart/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCartItems(response.data.cart); // Set the cart items in the state

        // Calculate the total price of the items in the cart
        const totalAmount = response.data.cart.reduce((sum, item) => sum + item.price, 0);
        setTotal(totalAmount);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  // Handle removing an item from the cart
  const handleRemoveFromCart = async (productId) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      alert('Please log in to remove items from the cart');
      return;
    }

    try {
      await axios.post('http://localhost:5000/remove-from-cart', {
        userId,
        productId
      });

      // Refresh cart items after removal
      const response = await axios.get(`http://localhost:5000/cart/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data.cart);

      // Recalculate total
      const totalAmount = response.data.cart.reduce((sum, item) => sum + item.price, 0);
      setTotal(totalAmount);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleCheckout = () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('Please log in to proceed with checkout');
      return;
    }
  
    axios.post('http://localhost:5000/create-order', { userId })
      .then(response => {
        alert('Order placed successfully');
        navigate('/orders');
      })
      .catch(error => {
        console.error('Error placing order:', error);
      });
  };
  

  return (
    <div>
      {/* Header/Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-light">
        <div className="container">
          <FcCloseUpMode className='rose'/>
          <a className="navbar-brand dancing-script" href="/">{props.title}</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto montserrat">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cart">Cart</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">Profile</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/orders">Orders</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={() => { localStorage.removeItem('userName'); localStorage.removeItem('userId'); localStorage.removeItem('token'); }}>Logout</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Cart Items Container */}
      <div className="container mt-4">
        <h2>Your Cart</h2>
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <Row>
            {cartItems.map((item) => (
              <Col key={item.productId} md={4} className="mb-4">
                <Card>
                  <Card.Img variant="top" src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} className="img-fluid" style={{ height: '200px', objectFit: 'cover' }} />
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>Rs. {item.price}</Card.Text>
                    <Button variant="danger" onClick={() => handleRemoveFromCart(item.productId)}>Remove</Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div className="mt-4">
          <h4>Total: Rs. {total}</h4>
          <Button variant="success" to="/products" onClick={handleCheckout}>Checkout</Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
