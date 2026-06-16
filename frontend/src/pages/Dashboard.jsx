import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Camera, Mail, Clock, MapPin, 
  Music, Gift, Sparkles, ArrowRight, LayoutDashboard, User, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    messages: 0,
    photos: 0,
    letters: 0,
    memories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats({
          messages: 8,
          photos: 2,
          letters: 2,
          memories: 3,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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

      {/* ================= MAIN SCROLL CONTENT DISPLAY CONTAINER ================= */}
      <main style={{ flexGrow: 1, height: '100vh', overflowY: 'auto', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '48px' }}>
        
        {/* Welcome Section Banner Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
            Welcome back, {user?.name || 'Love'}! 
            <Sparkles className="float" style={{ width: '32px', height: '32px', color: '#facc15', marginLeft: '14px' }} />
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: '300' }}>
            Here's what's happening in your universe today
          </p>
        </div>

        {/* Stats Section row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>Universe Metrics</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            
            <div className="glass card-hover" style={{ flex: '1 1 200px', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <MessageCircle className="w-7 h-7 mb-4" style={{ color: '#60a5fa' }} />
              <p style={{ fontSize: '2.25rem', fontWeight: '900', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{stats.messages}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '300', marginTop: '2px' }}>Messages Shared</p>
            </div>

            <div className="glass card-hover" style={{ flex: '1 1 200px', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Camera className="w-7 h-7 mb-4" style={{ color: '#c084fc' }} />
              <p style={{ fontSize: '2.25rem', fontWeight: '900', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{stats.photos}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '300', marginTop: '2px' }}>Gallery Photos</p>
            </div>

            <div className="glass card-hover" style={{ flex: '1 1 200px', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Mail className="w-7 h-7 mb-4" style={{ color: 'var(--primary-pink)' }} />
              <p style={{ fontSize: '2.25rem', fontWeight: '900', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{stats.letters}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '300', marginTop: '2px' }}>Heartfelt Letters</p>
            </div>

            <div className="glass card-hover" style={{ flex: '1 1 200px', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Heart className="w-7 h-7 mb-4" style={{ color: '#f87171' }} fill="currentColor" />
              <p style={{ fontSize: '2.25rem', fontWeight: '900', color: '#ffffff', fontVariantNumeric: 'tabular-nums' }}>{stats.memories}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '300', marginTop: '2px' }}>Logged Memories</p>
            </div>

          </div>
        </div>

        {/* Quick Actions Control Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', width: '100%' }}>
            {navigationItems.slice(1).map((action) => {
              const matchedMeta = navigationItems.find(n => n.path === action.path);
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  className="glass card-hover"
                  style={{ 
                    textDecoration: 'none',
                    padding: '24px', 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <action.icon style={{ width: '20px', height: '20px', color: matchedMeta?.iconColor || '#ffffff' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>
                      {action.title}
                    </h3>
                    <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--text-secondary)' }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity Feed Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>Recent Timeline Stream</h2>
          <div className="glass" style={{ borderRadius: '24px', padding: '56px 24px', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '300' }}>
              No immediate changes. Open up communication rooms above to log real-time entries!
            </p>
          </div>
        </div>

      </main>

    </div>
  );
};

export default Dashboard;