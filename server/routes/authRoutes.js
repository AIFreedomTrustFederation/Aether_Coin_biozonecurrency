const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateAccessToken } = require('../middleware/auth');

const router = express.Router();

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && await bcrypt.compare(password, user.password)) {
    const token = generateAccessToken({ username: user.username });
    res.json({ token });
  } else {
    res.status(403).json({ message: 'Login failed, incorrect credentials' });
  }
});

module.exports = router;