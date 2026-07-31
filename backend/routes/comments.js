const express = require('express');
const router = express.Router();
const { Comment, User, Post } = require('../models');
const auth = require('../middleware/auth');

// Add a comment to a post
router.post('/', auth, async (req, res) => {
  try {
    const { content, postId } = req.body;
    const authorId = req.user.id;
    const comment = await Comment.create({ content, postId, authorId });
    
    // Fetch with author to return complete object
    const createdComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'name', 'avatarUrl'] }]
    });
    res.json(createdComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
