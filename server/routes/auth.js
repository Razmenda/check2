import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import models from '../models/index.js';

const { User } = models;
const router = express.Router();

// Register
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('📝 Signup attempt:', { username, email, passwordLength: password?.length });

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Trim inputs
    const trimmedUsername = username.trim();
    const trimmedEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Validate username
    if (trimmedUsername.length < 2 || trimmedUsername.length > 50) {
      return res.status(400).json({ error: 'Username must be between 2 and 50 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: trimmedEmail }, 
          { username: trimmedUsername }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === trimmedEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (existingUser.username === trimmedUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    console.log('✅ Creating user with data:', {
      username: trimmedUsername,
      email: trimmedEmail,
      hasPasswordHash: !!passwordHash
    });

    // Create user
    const user = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      passwordHash,
      status: 'online',
      bio: 'Hey there! I am using Chekawak Messenger.',
      phone: ''
    });

    console.log('✅ User created successfully:', { id: user.id, username: user.username, email: user.email });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone
      },
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message);
      return res.status(400).json({ error: validationErrors.join(', ') });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      if (field === 'email') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      if (field === 'username') {
        return res.status(400).json({ error: 'Username already taken' });
      }
      return res.status(400).json({ error: 'User already exists' });
    }

    if (error.name === 'SequelizeDatabaseError') {
      console.error('💥 Database error:', error.message);
      return res.status(500).json({ error: 'Database error. Please try again.' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Find user
    const user = await User.findOne({ 
      where: { 
        email: trimmedEmail 
      } 
    });
    
    if (!user) {
      console.log('❌ User not found for email:', trimmedEmail);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    console.log('✅ User found:', { id: user.id, username: user.username, email: user.email });

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', user.email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Update status and last seen
    await user.update({
      status: 'online',
      lastSeen: new Date(),
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for user:', user.email);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    
    if (error.name === 'SequelizeDatabaseError') {
      console.error('💥 Database error:', error.message);
      return res.status(500).json({ error: 'Database error. Please try again.' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    const newToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.json({ 
      token: newToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('❌ Token refresh error:', error);
    res.status(403).json({ error: 'Invalid token' });
  }
});

export default router;