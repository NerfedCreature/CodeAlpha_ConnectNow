const express = require('express');
const router = express.Router();
const { Notification, User, Message } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Get all notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'sourceUser', attributes: ['id', 'username', 'name', 'avatarUrl'] }
      ]
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread counts
router.get('/unread', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const unreadNotifications = await Notification.count({
      where: { userId, isRead: false }
    });

    const unreadMessages = await Message.count({
      where: { receiverId: userId, isRead: false }
    });

    res.json({ notifications: unreadNotifications, messages: unreadMessages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.put('/read', auth, async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
