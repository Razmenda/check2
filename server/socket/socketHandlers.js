import models from '../models/index.js';

const { User, Message, Chat, ChatParticipant, MessageStatus } = models;

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
      const { chatId, content, type = 'text', replyToId } = data;

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
        type,
        replyToId: replyToId || null
      });

      // Get all participants for message status
      const participants = await ChatParticipant.findAll({
        where: { chatId },
        attributes: ['userId']
      });

      // Create message status for all participants except sender
      const statusPromises = participants
        .filter(p => p.userId !== socket.userId)
        .map(p => MessageStatus.create({
          messageId: message.id,
          userId: p.userId,
          status: 'delivered' // Mark as delivered since they're connected
        }));

      await Promise.all(statusPromises);

      // Get message with sender info and all relations
      const fullMessage = await Message.findByPk(message.id, {
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar']
          },
          {
            model: Message,
            as: 'replyTo',
            attributes: ['id', 'content'],
            include: [{
              model: User,
              as: 'sender',
              attributes: ['username']
            }]
          }
        ]
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

  // Handle message reactions
  socket.on('message_reaction', async (data) => {
    try {
      const { messageId, emoji, chatId } = data;

      // Emit to all participants in the chat
      socket.to(`chat_${chatId}`).emit('message_reaction', {
        messageId,
        emoji,
        userId: socket.userId,
        chatId
      });

    } catch (error) {
      console.error('Message reaction error:', error);
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

  // Handle user presence updates
  socket.on('update_presence', async (data) => {
    try {
      const { status } = data;
      await User.update(
        { status, lastSeen: new Date() },
        { where: { id: socket.userId } }
      );

      socket.broadcast.emit('user_status_changed', {
        userId: socket.userId,
        status,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Update presence error:', error);
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