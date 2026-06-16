import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import supabase from '../lib/supabase';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const socketRef = useRef(null);
  const authSubscriptionRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        if (socketRef.current) {
          socketRef.current.disconnect();
          setSocket(null);
          setIsConnected(false);
        }
        return;
      }

      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Extract base URL without /api suffix for socket.io
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '');
      const newSocket = io(baseUrl, {
        auth: {
          token: session.access_token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error.message);
        setIsConnected(false);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('❌ Socket reconnect error:', error.message);
      });

      // Handle user online/offline
      newSocket.on('user_online', ({ userId, username }) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    };

    initializeSocket();

    // Listen for auth changes and update socket
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed in SocketContext:', event);
      
      if (event === 'SIGNED_IN' && session?.access_token) {
        // Reconnect socket with new token
        if (socketRef.current) {
          socketRef.current.auth = { token: session.access_token };
          socketRef.current.connect();
        }
      } else if (event === 'SIGNED_OUT') {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setSocket(null);
          setIsConnected(false);
        }
      }
    });

    authSubscriptionRef.current = subscription;

    return () => {
      if (authSubscriptionRef.current) {
        authSubscriptionRef.current.unsubscribe();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Join chat room
  const joinChat = useCallback((otherUserId) => {
    if (socket) {
      socket.emit('join_chat', otherUserId);
    }
  }, [socket]);

  // Send message
  const sendMessage = useCallback((data) => {
    if (socket) {
      socket.emit('send_message', data);
    }
  }, [socket]);

  // Typing indicator
  const sendTypingStatus = useCallback((receiverId, isTyping) => {
    if (socket) {
      socket.emit('typing', { receiverId, isTyping });
    }
  }, [socket]);

  // Mark message as read
  const markMessageRead = useCallback((messageId, senderId) => {
    if (socket) {
      socket.emit('mark_read', { messageId, senderId });
    }
  }, [socket]);

  // Add reaction
  const addReaction = useCallback((messageId, emoji) => {
    if (socket) {
      socket.emit('add_reaction', { messageId, emoji });
    }
  }, [socket]);

  // Remove reaction
  const removeReaction = useCallback((messageId) => {
    if (socket) {
      socket.emit('remove_reaction', { messageId });
    }
  }, [socket]);

  // Delete message
  const deleteMessage = useCallback((messageId) => {
    if (socket) {
      socket.emit('delete_message', { messageId });
    }
  }, [socket]);

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  const contextData = {
    socket,
    isConnected,
    connected: isConnected,
    onlineUsers,
    joinChat,
    sendMessage,
    sendTypingStatus,
    markMessageRead,
    addReaction,
    removeReaction,
    deleteMessage,
    isUserOnline
  };

  return (
    <SocketContext.Provider value={contextData}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export default SocketContext;