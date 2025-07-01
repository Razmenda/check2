import express from 'express';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const { Call, Chat, ChatParticipant, User } = models;
const router = express.Router();

// Initiate call
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { chatId, type = 'audio' } = req.body;

    // Check if user is participant in chat
    const participant = await ChatParticipant.findOne({
      where: { chatId, userId: req.user.id }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not authorized to call in this chat' });
    }

    // Get all participants
    const participants = await ChatParticipant.findAll({
      where: { chatId },
      include: [{
        model: User,
        attributes: ['id', 'username']
      }]
    });

    const call = await Call.create({
      chatId,
      initiatorId: req.user.id,
      participants: participants.map(p => p.User.id),
      type,
      status: 'pending'
    });

    const fullCall = await Call.findByPk(call.id, {
      include: [
        {
          model: User,
          as: 'initiator',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Chat,
          attributes: ['id', 'name', 'isGroup']
        }
      ]
    });

    res.status(201).json(fullCall);
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get call details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const call = await Call.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'initiator',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Chat,
          attributes: ['id', 'name', 'isGroup']
        }
      ]
    });

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Check if user is participant
    if (!call.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to view this call' });
    }

    res.json(call);
  } catch (error) {
    console.error('Get call error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update call status
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { status, startedAt, endedAt, duration } = req.body;
    
    const call = await Call.findByPk(req.params.id);

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    // Check if user is participant
    if (!call.participants.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to update this call' });
    }

    await call.update({
      ...(status && { status }),
      ...(startedAt && { startedAt }),
      ...(endedAt && { endedAt }),
      ...(duration && { duration })
    });

    res.json(call);
  } catch (error) {
    console.error('Update call error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;