const express = require('express');
const router = express.Router();
const { Follower } = require('../models');
const auth = require('../middleware/auth');

// Follow a user
router.post('/', auth, async (req, res) => {
  try {
    const { followingId } = req.body;
    const followerId = req.user.id;
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
router.post('/unfollow', auth, async (req, res) => {
  try {
    const { followingId } = req.body;
    const followerId = req.user.id;
    await Follower.destroy({
      where: { followerId, followingId }
    });
    res.json({ message: 'Unfollowed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
