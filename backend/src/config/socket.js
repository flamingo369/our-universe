const { supabaseAdmin } = require('../config/supabase');

// Store online users
const onlineUsers = new Map();

// Initialize Socket.IO
const initializeSocket = (io) => {
  // Middleware for authentication using Supabase
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      // Verify token with Supabase
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !user) {
        return next(new Error('Authentication error: Invalid Supabase token'));
      }
      
      // Attach user to socket
      socket.user = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user'
      };
      
      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    console.log(`💬 User connected: ${socket.user.name} (${socket.id})`);
    
    // Store user as online
    onlineUsers.set(socket.user.id, {
      socketId: socket.id,
      name: socket.user.name,
      username: socket.user.username
    });
    
    // Broadcast user online status
    io.emit('user_online', {
      userId: socket.user.id,
      username: socket.user.username
    });
    
    // Join user's personal room
    socket.join(`user_${socket.user.id}`);
    
    // Handle joining a chat room with another user
    socket.on('join_chat', (otherUserId) => {
      const roomName = [socket.user.id, otherUserId].sort().join('_');
      socket.join(roomName);
      console.log(`User ${socket.user.name} joined chat room: ${roomName}`);
    });
    
    // Handle sending a message - support both event names
    socket.on('send_message', async (data) => {
      await handleMessage(socket, io, data);
    });
    
    // Also support camelCase event name from frontend
    socket.on('sendMessage', async (data) => {
      await handleMessage(socket, io, data);
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      const roomName = [socket.user.id, receiverId].sort().join('_');
      
      socket.to(roomName).emit('user_typing', {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping
      });
    });
    
    // Handle message read receipts
    socket.on('mark_read', async (data) => {
      try {
        const { messageId } = data;
        
        await supabaseAdmin
          .from('messages')
          .update({ read: true, read_at: new Date().toISOString() })
          .eq('id', messageId);
        
        const roomName = [socket.user.id, data.senderId].sort().join('_');
        io.to(roomName).emit('message_read', { messageId });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });
    
    // Handle message deletion
    socket.on('delete_message', async (data) => {
      try {
        const { messageId } = data;
        
        await supabaseAdmin
          .from('messages')
          .delete()
          .eq('id', messageId);
        
        io.emit('message_deleted', { messageId });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`💔 User disconnected: ${socket.user.name}`);
      
      onlineUsers.delete(socket.user.id);
      
      io.emit('user_offline', {
        userId: socket.user.id,
        username: socket.user.username
      });
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.user.name}:`, error);
    });
  });
  
  // Get online users
  io.on('get_online_users', (callback) => {
    const users = Array.from(onlineUsers.values());
    callback(users);
  });
};

// Helper function to handle messages
async function handleMessage(socket, io, data) {
  try {
    const { receiverId, content, type = 'text' } = data;
    
    if (!receiverId || !content) {
      socket.emit('error', { message: 'Missing receiverId or content' });
      return;
    }
    
    // Create room name (sorted to ensure consistency)
    const roomName = [socket.user.id, receiverId].sort().join('_');
    
    // Create message object to save
    const messageData = {
      sender_id: socket.user.id,
      receiver_id: receiverId,
      content: content,
      type: type,
      room: roomName
    };
    
    // Save message to Supabase
    const { data: savedMessage, error } = await supabaseAdmin
      .from('messages')
      .insert([messageData])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to save message' });
      return;
    }
    
    // Create populated message for emission
    const populatedMessage = {
      id: savedMessage.id,
      senderId: socket.user.id,
      senderName: socket.user.name || socket.user.email?.split('@')[0] || 'User',
      receiverId: receiverId,
      content: content,
      type: type,
      timestamp: savedMessage.created_at,
      room: roomName
    };
    
    // Emit message to room (support both event names)
    io.to(roomName).emit('receive_message', populatedMessage);
    io.to(roomName).emit('receiveMessage', populatedMessage);
    
    // Send notification to receiver if online
    const receiverSocket = onlineUsers.get(receiverId);
    if (receiverSocket && receiverSocket.socketId !== socket.id) {
      io.to(receiverSocket.socketId).emit('new_message_notification', {
        from: socket.user.id,
        message: content
      });
    }
    
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', { message: 'Failed to send message' });
  }
}

// Export online users map for use in other modules
const getOnlineUsers = () => onlineUsers;

module.exports = {
  initializeSocket,
  getOnlineUsers
};