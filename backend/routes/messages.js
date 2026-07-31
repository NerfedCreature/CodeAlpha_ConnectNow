const express = require('express');
const router = express.Router();
const { Message, User } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// Get user's inbox (list of users they have messaged with)
router.get('/', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Find all messages sent or received by current user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId },
          { receiverId: currentUserId }
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'name', 'avatarUrl'] },
        { model: User, as: 'receiver', attributes: ['id', 'username', 'name', 'avatarUrl'] }
      ]
    });

    // Extract unique conversation partners
    const partnersMap = new Map();
    
    messages.forEach(msg => {
      const partner = msg.senderId === currentUserId ? msg.receiver : msg.sender;
      if (!partnersMap.has(partner.id)) {
        partnersMap.set(partner.id, {
          user: partner,
          lastMessage: msg
        });
      }
    });

    res.json(Array.from(partnersMap.values()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get message history with a specific user
router.get('/:username', auth, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Find target user
    const targetUser = await User.findOne({ where: { username: req.params.username } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    
    // Get messages between current user and target user
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: currentUserId }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'name', 'avatarUrl'] }
      ]
    });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content.trim()) {
      return res.status(400).json({ error: 'Receiver and content are required' });
    }

    const message = await Message.create({ senderId, receiverId, content });
    
    // Fetch the newly created message with sender info to return to frontend
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'username', 'name', 'avatarUrl'] }
      ]
    });

    // Broadcast the message to the receiver's room via Socket.io
    if (req.io) {
      req.io.to(`user_${receiverId}`).emit('receive_message', messageWithSender);
    }

    res.status(201).json(messageWithSender);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
