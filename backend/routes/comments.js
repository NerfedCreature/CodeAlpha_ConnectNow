const express = require('express');
const router = express.Router();
const { Comment, Post, User, Notification } = require('../models');
const auth = require('../middleware/auth');

// Add a comment to a post
router.post('/', auth, async (req, res) => {
  try {
    const { content, postId } = req.body;
    const authorId = req.user.id;
    const comment = await Comment.create({ content, postId, authorId });
    
    // Fetch with author to return complete object
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'name', 'avatarUrl'] }
      ]
    });

    // Notify the post owner if it's not their own comment
    const post = await Post.findByPk(postId);
    console.log('Post found:', post ? post.id : null, 'Author:', post ? post.authorId : null, 'Commenter:', req.user.id);
    if (post && post.authorId !== req.user.id) {
      console.log('Creating comment notification...');
      const notification = await Notification.create({
        userId: post.authorId,
        sourceUserId: req.user.id,
        type: 'COMMENT',
        postId: post.id
      });

      const notificationWithUser = await Notification.findByPk(notification.id, {
        include: [{ model: User, as: 'sourceUser', attributes: ['id', 'username', 'name', 'avatarUrl'] }]
      });

      if (req.io) {
        req.io.to(`user_${post.authorId}`).emit('receive_notification', notificationWithUser);
        console.log('Socket emitted to user_', post.authorId);
      }
    }

    res.status(201).json(commentWithUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
