const express = require('express');
const router = express.Router();
const { Post, User, Comment, Notification, Like } = require('../models');
const auth = require('../middleware/auth');

// Get all posts (Feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'name', 'avatarUrl'] },
        { model: User, as: 'likedBy', attributes: ['id'], through: { attributes: [] } },
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

// Get a single post by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'name', 'avatarUrl'] },
        { model: User, as: 'likedBy', attributes: ['id'], through: { attributes: [] } },
        { 
          model: Comment, 
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'username', 'name', 'avatarUrl'] }]
        }
      ]
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get following posts (Following Feed)
router.get('/feed', auth, async (req, res) => {
  try {
    const { Follower } = require('../models');
    const following = await Follower.findAll({ where: { followerId: req.user.id } });
    const followingIds = following.map(f => f.followingId);
    
    // Include user's own posts as well
    followingIds.push(req.user.id);

    const posts = await Post.findAll({
      where: { authorId: followingIds },
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'name', 'avatarUrl'] },
        { model: User, as: 'likedBy', attributes: ['id'], through: { attributes: [] } },
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
        { model: User, as: 'likedBy', attributes: ['id'], through: { attributes: [] } },
        { model: Comment, as: 'comments' }
      ]
    });
    res.json(createdPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like/Unlike a post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    
    // Check if already liked
    const existingLike = await Like.findOne({
      where: { postId: post.id, userId: req.user.id }
    });

    let action = 'liked';

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      post.likesCount = Math.max(0, post.likesCount - 1);
      action = 'unliked';
    } else {
      // Like
      await Like.create({ postId: post.id, userId: req.user.id });
      post.likesCount += 1;

      // Create a notification for the author if they aren't the liker
      if (post.authorId !== req.user.id) {
        const notification = await Notification.create({
          userId: post.authorId,
          sourceUserId: req.user.id,
          type: 'LIKE',
          postId: post.id
        });

        const notificationWithUser = await Notification.findByPk(notification.id, {
          include: [{ model: User, as: 'sourceUser', attributes: ['id', 'username', 'name', 'avatarUrl'] }]
        });

        if (req.io) {
          req.io.to(`user_${post.authorId}`).emit('receive_notification', notificationWithUser);
        }
      }
    }

    await post.save();
    res.json({ post, action });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
