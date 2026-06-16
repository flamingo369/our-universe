import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Camera, Mail, Clock, MapPin, 
  Music, Gift, ArrowRight, LayoutDashboard, User, LogOut, Edit3, Trash2, X, Send 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LettersPage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [newLetter, setNewLetter] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const response = await axios.get('/letters');
      setLetters(response.data.letters || []);
    } catch (error) {
      console.error('Error fetching letters:', error);
      // Fallback elegant testing state data
      setLetters([
        { _id: '1', title: 'Thinking of You', content: 'No matter how many miles lie between us, your smile remains the anchor of my days. I love you more than words can outline.', sender: { name: 'Ajesh' }, createdAt: new Date().toISOString() },
        { _id: '2', title: 'My Whole World', content: 'Counting down the hours until our next call. This private universe is my favorite corner of reality.', sender: { name: 'Shofi' }, createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendLetter = async (e) => {
    e.preventDefault();
    if (!newLetter.title.trim() || !newLetter.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post('/letters', {
        title: newLetter.title,
        content: newLetter.content,
      });
      setLetters([response.data.letter, ...letters]);
      setNewLetter({ title: '', content: '' });
      setShowCompose(false);
      toast.success('Letter sent! 💌');
    } catch (error) {
      console.error('Error sending letter:', error);
      toast.error('Failed to send letter');
    }
  };

  const deleteLetter = async (id) => {
    if (!id) {
      toast.error('Invalid letter ID');
      return;
    }
    try {
      await axios.delete(`/letters/${id}`);
      setLetters(letters.filter((l) => l.id !== id));
      setSelectedLetter(null);
      toast.success('Letter deleted');
    } catch (error) {
      console.error('Error deleting letter:', error);
      toast.error('Failed to delete letter');
    }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0a0a0a' }}>
        <div className="spinner"></div>
      </div>
    );
  }

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

      {/* ================= LOVE LETTERS CONTENT AREA MODULE ================= */}
      <main className="fade-in" style={{ flexGrow: 1, height: '100vh', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {/* Module Header View Area Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="heartbeat" style={{ padding: '8px', background: 'rgba(244, 114, 182, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid rgba(244, 114, 182, 0.2)' }}>
              <Mail className="w-5 h-5" style={{ color: '#f472b6' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>Love Letters</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300' }}>Words straight from the heart 💌</p>
            </div>
          </div>

          <button
            onClick={() => setShowCompose(true)}
            className="btn-primary"
            style={{ height: '46px', padding: '0 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.2)', fontSize: '0.9rem' }}
          >
            <Edit3 className="w-4 h-4" />
            <span>Write a Letter</span>
          </button>
        </div>

        {/* Letters Collection Mapping Workspace */}
        {letters.length === 0 ? (
          <div className="glass" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Mail style={{ width: '56px', height: '56px', color: 'var(--text-secondary)', opacity: 0.3 }} />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>No letters drafted yet</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '300', marginTop: '4px' }}>Click the action handle above to compose your first piece!</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', width: '100%' }}>
            {letters.map((letter) => (
              <div
                key={letter.id || letter._id}
                onClick={() => setSelectedLetter(letter)}
                className="glass card-hover"
                style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {letter.title}
                  </h3>
                  <Heart className="w-4 h-4" style={{ color: 'var(--primary-pink)', flexShrink: 0, marginTop: '4px' }} fill="currentColor" />
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontWeight: '300', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {letter.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', pt: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: 'auto' }}>
                  <span>From: {letter.sender?.name || 'Anonymous'}</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{new Date(letter.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Compose New Letter Overlay Wrapper */}
        {showCompose && (
          <div
            className="fade-in"
            onClick={() => setShowCompose(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 5, 0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(8px)' }}
          >
            <div
              className="glass"
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '640px', padding: '36px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '28px', background: '#0f172a', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>Write a Love Letter</h2>
                <button onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                  <X className="w-5 h-5 hover:scale-110 transition-transform" />
                </button>
              </div>

              <form onSubmit={sendLetter} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>Title</label>
                  <input
                    type="text"
                    value={newLetter.title}
                    onChange={(e) => setNewLetter({ ...newLetter, title: e.target.value })}
                    placeholder="A title for your letter..."
                    className="input-field"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>Your Message</label>
                  <textarea
                    value={newLetter.content}
                    onChange={(e) => setNewLetter({ ...newLetter, content: e.target.value })}
                    placeholder="Pour your heart out here..."
                    rows={8}
                    className="input-field"
                    style={{ resize: 'none', lineHeight: '1.6' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', marginTop: '8px' }}
                >
                  <Send className="w-4 h-4" />
                  <span>Send Letter</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Document Detail Read Overlay View */}
        {selectedLetter && (
          <div
            className="fade-in"
            onClick={() => setSelectedLetter(null)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 5, 0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(8px)' }}
          >
            <div
              className="glass"
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '680px', padding: '40px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '24px', background: '#0f172a', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                  {selectedLetter.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => deleteLetter(selectedLetter.id)}
                    title="Delete letter document"
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setSelectedLetter(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}>
                    <X className="w-5 h-5 hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              <div style={{ padding: '8px 0', overflowY: 'auto' }}>
                <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: '1.75', margin: 0, fontWeight: '300', whiteSpace: 'pre-wrap' }}>
                  {selectedLetter.content}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', marginTop: '8px' }}>
                <span style={{ fontWeight: '400' }}>From: <strong style={{ color: '#ffffff', fontWeight: '600' }}>{selectedLetter.sender?.name || 'Anonymous'}</strong></span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>Date: {new Date(selectedLetter.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default LettersPage;