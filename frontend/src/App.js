import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';   // Your Home page
import Login from './pages/Login'; // Your Login page
import Signup from './pages/Signup'; // Your Signup page
import Products from './pages/Products';
import Cart from './pages/cart';
import AdminDashboard from './pages/adminDashboard';
import OrdersPage from './pages/ordersPage';
import Profile from './pages/profile';


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home  title="PinterestFinds"/>} />      {/* Home route */}
        <Route path="/cart" element={<Cart title="PinterestFinds" />} />
        <Route path="/admin" element={<AdminDashboard title="PinterestFinds"/>}/>
        <Route path="/login" element={<Login />} />    {/* Login route */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products title="PinterestFinds"/>} />
        <Route path="/profile" element={<Profile title="PinterestFinds"/>}/>
        <Route path="/orders" element={<OrdersPage title="PinterestFinds"/>} />
        {/* Signup route */}
      </Routes>
    </div>
  );
}

export default App;
