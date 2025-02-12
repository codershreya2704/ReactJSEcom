import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Table, Button,Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [carts, setCarts] = useState([]);
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    image: null,
    
  });

  useEffect(() => {
    fetchUsers();
    fetchCarts();
    fetchProducts();

  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/users');
      setUsers(response.data); // Store the fetched users in state
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  const fetchCarts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/carts');
      setCarts(response.data);
    } catch (error) {
      console.error('Error fetching carts:', error);
    }
  };
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/admin/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  const handleImageChange = (e) => {
    setProductForm({ ...productForm, image: e.target.files[0] });
  };
  const addProduct = async () => {
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('price', productForm.price);
      formData.append('image', productForm.image);
      await axios.post('http://localhost:5000/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Product added successfully');
      fetchProducts();  // Re-fetch the products list
      setProductForm({
        name: '',
        price: '',
        image: null,
      }); 
       // Clear the form
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };
  const removeProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/admin/products/${productId}`);
      fetchProducts(); // Re-fetch the products list after deletion
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  const removeUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:5000/admin/users/${userId}`);
      fetchUsers(); // Re-fetch users after deleting one
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-light">
        <span className="navbar-brand">Admin Dashboard</span>
        <Button variant="danger" onClick={logout}>Logout</Button>
      </nav>
      <Tabs defaultActiveKey="users" className="mt-3">
        <Tab eventKey="users" title="Registered Users">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.contact}</td>
                  <td>
                    <Button variant="danger" onClick={() => removeUser(user._id)}>Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="carts" title="User Carts">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>User</th>
                <th>Products</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {carts.map(cart => (
                <tr key={cart._id}>
                  <td>{cart.userId.name} ({cart.userId.email})</td>
                  <td>
                    {cart.products.map((product, index) => (
                      <div key={index}>
                        {product.name} (Qty: {product.quantity})<br />
                      </div>
                    ))}
                  </td>
                  <td>{cart.products.reduce((total, product) => total + product.price * product.quantity, 0)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="inventory" title="Inventory">
          <Form>
            <Form.Group controlId="productName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter product name" 
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} 
              />
            </Form.Group>
            <Form.Group controlId="productPrice">
              <Form.Label>Product Price</Form.Label>
              <Form.Control 
                type="number" 
                placeholder="Enter product price" 
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} 
              />
            </Form.Group>
            <Form.Group controlId="productImage">
              <Form.Label>Product Image</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
            </Form.Group>

            <Button variant="primary" className="mt-3" onClick={addProduct}>Add Product</Button>
          </Form>

          <Table striped bordered hover className="mt-3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>
                    <Button variant="danger" onClick={() => removeProduct(product._id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
