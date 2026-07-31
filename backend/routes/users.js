const express = require('express');
const router = express.Router();
const { User, Post, Follower } = require('../models');

// Simple "login/register" combined for demo purposes
router.post('/login', async (req, res) => {
  try {
    const { username, name } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });
    
    let user = await User.findOne({ where: { username } });
    if (!user) {
      if (!name) return res.status(400).json({ error: 'Name is required for new users' });
      user = await User.create({ username, name });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a user profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { username: req.params.username },
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
