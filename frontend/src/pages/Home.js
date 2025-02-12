import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Carousel from 'react-bootstrap/Carousel';
import { Modal, Button, Form, InputGroup, FormControl } from 'react-bootstrap';
import im1 from '../images/1.jpg';
import im2 from '../images/2.jpg';
import im3 from '../images/3.jpg';
import axios from 'axios';
import  "./products.css";
import { FcCloseUpMode } from "react-icons/fc";





const Home = () => {
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
const [adminName, setAdminName] = useState('');
const [adminPassword, setAdminPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    password: ''
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  const handleLoginClose = () => setShowLoginModal(false);
  const handleLoginShow = () => setShowLoginModal(true);

  const handleAdminLoginShow = () => setShowAdminLogin(true);
const handleAdminLoginClose = () => setShowAdminLogin(false);


  const navigate = useNavigate();


  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });//using spread operator(saglach ghyach)
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5000/signup', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      alert(response.data.message); // Success message
      setShowModal(false); // Close modal on success
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };
  // when you click on login button 
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); //stop the page reloading orlese youll lose the data
  
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email: loginEmail,
        password: loginPassword
      });
  
      if (response.data.token) {
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userId', response.data.user.id);  // Ensure it matches across files
        alert('Login successful');
        setShowLoginModal(false);  // Close modal on success
        navigate('/products');      // Redirect to products page
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert(error.response?.data?.message || 'Something went wrong.');
    }
  };
  // admin modal
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending admin credentials:", { name: adminName, password: adminPassword });
  
    try {
      const response = await axios.post('http://localhost:5000/admin-login', {
        name: adminName.trim(),  
        password: adminPassword.trim()
      });
  
      if (response.status === 200) {
        alert('Admin Login Successful');
        setShowAdminLogin(false); 
        navigate('/admin');
      }
    } catch (error) {
      console.error("Error response:", error.response);
      alert(error.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };
  
  
  
  
  return (
    <div>
      {/* Header/Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-light"  >
        <div className="container">
        <FcCloseUpMode className='rose'/>
          <a className="navbar-brand dancing-script" href="/">PinterestFinds</a>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto montserrat">
            
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
            
              <li className="nav-item">
                <Link className="nav-link" onClick={handleModalShow}>Signup</Link>
              </li>
              
              <li className="nav-item">
                <Link className="nav-link" onClick={handleLoginShow}>Login</Link>
              </li>
              
              <li className="nav-item">
                <Link className="nav-link" onClick={handleAdminLoginShow}>Admin</Link>
              </li>

            </ul>
          </div>
        </div>
      </nav> 

      {/* Carousel */}
      <div className="containermain ">
        
        <Carousel>
          <Carousel.Item>
            <img className="d-block w-100" src={im1} alt="First slide" />
            <Carousel.Caption >
              <h1>30% off on all orders</h1>
              <p>Huge discount on electronics!</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={im2} alt="Second slide" />
            <Carousel.Caption>
              <h3>Special Deal 2</h3>
              <p>Save big on fashion!</p>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src={im3} alt="Third slide" />
            <Carousel.Caption>
              <h3>Special Deal 3</h3>
              <p>Exclusive offers for members!</p>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>

      {/* Signup Modal */}
      <Modal show={showModal} onHide={handleModalClose} className='montserrat'>
        <Modal.Header closeButton>
          <Modal.Title>Signup</Modal.Title>
        </Modal.Header>
        <Modal.Body className='signup'>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="text"
                name="contact"
                placeholder="Enter contact number"
                value={formData.contact}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <FormControl
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                  <i className={`bi ${passwordVisible ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </Button>
              </InputGroup>
            </Form.Group>

            <Button variant="success" type="submit">
              Sign Up
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* login modal */}
      <Modal show={showLoginModal} onHide={handleLoginClose} className='montserrat'>
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLoginSubmit}>
            <Form.Group className="mb-3" controlId="formLoginEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formLoginPassword">
              <Form.Label>Password</Form.Label>
              <InputGroup>

              <Form.Control
              type={passwordVisible ? "text" : "password"}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                  <i className={`bi ${passwordVisible ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </Button>
                </InputGroup>
            </Form.Group>
            

            <Button variant="primary" type="submit">
              Login
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* admin modal */}
      <Modal show={showAdminLogin} onHide={handleAdminLoginClose} className='montserrat'>
  <Modal.Header closeButton>
    <Modal.Title>Admin Login</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleAdminLoginSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        
        <Form.Control
          type="text"
          placeholder="Enter admin name"
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          required
        />

      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <InputGroup>
        <Form.Control
          type={passwordVisible ? "text" : "password"}
          placeholder="Enter password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          required
        />
        <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                  <i className={`bi ${passwordVisible ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </Button>
                </InputGroup>
      </Form.Group>

      <Button variant="danger" type="submit">Login</Button>
    </Form>
  </Modal.Body>
</Modal>


    </div>
  );
};

export default Home;
