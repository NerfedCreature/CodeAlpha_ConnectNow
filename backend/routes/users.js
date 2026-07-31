const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Post, Follower } = require('../models');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123';

// Helper for password validation
const isValidPassword = (password) => {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= minLength && hasUpper && hasLower && hasNumber;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, name, password } = req.body;
    
    if (!username || !name || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long, contain 1 uppercase letter, 1 lowercase letter, and 1 number.' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ where: { username } });
    if (user) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = await User.create({
      username,
      name,
      password: hashedPassword
    });

    // Generate JWT
    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, name: user.name, avatarUrl: user.avatarUrl }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Please provide username and password' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, avatarUrl: user.avatarUrl }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current logged in user profile (using token)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a user profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { username: req.params.username },
      attributes: { exclude: ['password'] },
      include: [
        { model: Post, as: 'posts', include: ['author'] },
        { model: User, as: 'followers', attributes: ['id', 'username', 'name'] },
        { model: User, as: 'following', attributes: ['id', 'username', 'name'] }
      ]
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (for suggestions)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'name', 'avatarUrl'] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
