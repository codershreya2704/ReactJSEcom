import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NavDropdown } from 'react-bootstrap';
import axios from 'axios';
import  "./products.css";
import { FcCloseUpMode } from "react-icons/fc";

const OrdersPage = (props) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId || !token) {
      alert('Please log in to view your orders');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/orders/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId, token]);

  useEffect(() => {
    // Retrieve logged-in user's name from localStorage
    const storedUser = localStorage.getItem('userName');
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Loading orders...</p></div>;
  }

  if (orders.length === 0) {
    return <div className="text-center mt-5"><p>No orders found</p></div>;
  }

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
              {user ? (
                <NavDropdown title={user || 'User'} id="user-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/orders">Orders</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/signup">Signup</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Orders Section */}
      <div className="container mt-4">
        <h2 className="text-center mb-4">Your Orders</h2>
        <div className="row">
          {orders.map((order) => ( //used map()
            <div key={order._id} className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Order ID: {order._id}</h5>
                  <p><strong>Status:</strong> <span className={`badge bg-${order.status === 'Delivered' ? 'success' : 'warning'}`}>{order.status}</span></p>
                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <h6 className="mt-3">Products:</h6>
                  <ul className="list-group list-group-flush">
                    {order.products.map((product, index) => (
                      <li key={index} className="list-group-item d-flex align-items-center">
                        <img 
                          src={`http://localhost:5000/uploads/${product.image}`} 
                          alt={product.name} 
                          className="img-fluid rounded" 
                          style={{ width: '50px', height: '50px', marginRight: '10px' }} 
                        />
                        <div>
                          <p className="mb-0">{product.name}</p>
                          <p className="text-muted mb-0">₹{product.price} x {product.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
