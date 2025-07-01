import jwt from 'jsonwebtoken';
import models from '../models/index.js';

const { User } = models;

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(403).json({ error: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token format' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error - no token provided'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return next(new Error('Authentication error - user not found'));
    }

    socket.userId = user.id;
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      next(new Error('Authentication error - invalid token format'));
    } else if (error.name === 'TokenExpiredError') {
      next(new Error('Authentication error - token expired'));
    } else {
      next(new Error('Authentication error'));
    }
  }
};