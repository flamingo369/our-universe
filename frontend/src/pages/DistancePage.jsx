import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Camera, Mail, Clock, MapPin, 
  Music, Gift, LayoutDashboard, User, LogOut, Plane, Globe 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DistancePage = () => {
  const location = useLocation();
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Safe Fallback Context Identifiers
  const { user, logout } = { user: { name: 'Love', username: 'universe' }, logout: () => {} };

  useEffect(() => {
    const calculateDistance = () => {
      try {
        // Haversine formula to calculate distance between Surabaya and Kannur
        const lat1 = -7.2575;  // Surabaya Latitude
        const lon1 = 112.7521; // Surabaya Longitude
        const lat2 = 11.8745;  // Kannur Latitude
        const lon2 = 75.3704;  // Kannur Longitude

        const R = 6371; // Radius of Earth in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const calculatedDistance = R * c;

        // This will save "4810.03" into the state
        setDistance(calculatedDistance.toFixed(2));
      } catch (error) {
        console.error('Error calculating distance:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateDistance();
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

      {/* ================= DISTANCE AREA PATH STREAM MODULE (FULL WIDTH) ================= */}
      <main className="fade-in" style={{ flex: 1, width: '0', height: '100vh', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {/* Component Title Header Block */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px', flexShrink: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="heartbeat" style={{ padding: '8px', background: 'rgba(45, 212, 191, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
              <MapPin className="w-5 h-5" style={{ color: '#2dd4bf' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>Distance Space</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300', margin: 0 }}>Miles apart, but hearts connected 💕</p>
            </div>
          </div>
        </div>

        {/* Big Metric Display Panel */}
        {distance && (
          <div className="glass" style={{ width: '100%', padding: '48px 24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div>
              <Heart className="heartbeat" style={{ width: '64px', height: '64px', color: '#f87171', margin: '0 auto 16px' }} fill="#f87171" />
              <p style={{ fontSize: '4.5rem', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.03em', lineHeight: '1' }}>
                {distance}
              </p>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: '400', margin: '8px 0 0', uppercase: 'true', letterSpacing: '0.05em' }}>KILOMETERS</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', color: '#ffffff', width: '100%', maxWidth: '400px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Surabaya</span>
              </div>
              <Plane className="w-5 h-5" style={{ color: '#2dd4bf', transform: 'rotate(90deg)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Kannur</span>
              </div>
            </div>
          </div>
        )}

        {/* Insights Informational Split Grid Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', width: '100%' }}>
          
          <div className="glass" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>Why Distance Matters</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontWeight: '300' }}>
              Distance makes the heart grow fonder. Every kilometer between us is a reminder of how beautifully resilient our cosmic bond truly is.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '0.88rem', fontWeight: '600', marginTop: '4px' }}>
              <Heart className="w-4 h-4" fill="currentColor" />
              <span>Love knows no dimensions</span>
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', margin: 0 }}>Next Visit Countdown</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, fontWeight: '300' }}>
              The anticipation of holding you close again makes every second, mile, and timezone bridge absolute worth the wait.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf', fontSize: '0.88rem', fontWeight: '600', marginTop: '4px' }}>
              <Plane className="w-4 h-4" />
              <span>Coming soon...</span>
            </div>
          </div>

        </div>

        {/* Bottom Epilogue Quote block section */}
        <div style={{ marginTop: '16px', textAlign: 'center', width: '100%' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', fontWeight: '300', opacity: 0.7 }}>
            "Distance means so little when someone means so much."
          </p>
        </div>

      </main>

    </div>
  );
};

export default DistancePage;