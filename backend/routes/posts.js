const express = require('express');
const router = express.Router();
const { Post, User, Comment } = require('../models');
const auth = require('../middleware/auth');

// Get all posts (Feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'name', 'avatarUrl'] },
        { 
          model: Comment, 
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'username', 'name', 'avatarUrl'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const authorId = req.user.id; // Get authorId from JWT
    const post = await Post.create({ content, authorId });
    // Fetch with author to return complete object
    const createdPost = await Post.findByPk(post.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'name', 'avatarUrl'] },
        { model: Comment, as: 'comments' }
      ]
    });
    res.json(createdPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    post.likesCount += 1;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
