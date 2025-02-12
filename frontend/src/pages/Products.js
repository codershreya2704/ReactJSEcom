import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, NavDropdown, Form } from 'react-bootstrap';
import axios from 'axios';
import  "./products.css";
import { FcCloseUpMode } from "react-icons/fc";

// import product1 from '../images/product1.jpg';
// import product2 from '../images/product2.jpg';
// import product3 from '../images/product3.jpg';
// import product4 from '../images/product4.jpg';
// import product5 from '../images/product5.jpg';
// import product6 from '../images/product6.jpg';
// import product7 from '../images/product7.jpg';
// import product8 from '../images/product8.jpg';
// import product9 from '../images/product9.jpg';
// import product10 from '../images/product10.jpg';

// const products = [
//   { id: '65a1234567890abcd1234567', name: 'Rust Orange Pillow Case', price: 839, image: product1 },
//   { id: '65a1234567890abcd1234568', name: 'Wooden Chair', price: 6789, image: product2 },
//   { id: '65a1234567890abcd1234569', name: 'Grey Melange Cusion Chair', price: 44382, image: product3 },
//   { id: '65a1234567890abcd1234570', name: 'White Round Table', price: 2380, image: product4 },
//   { id: '65a1234567890abcd1234571', name: 'Rusty Wooden Table', price: 4499, image: product5 },
//   { id: '65a1234567890abcd1234572', name: 'Ceiling Lamp', price: 1500, image: product6 },
//   { id: '65a1234567890abcd1234573', name: 'Iranian Rug', price: 8567, image: product7 },
//   { id: '65a1234567890abcd1234574', name: 'Velvet Pillow Case', price: 800, image: product8 },
//   { id: '65a1234567890abcd1234575', name: 'Pumpkin Planter', price: 760, image: product9 },
//   { id: '65a1234567890abcd1234576', name: 'Cement Planter', price: 2229, image: product10 }
// ];


const Products = (props) => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedRange, setSelectedRange] = useState('');
  //to show cart items

  useEffect(() => {
    
   
    const fetchCartItems = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      

      if (!userId || !token) {
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/cart/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCartItems(response.data.cart); // Set the cart items in the state
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);
  const [user, setUser] = useState(null);

  useEffect(() =>{
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  },[]);
  useEffect(() => {
    // Retrieve user from localStorage
    const storedUser = localStorage.getItem('userName');
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const handleAddToCart = async (product) => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');  // Ensure userId is stored correctly
      const email = localStorage.getItem('userEmail');
    const contact = localStorage.getItem('userContact');
      if (!userId || !token) {
        alert('Please log in to add items to the cart');
        return;
      }
  
      await axios.post('http://localhost:5000/add-to-cart', {
        userId: userId,
        product: {
          productId: product._id,  // Change to use _id
          name: product.name,
          price: product.price,
          image: product.image
        },
        email,
        contact,
      });
  
      alert('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  const handleFilter = () => {
    if (!selectedRange) {
      setFilteredProducts(products); // Reset to show all products if no range is selected
      return;
    }

    const [min, max] = selectedRange.split('-').map(Number);

    const filtered = products.filter((product) => product.price >= min && product.price <= max);
    setFilteredProducts(filtered);
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
                <NavDropdown title="Cart" id="cart-dropdown">
                  {cartItems.length === 0 ? (
                    <NavDropdown.Item>No items in cart</NavDropdown.Item>
                  ) : (
                    cartItems.map((item) => (
                      <NavDropdown.Item key={item.productId}>
                        {item.name} - Rs. {item.price}
                      </NavDropdown.Item>
                    ))
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/cart">Go to Cart</NavDropdown.Item>
                </NavDropdown>

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
       {/* Products Container */}
      <div className="container mt-4">
        

        {/* Filter Section */}
        <div className="mb-4   ">
          <Form.Select
            aria-label="Select Price Range"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            <option value="">Select a price range</option>
            <option value="100-5000">₹100 - ₹5,000</option>
            <option value="6000-20000">₹6,000 - ₹20,000</option>
            <option value="30000-90000">₹30,000 - ₹90,000</option>
          </Form.Select>
          <Button className="mt-2" variant="primary" onClick={handleFilter}>Filter</Button>
        </div>
        </div>

      {/* Products Container */}
      <div className="container mt-4">
        <h1 className='text-center'>Our Products</h1>
        <Row>
          {filteredProducts.map((product) => (
            <Col key={product._id} md={4} className="mb-4">
              <Card>
             <Card.Img variant="top" src={`http://localhost:5000/uploads/${product.image}`} alt={product.name} className='img-fluid' style={{ height: '250px', objectFit: 'cover' }} />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>Rs.{product.price}</Card.Text>
                  <Button variant="primary" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Products;
