const express = require('express');
const router = express.Router();
const { Follower } = require('../models');

// Follow a user
router.post('/', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }
    
    const [follow, created] = await Follower.findOrCreate({
      where: { followerId, followingId }
    });
    
    if (!created) {
      return res.status(400).json({ error: 'Already following this user' });
    }
    
    res.json(follow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unfollow a user
router.post('/unfollow', async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    await Follower.destroy({
      where: { followerId, followingId }
    });
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
