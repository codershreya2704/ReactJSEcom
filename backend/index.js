const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST','PUT', 'DELETE'],
  credentials: true
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ecom', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  contact: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Define Cart Schema
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      image: String,
      quantity: { type: Number, default: 1 }
    }
  ]
});
const Cart = mongoose.model('Cart', cartSchema);

// Define Admin Schema
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const Admin = mongoose.model('Admin', adminSchema);

// Define Product Schema (if missing)
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  
});

const Product = mongoose.model('Product', productSchema);


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Save files to 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

app.use('/uploads', express.static('uploads'));
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only (jpeg, jpg, png)!');
    }
  }
});
app.use('/uploads', express.static('uploads'));


app.post('/admin/products', upload.single('image'), async (req, res) => {
  const { name, price } = req.body;

  if (!name || !price || !req.file) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newProduct = new Product({
      name,
      price,
      image: req.file.filename,  // Save file name in DB
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error });
  }
});
app.get('/admin/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
});
app.put('/admin/products/:id', upload.single('image'), async (req, res) => {
  const { name, price } = req.body;
  const updateFields = { name, price };

  if (req.file) {
    updateFields.image = req.file.filename;  // Update image if uploaded
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
});
app.delete('/admin/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
});

// Signup route with validation and password hashing
app.post('/signup',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, contact, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email, contact, password: hashedPassword });
      await newUser.save();
      res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  }
);
// Update user details (Admin or User can update)
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error });
  }
});
app.put('/users/:id', async (req, res) => {
  const { id } = req.params; // Get the user ID from the route
  const { name, email, contact, password } = req.body; // Extract fields from the request body

  try {
    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update only the fields provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (contact) user.contact = contact;
    if (password) {
      // Hash the new password before saving
      user.password = await bcrypt.hash(password, 10);
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      message: 'User details updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        contact: user.contact,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password); //do the comparison
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, '@shreya#', { expiresIn: '1h' });

    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        contact: user.contact 
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Cart management
app.post('/add-to-cart', async (req, res) => {
  const { userId, product } = req.body; //ethe apan userId pathvto
  
  if (!userId || !product) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // fetch the user details to get email and contact
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    
    const userEmail = user.email;
    const userContact = user.contact;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, email:user.email,contact: user.contact, products: [] }); //we send these data to backend
    }

    const existingProduct = cart.products.find(item => item.productId.equals(product.productId));
    //jar cart madhe item asel tar increase quantity by 1
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }

    // Save the cart and include user's email and contact
    await cart.save();

    res.status(200).json({ 
      message: 'Product added to cart', 
      cart: cart.products,
      user: { email: userEmail, contact: userContact }  // Include user email and contact in the response
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product to cart', error });
  }
});


app.get('/cart/:userId', async (req, res) => { 
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('userId', 'email contact');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json({
      cart: cart.products,
      user: {
        email: cart.userId.email,
        contact: cart.userId.contact,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cart', error });
  }
});

app.post('/remove-from-cart', async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
          //konta delete karyach te filter karaych 
    cart.products = cart.products.filter(item => !item.productId.equals(productId));

    await cart.save();
    res.status(200).json({ message: 'Product removed from cart', cart: cart.products });
  } catch (error) {
    res.status(500).json({ message: 'Error removing product', error });
  }
});

// Admin login
app.post('/admin-login', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const admin = await Admin.findOne({ name });

    if (!admin || admin.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token                                        //this is my secret key
    const token = jwt.sign({ id: admin._id, name: admin.name }, '@shreya#', { expiresIn: '1h' });

    res.status(200).json({ message: 'Admin login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Admin dashboard route
app.get('/admin-dashboard', (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard', admin: req.admin });
});

// Fetch all users for admin
app.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find();  // Fetch all users from the User collection
    res.status(200).json(users);  // Send the user data to the frontend
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Fetch all carts for admin
app.get('/admin/carts', async (req, res) => {
  try {
    const carts = await Cart.find().populate('userId', 'name email contact'); // Populate to get user details along with cart
    res.status(200).json(carts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart details', error });
  }
});
//order management 
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      image: String,
      quantity: { type: Number, default: 1 }
    }
  ],
  status: { type: String, default: 'Placed' }, 
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', orderSchema);

app.post('/create-order', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Fetch user details using the userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the cart of the user
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: 'Cart is empty, cannot place order' });
    }

    // Create the order with user details
    const newOrder = new Order({
      userId,
      email: user.email,  // Dynamically get email
      contact: user.contact,  // Dynamically get contact
      products: cart.products,
      status: 'Pending'
    });

    // Save the order and clear the cart
    await newOrder.save();
    cart.products = [];
    await cart.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order', error });
  }
});


app.get('/orders/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const orders = await Order.find({ userId });
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found' });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});



// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
