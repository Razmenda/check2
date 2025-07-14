import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const { Message, MessageReaction, MessageStatus, VoiceMessage, User, Chat, ChatParticipant } = models;
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Get messages for a chat
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant in chat
    const participant = await ChatParticipant.findOne({
      where: { chatId, userId: req.user.id }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to view this chat' });
    }

    const messages = await Message.findAll({
      where: { 
        chatId,
        isDeleted: false
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Message,
          as: 'replyTo',
          attributes: ['id', 'content'],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['username']
          }]
        },
        {
          model: MessageReaction,
          as: 'reactions',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }]
        },
        {
          model: MessageStatus,
          as: 'statuses',
          attributes: ['userId', 'status', 'timestamp']
        },
        {
          model: VoiceMessage,
          as: 'voiceMessage',
          attributes: ['duration', 'waveform']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message
router.post('/:chatId', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { chatId } = req.params;
    const { content, type = 'text', replyToId, duration } = req.body;

    // Check if user is participant in chat
    const participant = await ChatParticipant.findOne({
      where: { chatId, userId: req.user.id }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to send messages to this chat' });
    }

    const messageData = {
      chatId,
      senderId: req.user.id,
      content: content || '',
      type,
      replyToId: replyToId || null
    };

    // Handle file upload
    if (req.file) {
      messageData.content = `/uploads/${req.file.filename}`;
      messageData.fileName = req.file.originalname;
      messageData.fileSize = req.file.size;
      
      if (type === 'voice') {
        messageData.type = 'voice';
      } else {
        messageData.type = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
      }
    }

    const message = await Message.create(messageData);

    // Create voice message record if it's a voice message
    if (type === 'voice' && duration) {
      await VoiceMessage.create({
        messageId: message.id,
        duration: parseInt(duration),
        waveform: null // You can implement waveform generation here
      });
    }

    // Get all participants for message status
    const participants = await ChatParticipant.findAll({
      where: { chatId },
      attributes: ['userId']
    });

    // Create message status for all participants except sender
    const statusPromises = participants
      .filter(p => p.userId !== req.user.id)
      .map(p => MessageStatus.create({
        messageId: message.id,
        userId: p.userId,
        status: 'sent'
      }));

    await Promise.all(statusPromises);

    // Get message with all relations
    const fullMessage = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Message,
          as: 'replyTo',
          attributes: ['id', 'content'],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['username']
          }]
        },
        {
          model: MessageReaction,
          as: 'reactions',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }]
        },
        {
          model: MessageStatus,
          as: 'statuses',
          attributes: ['userId', 'status', 'timestamp']
        },
        {
          model: VoiceMessage,
          as: 'voiceMessage',
          attributes: ['duration', 'waveform']
        }
      ]
    });

    // Update chat's updatedAt
    await Chat.update(
      { updatedAt: new Date() },
      { where: { id: chatId } }
    );

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// React to message
router.post('/:messageId/react', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user has access to this message's chat
    const participant = await ChatParticipant.findOne({
      where: { chatId: message.chatId, userId: req.user.id }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Check if reaction already exists
    const existingReaction = await MessageReaction.findOne({
      where: { messageId, userId: req.user.id, emoji }
    });

    if (existingReaction) {
      await existingReaction.destroy();
    } else {
      await MessageReaction.create({
        messageId,
        userId: req.user.id,
        emoji
      });
    }

    // Get updated reactions
    const reactions = await MessageReaction.findAll({
      where: { messageId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar']
      }]
    });

    res.json({ reactions });
  } catch (error) {
    console.error('React to message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark message as read
router.post('/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Update message status
    await MessageStatus.update(
      { status: 'read', timestamp: new Date() },
      { 
        where: { 
          messageId, 
          userId: req.user.id 
        } 
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Edit message
router.put('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }

    await message.update({
      content,
      isEdited: true,
      editedAt: new Date()
    });

    const updatedMessage = await Message.findByPk(messageId, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Message,
          as: 'replyTo',
          attributes: ['id', 'content'],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['username']
          }]
        },
        {
          model: MessageReaction,
          as: 'reactions',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }]
        }
      ]
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete message
router.delete('/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await message.update({
      isDeleted: true,
      deletedAt: new Date()
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove reaction
router.delete('/reactions/:reactionId', authenticateToken, async (req, res) => {
  try {
    const { reactionId } = req.params;

    const reaction = await MessageReaction.findByPk(reactionId);
    if (!reaction) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    if (reaction.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await reaction.destroy();
    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;