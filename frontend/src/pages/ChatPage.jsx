import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Camera, Mail, Clock, MapPin, 
  Music, Gift, Sparkles, ArrowRight, LayoutDashboard, User, LogOut, Send, Smile, Image, Circle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const { socket, connected, joinChat } = useSocket();
  const location = useLocation();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Find partner and load messages
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id) return;

      try {
        // Find the partner (other user in profiles)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, username')
          .neq('id', user.id)
          .limit(1);

        if (profilesError) {
          console.error('Error finding partner:', profilesError);
          setLoading(false);
          return;
        }

        if (profiles && profiles.length > 0) {
          const partner = profiles[0];
          setReceiverId(partner.id);

          // Load messages from database
          const roomName = [user.id, partner.id].sort().join('_');
          const { data: loadedMessages, error: messagesError } = await supabase
            .from('messages')
            .select('*')
            .eq('room', roomName)
            .order('created_at', { ascending: true })
            .limit(50);

          if (messagesError) {
            console.error('Error loading messages:', messagesError);
          } else if (loadedMessages) {
            // Transform messages to match frontend format
            // Get sender names from profiles if available
            const senderIds = [...new Set(loadedMessages.map(m => m.sender_id))];
            const { data: senderProfiles } = await supabase
              .from('profiles')
              .select('id, name, username')
              .in('id', senderIds);
            
            const profileMap = {};
            if (senderProfiles) {
              senderProfiles.forEach(p => {
                profileMap[p.id] = p.name || p.username || 'User';
              });
            }
            
            const transformedMessages = loadedMessages.map(msg => ({
              id: msg.id,
              senderId: msg.sender_id,
              senderName: profileMap[msg.sender_id] || 'User',
              receiverId: msg.receiver_id,
              content: msg.content,
              type: msg.type,
              timestamp: msg.created_at,
              room: msg.room
            }));
            setMessages(transformedMessages);
          }

          // Join the chat room
          if (socket) {
            joinChat(partner.id);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setLoading(false);
      }
    };

    initializeChat();
  }, [user?.id, socket]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      // Only add message if it's not already in the list (check by content, sender, and timestamp)
      setMessages((prev) => {
        const exists = prev.some(m => 
          m.content === message.content && 
          m.senderId === message.senderId && 
          Math.abs(new Date(m.timestamp).getTime() - new Date(message.timestamp).getTime()) < 1000
        );
        if (exists) return prev;
        return [...prev, message];
      });
    };

    socket.on('receiveMessage', handleMessage);
    socket.on('receive_message', handleMessage);

    return () => {
      socket.off('receiveMessage', handleMessage);
      socket.off('receive_message', handleMessage);
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !receiverId) {
      if (!receiverId) {
        toast.error('No chat partner found');
      }
      return;
    }

    const message = {
      receiverId: receiverId,
      senderId: user?.id,
      senderName: user?.name,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    socket.emit('sendMessage', message);
    
    // Don't add to local state - wait for the socket broadcast to avoid duplicates
    // The message will be added when we receive it back from the server
    
    setNewMessage('');
  };

  const navigationItems = [
    { icon: LayoutDashboard, title: 'Dashboard', path: '/dashboard', iconColor: '#ec4899' },
    { icon: MessageCircle, title: 'Private Chat', path: '/chat', iconColor: '#60a5fa' },
    { icon: Camera, title: 'Photo Gallery', path: '/gallery', iconColor: '#c084fc' },
    { icon: Mail, title: 'Love Letters', path: '/letters', iconColor: '#f472b6' },
    { icon: Clock, title: 'Timeline', path: '/timeline', iconColor: '#4ade80' },
    { icon: Heart, title: 'Bucket List', path: '/bucket-list', iconColor: '#f87171' },
    { icon: Music, title: 'Music Room', path: '/music', iconColor: '#facc15' },
    { icon: Gift, title: 'Time Capsule', path: '/time-capsule', iconColor: '#818cf8' },
    { icon: MapPin, title: 'Distance Space', path: '/distance', iconColor: '#2dd4bf' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'transparent', overflow: 'hidden' }}>
      
      {/* ================= SIDEBAR NAVIGATION PANEL ================= */}
      <aside className="glass" style={{ width: '280px', minWidth: '280px', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 40, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)' }}>
        
        {/* Sidebar Brand Header */}
        <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="heartbeat" style={{ padding: '8px', background: 'rgba(236, 72, 153, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
            <Heart className="w-5 h-5" style={{ color: 'var(--primary-pink)' }} fill="currentColor" />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em' }}>Our Universe</span>
        </div>

        {/* Dynamic Navigation Links Block */}
        <nav style={{ flexGrow: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: isActive ? 'rgba(236, 72, 153, 0.1)' : 'transparent',
                  border: isActive ? '1px solid rgba(236, 72, 153, 0.2)' : '1px solid transparent'
                }}
              >
                <item.icon style={{ width: '20px', height: '20px', color: isActive ? 'var(--primary-pink)' : item.iconColor }} />
                <span style={{ fontSize: '0.95rem', fontWeight: isActive ? '700' : '400', color: isActive ? '#ffffff' : 'var(--text-secondary)' }}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Workspace Profile Footer Status */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Connected User'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                @{user?.username || 'universe'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="card-hover"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 16px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer' }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ================= CHAT COMPONENT VIEW MAIN CONTAINER ================= */}
      <main className="fade-in" style={{ flexGrow: 1, height: '100vh', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 10 }}>
        
        {/* Header Info Banner Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="heartbeat" style={{ padding: '8px', background: 'rgba(96, 165, 250, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
              <MessageCircle className="w-5 h-5" style={{ color: '#60a5fa' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>Private Chat</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300' }}>Your shared, encrypted connection line</p>
            </div>
          </div>

          {/* Real-time Web Socket Status Indicator pill */}
          <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Circle style={{ width: '8px', height: '8px', fill: connected ? '#4ade80' : '#f87171', color: 'transparent' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.05em', color: connected ? '#4ade80' : '#f87171', textTransform: 'uppercase' }}>
              {connected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Main Live Messages Display Container */}
        <div className="glass chat-scroll" style={{ flexGrow: 1, overflowY: 'auto', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '32px 24px', background: 'rgba(15, 23, 42, 0.2)', boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.2)' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div className="float" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '48px', height: '48px', border: '3px solid rgba(236, 72, 153, 0.3)', borderTopColor: '#ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
                <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: '300' }}>Loading your cosmic messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div className="float" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Heart style={{ width: '48px', height: '48px', color: 'var(--text-secondary)', opacity: 0.3 }} />
                </div>
                <div>
                  <p style={{ fontSize: '1.15rem', fontWeight: '700', color: '#ffffff' }}>No messages logged yet</p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '300', marginTop: '4px' }}>Start typing below to populate your cosmic stream! 💕</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {messages.map((msg, index) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id || index}
                    className="message-slide-in"
                    style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', width: '100%' }}
                  >
                    <div
                      className="glass"
                      style={{
                        maxWidth: '65%',
                        padding: '16px 20px',
                        borderRadius: isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        background: isOwn ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' : 'rgba(255, 255, 255, 0.04)',
                        border: isOwn ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: isOwn ? '0 8px 24px rgba(236, 72, 153, 0.2)' : '0 4px 15px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      {!isOwn && (
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.05em', color: 'var(--primary-pink)', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {msg.senderName}
                        </span>
                      )}
                      <p style={{ fontSize: '0.98rem', color: '#ffffff', lineHeight: '1.5', margin: 0, fontWeight: '300', wordBreak: 'break-word' }}>
                        {msg.content}
                      </p>
                      <span style={{ fontSize: '0.7rem', color: isOwn ? 'rgba(255, 255, 255, 0.6)' : 'var(--text-secondary)', alignSelf: 'flex-end', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Composition Input Form Core Layout */}
        <form onSubmit={sendMessage} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', flexShrink: 0 }}>
          <button
            type="button"
            className="card-hover"
            title="Upload attachments"
            style={{ width: '52px', height: '52px', minWidth: '52px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Image className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>

          <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a cosmic text line..."
              className="input-field"
              style={{ paddingRight: '52px', height: '52px', margin: 0 }}
            />
            <button
              type="button"
              title="Insert emoji picker"
              style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <Smile className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ height: '52px', padding: '0 24px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.2)' }}
          >
            <Send className="w-4 h-4" />
            <span style={{ fontSize: '0.95rem', fontWeight: '700' }}>Send</span>
          </button>
        </form>

      </main>

    </div>
  );
};

export default ChatPage;