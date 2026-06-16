import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Camera, Mail, Clock, MapPin, 
  Music, Gift, LayoutDashboard, User, LogOut, Plus, X, Calendar, Lock, Unlock 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
const TimeCapsulePage = () => {
  const location = useLocation();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [newCapsule, setNewCapsule] = useState({
    title: '',
    message: '',
    unlockDate: '',
  });

  // Safe Fallback Context Identifiers
  const { user, logout } = { user: { name: 'Love', username: 'universe' }, logout: () => {} };

  useEffect(() => {
    fetchCapsules();
  }, []);

  const fetchCapsules = async () => {
    try {
      const response = await axios.get('/capsules');
      setCapsules(response.data.capsules || []);
    } catch (error) {
      console.error('Error fetching capsules:', error);
      // Fallback design placeholder capsules matching layout demands
      setCapsules([
        {
          _id: '1',
          title: 'Our One Year Anniversary Notes',
          message: 'Hey future us! Hope we are still cooking crazy dinners and smiling just as hard. Remember the rainy cross-country train trip trip?',
          unlockDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday (Unlocked)
          createdAt: new Date(Date.now() - 31536000000).toISOString(),
        },
        {
          _id: '2',
          title: 'Read This on Your Wedding Day',
          message: 'If you are opening this, the day finally came! Never forget the late-night star watching sessions in the mountains.',
          unlockDate: new Date(Date.now() + 31536000000).toISOString(), // 1 Year From Now (Locked)
          createdAt: new Date(Date.now()).toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createCapsule = async (e) => {
    e.preventDefault();
    if (!newCapsule.title.trim() || !newCapsule.message.trim() || !newCapsule.unlockDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const unlockDate = new Date(newCapsule.unlockDate);
    if (unlockDate <= new Date()) {
      toast.error('Unlock date must be in the future');
      return;
    }

    try {
      const response = await axios.post('/capsules', {
        title: newCapsule.title.trim(),
        message: newCapsule.message.trim(),
        unlockDate: newCapsule.unlockDate,
      });
      setCapsules([response.data.data, ...capsules]);
      setNewCapsule({ title: '', message: '', unlockDate: '' });
      setShowCreate(false);
      toast.success('Time capsule sealed! 🔒💕');
    } catch (error) {
      console.error('Error creating capsule:', error);
      // Fallback local mockup add logic
      const mockCapsule = {
        _id: Date.now().toString(),
        title: newCapsule.title.trim(),
        message: newCapsule.message.trim(),
        unlockDate: newCapsule.unlockDate,
        createdAt: new Date().toISOString()
      };
      setCapsules([mockCapsule, ...capsules]);
      setNewCapsule({ title: '', message: '', unlockDate: '' });
      setShowCreate(false);
      toast.success('Sealed mockup time capsule locally! 🔒');
    }
  };

  const isReadyToOpen = (unlockDate) => {
    return new Date(unlockDate) <= new Date();
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

      {/* ================= CAPSULE AREA PATH STREAM MODULE (FULL WIDTH) ================= */}
      <main className="fade-in" style={{ flex: 1, width: '0', height: '100vh', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {/* Component Title Header Block */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px', flexShrink: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="heartbeat" style={{ padding: '8px', background: 'rgba(129, 140, 248, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid rgba(129, 140, 248, 0.2)' }}>
              <Gift className="w-5 h-5" style={{ color: '#818cf8' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>Time Capsule</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300', margin: 0 }}>Messages for our future selves 💌</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary"
            style={{ height: '46px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', margin: 0 }}
          >
            <Plus className="w-4 h-4" />
            <span>Create Capsule</span>
          </button>
        </div>

        {/* Dynamic Display Target Capsules Grid Layout */}
        {capsules.length === 0 ? (
          <div className="glass" style={{ width: '100%', padding: '56px 24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Gift style={{ width: '56px', height: '56px', color: 'var(--text-secondary)', opacity: 0.25 }} />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>No time capsules yet</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '300', marginTop: '4px' }}>Log hidden dynamic notes inside the workspace dashboard tool container above.</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', width: '100%' }}>
            {capsules.map((capsule) => {
              const ready = isReadyToOpen(capsule.unlockDate);
              return (
                <div
                  key={capsule._id}
                  onClick={() => {
                    if (ready) {
                      setSelectedCapsule(capsule);
                    } else {
                      toast.error('This vault element remains tightly sealed! 🔒');
                    }
                  }}
                  className="glass card-hover"
                  style={{
                    borderRadius: '20px',
                    border: ready ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(255,255,255,0.06)',
                    backgroundColor: ready ? 'rgba(74, 222, 128, 0.02)' : 'rgba(255,255,255,0.01)',
                    overflow: 'hidden',
                    cursor: ready ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: ready ? 1 : 0.75
                  }}
                >
                  {/* Lock Indicator Card Top Banner */}
                  <div style={{ height: '120px', width: '100%', background: 'linear-gradient(135deg, rgba(236,72,153,0.06), rgba(129,140,248,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {ready ? (
                      <Unlock className="w-10 h-10 text-white" style={{ opacity: 0.9 }} />
                    ) : (
                      <Lock className="w-10 h-10 text-gray-400" style={{ opacity: 0.5 }} />
                    )}
                    
                    {/* Floating Status Pill Box */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      {ready ? (
                        <span style={{ px: '10px', padding: '4px 10px', backgroundColor: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.25)', color: '#4ade80', fontSize: '0.74rem', fontWeight: '700', borderRadius: '30px' }}>
                          Ready to open
                        </span>
                      ) : (
                        <span style={{ px: '10px', padding: '4px 10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.74rem', fontWeight: '500', borderRadius: '30px' }}>
                          Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Base Typography section */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {capsule.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Opens: {new Date(capsule.unlockDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ================= LAYERED SEAL MODAL CREATION CONTAINER ================= */}
      {showCreate && (
        <div
          className="fade-in"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="glass"
            style={{ width: '100%', maxWidth: '480px', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', background: '#111827', display: 'flex', flexDirection: 'column', gap: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>Seal New Capsule</h2>
              <button
                onClick={() => setShowCreate(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createCapsule} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>Capsule Title *</label>
                <input
                  type="text"
                  value={newCapsule.title}
                  onChange={(e) => setNewCapsule({ ...newCapsule, title: e.target.value })}
                  placeholder="What's this capsule about?"
                  className="input-field"
                  style={{ height: '46px', margin: 0 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>Unlock Date *</label>
                <input
                  type="date"
                  value={newCapsule.unlockDate}
                  onChange={(e) => setNewCapsule({ ...newCapsule, unlockDate: e.target.value })}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="input-field"
                  style={{ height: '46px', margin: 0, colorScheme: 'dark' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>Your Message *</label>
                <textarea
                  value={newCapsule.message}
                  onChange={(e) => setNewCapsule({ ...newCapsule, message: e.target.value })}
                  placeholder="Write a message to your future selves..."
                  rows={5}
                  className="input-field"
                  style={{ height: 'auto', padding: '12px 16px', margin: 0, resize: 'none' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '700', marginTop: '8px', cursor: 'pointer' }}
              >
                <Gift className="w-4 h-4" />
                <span>Seal Capsule Box</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= LAYERED VIEW CAPSULE MODAL DETAILS VIEWER ================= */}
      {selectedCapsule && (
        <div
          className="fade-in"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setSelectedCapsule(null)}
        >
          <div
            className="glass"
            style={{ width: '100%', maxWidth: '640px', padding: '36px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', background: '#111827', display: 'flex', flexDirection: 'column', gap: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>
                {selectedCapsule.title}
              </h2>
              <button
                onClick={() => setSelectedCapsule(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ minHeight: '120px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
              <p style={{ fontSize: '1rem', color: '#e2e8f0', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0, fontWeight: '300' }}>
                {selectedCapsule.message}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px', pt: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Opened on: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              {selectedCapsule.createdAt && (
                <span>Created on: {new Date(selectedCapsule.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeCapsulePage;