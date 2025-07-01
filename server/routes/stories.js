import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import models from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const { Story, StoryView, StoryReaction, User } = models;
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for story uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/stories'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'story-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get all active stories from contacts
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get user's contacts (users they have chats with)
    const userChats = await models.ChatParticipant.findAll({
      where: { userId: req.user.id },
      include: [{
        model: models.Chat,
        include: [{
          model: models.User,
          as: 'participants',
          where: { id: { [Op.ne]: req.user.id } },
          attributes: ['id']
        }]
      }]
    });

    const contactIds = [...new Set(
      userChats.flatMap(chat => 
        chat.Chat.participants.map(p => p.id)
      )
    )];

    // Add current user to see their own stories
    contactIds.push(req.user.id);

    // Get active stories from contacts
    const stories = await Story.findAll({
      where: {
        userId: { [Op.in]: contactIds },
        isActive: true,
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: StoryView,
          as: 'views',
          include: [{
            model: User,
            as: 'viewer',
            attributes: ['id', 'username', 'avatar']
          }]
        },
        {
          model: StoryReaction,
          as: 'reactions',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'avatar']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
          hasUnviewed: false
        };
      }
      
      // Check if current user has viewed this story
      const hasViewed = story.views.some(view => view.viewerId === req.user.id);
      if (!hasViewed) {
        acc[userId].hasUnviewed = true;
      }
      
      acc[userId].stories.push({
        ...story.toJSON(),
        hasViewed
      });
      
      return acc;
    }, {});

    // Convert to array and sort (current user first, then by latest story)
    const result = Object.values(groupedStories).sort((a, b) => {
      if (a.user.id === req.user.id) return -1;
      if (b.user.id === req.user.id) return 1;
      
      const aLatest = Math.max(...a.stories.map(s => new Date(s.createdAt).getTime()));
      const bLatest = Math.max(...b.stories.map(s => new Date(s.createdAt).getTime()));
      
      return bLatest - aLatest;
    });

    res.json(result);
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new story
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { type, caption, backgroundColor, textColor, content } = req.body;
    
    let storyContent = content;
    
    // Handle file upload
    if (req.file) {
      storyContent = `/uploads/stories/${req.file.filename}`;
    }

    if (!storyContent) {
      return res.status(400).json({ error: 'Story content is required' });
    }

    // Calculate expiration time (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await Story.create({
      userId: req.user.id,
      type: type || (req.file ? (req.file.mimetype.startsWith('video/') ? 'video' : 'image') : 'text'),
      content: storyContent,
      caption: caption || null,
      backgroundColor: backgroundColor || '#1F3934',
      textColor: textColor || '#FFFFFF',
      expiresAt
    });

    // Get story with user info
    const fullStory = await Story.findByPk(story.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar']
      }]
    });

    res.status(201).json(fullStory);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View a story
router.post('/:id/view', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if story is still active
    if (!story.isActive || new Date() > story.expiresAt) {
      return res.status(410).json({ error: 'Story has expired' });
    }

    // Create or update view record
    const [view, created] = await StoryView.findOrCreate({
      where: {
        storyId: story.id,
        viewerId: req.user.id
      },
      defaults: {
        viewedAt: new Date()
      }
    });

    if (created) {
      // Increment view count
      await story.increment('viewCount');
    }

    res.json({ success: true, viewed: true });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// React to a story
router.post('/:id/react', authenticateToken, async (req, res) => {
  try {
    const { type, emoji } = req.body;
    const story = await Story.findByPk(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if story is still active
    if (!story.isActive || new Date() > story.expiresAt) {
      return res.status(410).json({ error: 'Story has expired' });
    }

    // Create or update reaction
    const [reaction, created] = await StoryReaction.findOrCreate({
      where: {
        storyId: story.id,
        userId: req.user.id
      },
      defaults: {
        type: type || 'like',
        emoji: emoji || null
      }
    });

    if (!created) {
      await reaction.update({
        type: type || reaction.type,
        emoji: emoji || reaction.emoji
      });
    }

    // Get reaction with user info
    const fullReaction = await StoryReaction.findByPk(reaction.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar']
      }]
    });

    res.json(fullReaction);
  } catch (error) {
    console.error('React to story error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get story views and reactions
router.get('/:id/interactions', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if user owns this story
    if (story.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view story interactions' });
    }

    const [views, reactions] = await Promise.all([
      StoryView.findAll({
        where: { storyId: story.id },
        include: [{
          model: User,
          as: 'viewer',
          attributes: ['id', 'username', 'avatar']
        }],
        order: [['viewedAt', 'DESC']]
      }),
      StoryReaction.findAll({
        where: { storyId: story.id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }],
        order: [['createdAt', 'DESC']]
      })
    ]);

    res.json({ views, reactions });
  } catch (error) {
    console.error('Get story interactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete story
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Check if user owns this story
    if (story.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this story' });
    }

    await story.update({ isActive: false });
    
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;