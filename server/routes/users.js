import express from 'express';
import { Op } from 'sequelize';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const { User } = models;
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarsDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }
    cb(null, avatarsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get user profile
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'status', 'avatar', 'lastSeen', 'bio', 'phone']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { username, bio, phone } = req.body;
    
    // Validate username if provided
    if (username && (username.length < 2 || username.length > 50)) {
      return res.status(400).json({ error: 'Username must be between 2 and 50 characters' });
    }

    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({
        where: {
          username: username.trim(),
          id: { [Op.ne]: req.user.id }
        }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const updateData = {};
    if (username) updateData.username = username.trim();
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;

    await req.user.update(updateData);

    res.json({
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      status: req.user.status,
      avatar: req.user.avatar,
      bio: req.user.bio,
      phone: req.user.phone,
    });
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload avatar
router.post('/:id/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Delete old avatar if exists
    if (req.user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../', req.user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }
    
    await req.user.update({
      avatar: avatarUrl
    });

    res.json({
      message: 'Avatar updated successfully',
      avatar: avatarUrl,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        status: req.user.status,
        avatar: avatarUrl,
        bio: req.user.bio,
        phone: req.user.phone,
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search) {
      // Return all users except current user for contacts
      const users = await User.findAll({
        where: {
          id: { [Op.ne]: req.user.id }
        },
        attributes: ['id', 'username', 'email', 'status', 'avatar', 'bio', 'phone'],
        limit: 20
      });
      return res.json(users);
    }
    
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ],
        id: { [Op.ne]: req.user.id } // Exclude current user
      },
      attributes: ['id', 'username', 'email', 'status', 'avatar', 'bio', 'phone'],
      limit: 10
    });

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;