import express from 'express';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const { Contact, User } = models;
const router = express.Router();

// Get user's contacts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, favorites } = req.query;
    
    const whereClause = { userId: req.user.id };
    if (favorites === 'true') {
      whereClause.isFavorite = true;
    }

    const contacts = await Contact.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'contact',
        attributes: ['id', 'username', 'email', 'status', 'avatar', 'lastSeen'],
        where: search ? {
          [Op.or]: [
            { username: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        } : undefined
      }],
      order: [['lastInteraction', 'DESC']]
    });

    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add contact
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { contactId, nickname } = req.body;

    // Check if user exists
    const contactUser = await User.findByPk(contactId);
    if (!contactUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      where: { userId: req.user.id, contactId }
    });

    if (existingContact) {
      return res.status(400).json({ error: 'Contact already exists' });
    }

    const contact = await Contact.create({
      userId: req.user.id,
      contactId,
      nickname: nickname || null
    });

    const fullContact = await Contact.findByPk(contact.id, {
      include: [{
        model: User,
        as: 'contact',
        attributes: ['id', 'username', 'email', 'status', 'avatar', 'lastSeen']
      }]
    });

    res.status(201).json(fullContact);
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { nickname, isFavorite } = req.body;

    const contact = await Contact.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const updateData = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    await contact.update(updateData);

    const updatedContact = await Contact.findByPk(contact.id, {
      include: [{
        model: User,
        as: 'contact',
        attributes: ['id', 'username', 'email', 'status', 'avatar', 'lastSeen']
      }]
    });

    res.json(updatedContact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Block/Unblock contact
router.put('/:id/block', authenticateToken, async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const contact = await Contact.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await contact.update({ isBlocked });

    // Also update user's blocked users list
    const user = await User.findByPk(req.user.id);
    let blockedUsers = user.blockedUsers || [];
    
    if (isBlocked) {
      if (!blockedUsers.includes(contact.contactId)) {
        blockedUsers.push(contact.contactId);
      }
    } else {
      blockedUsers = blockedUsers.filter(id => id !== contact.contactId);
    }

    await user.update({ blockedUsers });

    res.json({ success: true, isBlocked });
  } catch (error) {
    console.error('Block contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await contact.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get blocked contacts
router.get('/blocked', authenticateToken, async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      where: { 
        userId: req.user.id,
        isBlocked: true
      },
      include: [{
        model: User,
        as: 'contact',
        attributes: ['id', 'username', 'email', 'avatar']
      }]
    });

    res.json(contacts);
  } catch (error) {
    console.error('Get blocked contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users to add as contacts
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }

    // Get existing contact IDs
    const existingContacts = await Contact.findAll({
      where: { userId: req.user.id },
      attributes: ['contactId']
    });
    const existingContactIds = existingContacts.map(c => c.contactId);

    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { username: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } }
            ]
          },
          { id: { [Op.ne]: req.user.id } }, // Exclude current user
          { id: { [Op.notIn]: existingContactIds } } // Exclude existing contacts
        ]
      },
      attributes: ['id', 'username', 'email', 'avatar', 'status'],
      limit: 20
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;