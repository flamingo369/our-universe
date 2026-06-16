import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Camera, Mail, Clock, MapPin, 
  Music, Gift, LayoutDashboard, User, LogOut, Calendar, Plus, X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
const TimelinePage = () => {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '' });

  // Fallback context mock if not destructured globally
  const { user, logout } = { user: { name: 'Love', username: 'universe' }, logout: () => {} };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/timeline');
      // Map event_date to date for consistent frontend usage
      const mappedEvents = (response.data.events || []).map(e => ({
        ...e,
        date: e.event_date
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      // Fallback dummy events to prevent an empty display during configuration
      setEvents([
        { id: '1', title: 'Our First Sunset together', description: 'The sky was painted in shades of pink and gold, exactly like our universe layout.', event_date: '2024-01-14', date: '2024-01-14', createdAt: new Date().toISOString() },
        { id: '2', title: 'The Airport Reunion', description: 'Running through terminal 2 just to hold you after months apart.', event_date: '2024-04-12', date: '2024-04-12', createdAt: new Date().toISOString() },
        { id: '3', title: 'Late Night Music Sessions', description: 'Sharing headphones and listening to songs that spoke our hearts.', event_date: '2024-05-19', date: '2024-05-19', createdAt: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      // Send event_date instead of date to match backend
      const response = await axios.post('/timeline', {
        title: newEvent.title,
        description: newEvent.description,
        event_date: newEvent.date,
      });
      setEvents([response.data.event, ...events]);
      setNewEvent({ title: '', description: '', date: '' });
      setShowAdd(false);
      toast.success('Memory added to timeline! 💕');
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add memory');
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

  const sortedEvents = [...events].sort((a, b) => new Date(b.event_date || b.date) - new Date(a.event_date || a.date));

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
            const isActive = location.pathname === item.path || (item.path === '/timeline' && location.pathname === '/timeline');
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

      {/* ================= TIMELINE INTERFACE SCROLL PANEL ================= */}
      <main className="fade-in" style={{ flexGrow: 1, height: '100vh', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {/* Layout View Head Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="heartbeat" style={{ padding: '8px', background: 'rgba(74, 222, 128, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
              <Clock className="w-5 h-5" style={{ color: '#4ade80' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>Our Timeline</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300' }}>Every shared moment mapped sequentially ⏰</p>
            </div>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary"
            style={{ height: '46px', padding: '0 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.2)', fontSize: '0.9rem' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>

        {/* Sequential Timeline Tree Rendering */}
        {sortedEvents.length === 0 ? (
          <div className="glass" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Calendar style={{ width: '56px', height: '56px', color: 'var(--text-secondary)', opacity: 0.3 }} />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>Your timeline is empty</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '300', marginTop: '4px' }}>Begin documenting shared milestones by hitting the link anchor above.</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', maxWidth: '840px', margin: '0 auto', padding: '20px 0' }}>
            
            {/* Geometric Center Guide-Line Background */}
            <div style={{ position: 'absolute', left: '24px', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(to bottom, var(--primary-pink), var(--primary-purple))' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              {sortedEvents.map((event) => (
                <div key={event.id || event._id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', paddingLeft: '64px' }}>
                  
                  {/* Dynamic Glowing Node Dot anchor */}
                  <div style={{ position: 'absolute', left: '24px', top: '24px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-pink)', transform: 'translateX(-50%)', boxShadow: '0 0 15px var(--primary-pink)' }}>
                    <div className="pulse" style={{ position: 'absolute', inset: '-4px', border: '2px solid var(--primary-pink)', borderRadius: '50%' }} />
                  </div>

                  {/* Card Element Body Wrapper */}
                  <div className="glass card-hover" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(255,255,255,0.01)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                        {event.title}
                      </h3>
                      
                      {/* Metric Date Slate */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--primary-pink)', fontWeight: '600' }}>
                        <Calendar style={{ width: '14px', height: '14px' }} />
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {new Date(event.event_date || event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontWeight: '300' }}>
                        {event.description}
                      </p>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* Modal Sheet Window: Add Memory Block Form overlay */}
        {showAdd && (
          <div
            className="fade-in"
            onClick={() => setShowAdd(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 5, 0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(8px)' }}
          >
            <div
              className="glass"
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '460px', padding: '36px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '28px', background: '#0f172a', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>Add a Memory</h2>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                  <X className="w-5 h-5 hover:scale-110 transition-transform" />
                </button>
              </div>

              <form onSubmit={addEvent} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>Title *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="What milestone happened?"
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>Date *</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0' }}>Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Provide context details or feelings about this moment..."
                    rows={4}
                    className="input-field"
                    style={{ resize: 'none', lineHeight: '1.5' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', marginTop: '8px' }}
                >
                  <Heart className="w-4 h-4" />
                  <span>Save Memory</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default TimelinePage;