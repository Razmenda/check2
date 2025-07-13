import express from 'express';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const { Call, Chat, ChatParticipant, User } = models;
const router = express.Router();

// Get user's call history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const calls = await Call.findAll({
      where: {
        participants: {
          [models.sequelize.Op.contains]: [req.user.id]
        }
      },
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
      ],
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(calls);
  } catch (error) {
    console.error('Get calls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

    const updateData = {};
    if (status) updateData.status = status;
    if (startedAt) updateData.startedAt = startedAt;
    if (endedAt) updateData.endedAt = endedAt;
    if (duration !== undefined) updateData.duration = duration;

    await call.update(updateData);

    const updatedCall = await Call.findByPk(call.id, {
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

    res.json(updatedCall);
  } catch (error) {
    console.error('Update call error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get call statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const totalCalls = await Call.count({
      where: {
        participants: {
          [models.sequelize.Op.contains]: [req.user.id]
        }
      }
    });

    const missedCalls = await Call.count({
      where: {
        participants: {
          [models.sequelize.Op.contains]: [req.user.id]
        },
        status: 'missed'
      }
    });

    const totalDuration = await Call.sum('duration', {
      where: {
        participants: {
          [models.sequelize.Op.contains]: [req.user.id]
        },
        status: 'ended',
        duration: {
          [models.sequelize.Op.not]: null
        }
      }
    });

    res.json({
      totalCalls,
      missedCalls,
      totalDuration: totalDuration || 0
    });
  } catch (error) {
    console.error('Get call stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;