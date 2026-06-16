import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, MessageCircle, Camera, Mail, Clock, MapPin, 
  Music, Gift, LayoutDashboard, User, LogOut, Plus, X, Play, Pause 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
const MusicRoom = () => {
  const location = useLocation();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newSong, setNewSong] = useState({ title: '', artist: '', youtubeUrl: '' });

  // Safe Fallback Context Identifiers
  const { user, logout } = { user: { name: 'Love', username: 'universe' }, logout: () => {} };

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      // In production, fetch from API:
      // const response = await axios.get('/api/songs');
      // setSongs(response.data.data || []);
      
      // Fallback design placeholder items matching layout demands
      setSongs([
        {
          _id: '1',
          title: 'Perfect',
          artist: 'Ed Sheeran',
          thumbnail: 'https://img.youtube.com/vi/2Vv-BfVoq4g/maxresdefault.jpg',
        },
        {
          _id: '2',
          title: 'All of Me',
          artist: 'John Legend',
          thumbnail: 'https://img.youtube.com/vi/450p7goxZqg/maxresdefault.jpg',
        },
        {
          _id: '3',
          title: 'Thinking Out Loud',
          artist: 'Ed Sheeran',
          thumbnail: 'https://img.youtube.com/vi/lp-EO5I60KA/maxresdefault.jpg',
        },
      ]);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const playSong = (song) => {
    if (currentSong?._id === song._id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const addSong = async (e) => {
    e.preventDefault();
    if (!newSong.title.trim() || !newSong.artist.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      // In production, save to API:
      // const response = await axios.post('/api/songs', newSong);
      
      const song = {
        _id: Date.now().toString(),
        title: newSong.title.trim(),
        artist: newSong.artist.trim(),
        youtubeUrl: newSong.youtubeUrl.trim(),
        thumbnail: newSong.youtubeUrl
          ? `https://img.youtube.com/vi/${newSong.youtubeUrl.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`
          : null,
      };
      setSongs([...songs, song]);
      setNewSong({ title: '', artist: '', youtubeUrl: '' });
      setShowAdd(false);
      toast.success('Song added to our room! 🎵💕');
    } catch (error) {
      console.error('Error adding song:', error);
      toast.error('Failed to add song');
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

      {/* ================= MUSIC ROOM AREA PATH STREAM MODULE (FULL WIDTH) ================= */}
      <main className="fade-in" style={{ flex: 1, width: '0', height: '100vh', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {/* Component Title Header Block */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px', flexShrink: 0, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="heartbeat" style={{ padding: '8px', background: 'rgba(250, 204, 21, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid rgba(250, 204, 21, 0.2)' }}>
              <Music className="w-5 h-5" style={{ color: '#facc15' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>Music Room</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300', margin: 0 }}>Songs that remind us of each other 🎵</p>
            </div>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary"
            style={{ height: '46px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', margin: 0 }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Song</span>
          </button>
        </div>

        {/* Dynamic Display Target Songs Grid */}
        {songs.length === 0 ? (
          <div className="glass" style={{ width: '100%', padding: '56px 24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Music style={{ width: '56px', height: '56px', color: 'var(--text-secondary)', opacity: 0.25 }} />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>Your music room is empty</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '300', marginTop: '4px' }}>Click the addition button above to link special media elements.</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', width: '100%', paddingBottom: currentSong ? '120px' : '32px' }}>
            {songs.map((song) => {
              const isCurrentPlaying = currentSong?._id === song._id && isPlaying;
              return (
                <div
                  key={song._id}
                  onClick={() => playSong(song)}
                  className="glass card-hover"
                  style={{
                    borderRadius: '20px',
                    border: isCurrentPlaying ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                    backgroundColor: isCurrentPlaying ? 'rgba(250, 204, 21, 0.03)' : 'rgba(255,255,255,0.01)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: isCurrentPlaying ? '0 0 20px rgba(250, 204, 21, 0.05)' : 'none'
                  }}
                >
                  {/* Thumbnail Cover Box Area */}
                  <div style={{ width: '100%', aspectRatio: '1/1', position: 'relative', backgroundColor: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                    {song.thumbnail ? (
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1))' }}>
                        <Music style={{ width: '40px', height: '40px', color: 'rgba(236,72,153,0.3)' }} />
                      </div>
                    )}
                    
                    {/* Visual Hover State Control Action overlay */}
                    <div className="overlay-trigger" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isCurrentPlaying ? 1 : 0, transition: 'opacity 0.2s ease' }}>
                      {isCurrentPlaying ? (
                        <Pause style={{ width: '44px', height: '44px', color: '#ffffff' }} fill="currentColor" />
                      ) : (
                        <Play style={{ width: '44px', height: '44px', color: '#ffffff', paddingLeft: '4px' }} fill="currentColor" />
                      )}
                    </div>
                  </div>

                  {/* Metadata Text Section */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {song.title}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {song.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= FIXED HUD NOW PLAYING MEDIA PANEL BAR ================= */}
        {currentSong && (
          <div className="glass" style={{ position: 'fixed', bottom: '24px', left: '328px', right: '48px', height: '80px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', zIndex: 30, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
              {currentSong.thumbnail ? (
                <img 
                  src={currentSong.thumbnail} 
                  alt={currentSong.title} 
                  style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ec4899, #818cf8)' }}>
                  <Music style={{ width: '20px', height: '20px', color: '#ffffff' }} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentSong.title}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                  {currentSong.artist}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => playSong(currentSong)}
                className="card-hover"
                style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" style={{ paddingLeft: '2px' }} />}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ================= LAYERED ADD SONG ELEMENT MODAL CONTAINER ================= */}
      {showAdd && (
        <div
          className="fade-in"
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setShowAdd(false)}
        >
          <div
            className="glass"
            style={{ width: '100%', maxWidth: '460px', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', background: '#111827', display: 'flex', flexDirection: 'column', gap: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em', margin: 0 }}>Add a Track</h2>
              <button
                onClick={() => setShowAdd(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addSong} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>Song Title *</label>
                <input
                  type="text"
                  value={newSong.title}
                  onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                  placeholder="What's the song called?"
                  className="input-field"
                  style={{ height: '46px', margin: 0 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>Artist *</label>
                <input
                  type="text"
                  value={newSong.artist}
                  onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                  placeholder="Who sings it?"
                  className="input-field"
                  style={{ height: '46px', margin: 0 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff' }}>YouTube URL (optional)</label>
                <input
                  type="url"
                  value={newSong.youtubeUrl}
                  onChange={(e) => setNewSong({ ...newSong, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="input-field"
                  style={{ height: '46px', margin: 0 }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '700', marginTop: '8px', cursor: 'pointer' }}
              >
                <Music className="w-4 h-4" />
                <span>Add Track to Room</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicRoom;