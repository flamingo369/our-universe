import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Camera, Mail, Clock, MapPin, 
  Music, Gift, LayoutDashboard, User, LogOut, Plus, CheckCircle2, Circle, Trash2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';

const BucketListPage = () => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  // Safe Fallback Context Identifiers
  const { user, logout } = { user: { name: 'Love', username: 'universe' }, logout: () => {} };

  useEffect(() => {
    fetchBucketList();
  }, []);

  const fetchBucketList = async () => {
    try {
      const response = await axios.get('/bucket-list');
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching bucket list:', error);
      // Fallback design placeholder items
      setItems([
        { _id: '1', title: 'Watch a starry sky in the mountains', completed: false },
        { _id: '2', title: 'Cook a 3-course dinner together over video call', completed: true, completedAt: new Date().toISOString() },
        { _id: '3', title: 'Plan our next cross-country train trip trip', completed: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      const response = await axios.post('/bucket-list', {
        title: newItem.trim(),
      });
      setItems([...items, response.data.item]);
      setNewItem('');
      toast.success('Added to your bucket list! 💕');
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`/bucket-list/${id}`, {
        completed: !currentStatus,
      });
      setItems(
        items.map((item) =>
          item.id === id || item._id === id ? response.data.item : item
        )
      );
      toast.success(
        currentStatus ? 'Removed from completed 💫' : 'Completed! 🎉'
      );
    } catch (error) {
      console.error('Error toggling item:', error);
      // Mock toggle fallback logic for broken development servers
      setItems(
        items.map((item) =>
          item._id === id ? { ...item, completed: !currentStatus, completedAt: !currentStatus ? new Date().toISOString() : null } : item
        )
      );
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`/bucket-list/${id}`);
      setItems(items.filter((item) => item._id !== id));
      toast.success('Removed from bucket list');
    } catch (error) {
      console.error('Error deleting item:', error);
      setItems(items.filter((item) => item._id !== id));
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

      {/* ================= BUCKET LIST AREA PATH STREAM MODULE ================= */}
      <main className="fade-in" style={{ flex: 1, width: '0', height: '100vh', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {/* Component Title Header Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px', flexShrink: 0, width: '100%' }}>
          <div className="heartbeat" style={{ padding: '8px', background: 'rgba(248, 113, 113, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
            <Heart className="w-5 h-5" style={{ color: '#f87171' }} fill="currentColor" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>Our Bucket List</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300' }}>Dreams we will chase together 💕</p>
          </div>
        </div>

        {/* Input Addition Submission Area */}
        <form onSubmit={addItem} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', flexShrink: 0 }}>
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add something you want to achieve together..."
            className="input-field"
            style={{ height: '50px', margin: 0, flexGrow: 1 }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ height: '50px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', shadow: 'none', fontSize: '0.95rem' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Dynamic Display Target Tasks List */}
        {items.length === 0 ? (
          <div className="glass" style={{ width: '100%', padding: '56px 24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Heart style={{ width: '56px', height: '56px', color: 'var(--text-secondary)', opacity: 0.25 }} />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>Your bucket list is empty</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '300', marginTop: '4px' }}>Log collaborative targets within the container line form above.</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            {items.map((item) => (
              <div
                key={item._id}
                className="glass"
                style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  border: item.completed ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(255,255,255,0.06)',
                  backgroundColor: item.completed ? 'rgba(74, 222, 128, 0.03)' : 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
                  <button
                    onClick={() => toggleComplete(item._id, item.completed)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5" style={{ color: '#4ade80' }} />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500 hover:text-pink-500 transition-colors" />
                    )}
                  </button>

                  <span
                    style={{
                      flexGrow: 1,
                      fontSize: '1rem',
                      fontWeight: '400',
                      color: item.completed ? 'var(--text-secondary)' : '#ffffff',
                      textDecoration: item.completed ? 'line-through' : 'none',
                      wordBreak: 'break-word'
                    }}
                  >
                    {item.title}
                  </span>

                  <button
                    onClick={() => deleteItem(item._id)}
                    title="Remove bucket target element"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#64748b', borderRadius: '8px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {item.completed && item.completedAt && (
                  <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: '500', paddingLeft: '36px', fontVariantNumeric: 'tabular-nums' }}>
                    Completed on {new Date(item.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Counter Metric Row summary section */}
        {items.length > 0 && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '300', trackingWidth: '0.02em', width: '100%', paddingLeft: '8px' }}>
            {items.filter((i) => i.completed).length} of {items.length} milestone objectives completed
          </div>
        )}

      </main>

    </div>
  );
}; 

export default BucketListPage;