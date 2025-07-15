import express from 'express';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const { Notification, User } = models;
const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const unreadCount = await Notification.count({
      where: { 
        userId: req.user.id,
        isRead: false 
      }
    });

    res.json({
      notifications,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(notifications.length / parseInt(limit))
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId, type, title, body, data } = req.body;

    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      data: data || null
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({
      isRead: true,
      readAt: new Date()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.update(
      { 
        isRead: true,
        readAt: new Date()
      },
      { 
        where: { 
          userId: req.user.id,
          isRead: false
        } 
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['notificationSettings']
    });

    res.json(user.notificationSettings || {
      messages: true,
      calls: true,
      groups: true,
      stories: true,
      sound: true,
      vibration: true,
      preview: true
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notification settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;

    await User.update(
      { notificationSettings: settings },
      { where: { id: req.user.id } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;