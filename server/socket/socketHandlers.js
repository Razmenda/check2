import models from '../models/index.js';

const { User, Message, Chat, ChatParticipant } = models;

// Store active users and their socket connections
const activeUsers = new Map();
const typingUsers = new Map();

export const handleSocketConnection = (socket, io) => {
  console.log(`User ${socket.user.username} connected`);

  // Store user connection
  activeUsers.set(socket.userId, socket.id);

  // Update user status to online
  User.findByPk(socket.userId).then(user => {
    if (user) {
      user.update({ status: 'online', lastSeen: new Date() });
      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status: 'online',
        lastSeen: new Date()
      });
    }
  });

  // Join user to their chat rooms
  ChatParticipant.findAll({
    where: { userId: socket.userId },
    include: [{ model: Chat }]
  }).then(participations => {
    participations.forEach(participation => {
      socket.join(`chat_${participation.chatId}`);
    });
  });

  // Handle new message
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content, type = 'text' } = data;

      // Verify user is participant
      const participant = await ChatParticipant.findOne({
        where: { chatId, userId: socket.userId }
      });

      if (!participant) {
        socket.emit('error', { message: 'Not authorized to send messages to this chat' });
        return;
      }

      // Create message
      const message = await Message.create({
        chatId,
        senderId: socket.userId,
        content,
        type
      });

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

      // Emit to all participants in the chat
      io.to(`chat_${chatId}`).emit('new_message', fullMessage);

      // Clear typing indicator for this user
      const typingKey = `${chatId}_${socket.userId}`;
      typingUsers.delete(typingKey);
      socket.to(`chat_${chatId}`).emit('typing_stopped', {
        chatId,
        userId: socket.userId,
        username: socket.user.username
      });

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { chatId } = data;
    const typingKey = `${chatId}_${socket.userId}`;
    
    if (!typingUsers.has(typingKey)) {
      typingUsers.set(typingKey, setTimeout(() => {
        typingUsers.delete(typingKey);
        socket.to(`chat_${chatId}`).emit('typing_stopped', {
          chatId,
          userId: socket.userId,
          username: socket.user.username
        });
      }, 3000)); // Auto-clear after 3 seconds
    }

    socket.to(`chat_${chatId}`).emit('typing_started', {
      chatId,
      userId: socket.userId,
      username: socket.user.username
    });
  });

  socket.on('typing_stop', (data) => {
    const { chatId } = data;
    const typingKey = `${chatId}_${socket.userId}`;
    
    if (typingUsers.has(typingKey)) {
      clearTimeout(typingUsers.get(typingKey));
      typingUsers.delete(typingKey);
    }

    socket.to(`chat_${chatId}`).emit('typing_stopped', {
      chatId,
      userId: socket.userId,
      username: socket.user.username
    });
  });

  // Handle call signaling
  socket.on('call_invite', (data) => {
    const { chatId, callId, type } = data;
    socket.to(`chat_${chatId}`).emit('call_invite', {
      callId,
      type,
      initiator: {
        id: socket.userId,
        username: socket.user.username,
        avatar: socket.user.avatar
      }
    });
  });

  socket.on('call_answer', (data) => {
    const { callId, answer } = data;
    socket.broadcast.emit('call_answered', { callId, answer });
  });

  socket.on('call_reject', (data) => {
    const { callId } = data;
    socket.broadcast.emit('call_rejected', { callId });
  });

  socket.on('call_end', (data) => {
    const { callId } = data;
    socket.broadcast.emit('call_ended', { callId });
  });

  // WebRTC signaling
  socket.on('webrtc_offer', (data) => {
    const { targetUserId, offer, callId } = data;
    const targetSocketId = activeUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc_offer', {
        offer,
        callId,
        fromUserId: socket.userId
      });
    }
  });

  socket.on('webrtc_answer', (data) => {
    const { targetUserId, answer, callId } = data;
    const targetSocketId = activeUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc_answer', {
        answer,
        callId,
        fromUserId: socket.userId
      });
    }
  });

  socket.on('webrtc_ice_candidate', (data) => {
    const { targetUserId, candidate, callId } = data;
    const targetSocketId = activeUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('webrtc_ice_candidate', {
        candidate,
        callId,
        fromUserId: socket.userId
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log(`User ${socket.user.username} disconnected`);

    // Remove from active users
    activeUsers.delete(socket.userId);

    // Clear any typing indicators
    for (const [key, timeout] of typingUsers.entries()) {
      if (key.endsWith(`_${socket.userId}`)) {
        clearTimeout(timeout);
        typingUsers.delete(key);
        const chatId = key.split('_')[0];
        socket.to(`chat_${chatId}`).emit('typing_stopped', {
          chatId,
          userId: socket.userId,
          username: socket.user.username
        });
      }
    }

    // Update user status to offline
    try {
      const user = await User.findByPk(socket.userId);
      if (user) {
        await user.update({ 
          status: 'offline', 
          lastSeen: new Date() 
        });
        
        socket.broadcast.emit('user_status_changed', {
          userId: socket.userId,
          status: 'offline',
          lastSeen: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating user status on disconnect:', error);
    }
  });
};