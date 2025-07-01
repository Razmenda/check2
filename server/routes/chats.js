import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const { Chat, ChatParticipant, User, Message } = models;
const router = express.Router();

// Get user's chats
router.get('/', authenticateToken, async (req, res) => {
  try {
    // First get all chat IDs where user is a participant
    const userParticipations = await ChatParticipant.findAll({
      where: { userId: req.user.id },
      attributes: ['chatId']
    });

    const chatIds = userParticipations.map(p => p.chatId);

    if (chatIds.length === 0) {
      return res.json([]);
    }

    // Then get the chats with their details
    const chats = await Chat.findAll({
      where: { id: { [Op.in]: chatIds } },
      include: [
        {
          model: User,
          as: 'participants',
          through: { attributes: [] },
          attributes: ['id', 'username', 'status', 'avatar', 'lastSeen']
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username']
          }]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new chat
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { participantIds, isGroup, name } = req.body;
    
    // For direct chats, check if chat already exists
    if (!isGroup && participantIds.length === 1) {
      const existingChatParticipants = await ChatParticipant.findAll({
        where: {
          userId: { [Op.in]: [req.user.id, participantIds[0]] }
        },
        group: ['chatId'],
        having: models.sequelize.literal('COUNT(*) = 2')
      });

      if (existingChatParticipants.length > 0) {
        const existingChat = await Chat.findByPk(existingChatParticipants[0].chatId, {
          include: [{
            model: User,
            as: 'participants',
            through: { attributes: [] },
            attributes: ['id', 'username', 'status', 'avatar']
          }]
        });
        
        if (existingChat && !existingChat.isGroup) {
          return res.json(existingChat);
        }
      }
    }

    // Create new chat
    const chat = await Chat.create({
      name: isGroup ? name : null,
      isGroup,
      createdBy: req.user.id
    });

    // Add participants
    const participants = [req.user.id, ...participantIds];
    await Promise.all(
      participants.map(userId =>
        ChatParticipant.create({
          chatId: chat.id,
          userId,
          role: userId === req.user.id ? 'admin' : 'member'
        })
      )
    );

    // Return chat with participants
    const newChat = await Chat.findByPk(chat.id, {
      include: [{
        model: User,
        as: 'participants',
        through: { attributes: [] },
        attributes: ['id', 'username', 'status', 'avatar']
      }]
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is participant
    const participant = await ChatParticipant.findOne({
      where: { chatId: req.params.id, userId: req.user.id }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const chat = await Chat.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'participants',
        through: { attributes: [] },
        attributes: ['id', 'username', 'status', 'avatar', 'lastSeen']
      }]
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;