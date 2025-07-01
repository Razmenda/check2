import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const { Message, User, Chat, ChatParticipant } = models;
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
      where: { chatId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatar']
      }],
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
    const { content, type = 'text' } = req.body;

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
      type
    };

    // Handle file upload
    if (req.file) {
      messageData.content = `/uploads/${req.file.filename}`;
      messageData.fileName = req.file.originalname;
      messageData.fileSize = req.file.size;
      messageData.type = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
    }

    const message = await Message.create(messageData);

    // Get message with sender info
    const fullMessage = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatar']
      }]
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
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatar']
      }]
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

    await message.destroy();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;