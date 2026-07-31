const express = require('express');
const router = express.Router();
const { Comment, User, Post } = require('../models');

// Add a comment to a post
router.post('/', async (req, res) => {
  try {
    const { content, postId, authorId } = req.body;
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
