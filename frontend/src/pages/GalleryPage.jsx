import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Camera, Mail, Clock, MapPin, 
  Music, Gift, ArrowRight, LayoutDashboard, User, LogOut, Upload, X, 
  Trash2, Edit3, Save, Pencil
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import supabase from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const GalleryPage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Fetch photos from database
  const fetchPhotos = async () => {
    try {
      const response = await api.get('/gallery');
      if (response.data.success && response.data.photos) {
        setPhotos(response.data.photos);
      }
    } catch (error) {
      // Fallback to direct Supabase query if API fails
      console.error('Error fetching photos:', error);
      // Fallback to direct Supabase query
      try {
        const { data, error: supaError } = await supabase
          .from('photos')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (!supaError && data) {
          setPhotos(data);
        }
      } catch (e) {
        console.error('Fallback fetch error:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();

    // Subscribe to real-time changes for photos
    const channel = supabase
      .channel('gallery_photos')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photos' },
        (payload) => {
          console.log('Gallery change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // New photo added - add to list
            setPhotos(prev => {
              const exists = prev.some(p => p.id === payload.new.id);
              if (exists) return prev;
              return [payload.new, ...prev];
            });
            toast.success('New photo uploaded! 📸');
          } else if (payload.eventType === 'UPDATE') {
            // Photo updated - update in list
            setPhotos(prev => prev.map(p => 
              p.id === payload.new.id ? { ...p, ...payload.new } : p
            ));
          } else if (payload.eventType === 'DELETE') {
            // Photo deleted - remove from list
            setPhotos(prev => prev.filter(p => p.id !== payload.old.id));
            if (selectedPhoto?.id === payload.old.id) {
              setSelectedPhoto(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('title', 'Our Memory');
    formData.append('category', 'memories');

    setUploading(true);
    try {
      const response = await api.post('/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.photo) {
        // Photo will be added via real-time subscription
        toast.success('Photo uploaded! 📸');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await api.delete(`/gallery/${photoId}`);
      if (response.data.success) {
        // Photo will be removed via real-time subscription
        toast.success('Photo deleted! 🗑️');
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleEditStart = (photo) => {
    setEditingPhoto(photo.id);
    setEditTitle(photo.title || '');
    setEditDescription(photo.description || '');
  };

  const handleEditSave = async (photoId) => {
    try {
      const response = await api.put(`/gallery/${photoId}`, {
        title: editTitle,
        description: editDescription,
      });
      if (response.data.success) {
        // Photo will be updated via real-time subscription
        toast.success('Photo updated! ✏️');
        setEditingPhoto(null);
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto({ ...selectedPhoto, title: editTitle, description: editDescription });
        }
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update photo');
    }
  };

  const handleEditCancel = () => {
    setEditingPhoto(null);
    setEditTitle('');
    setEditDescription('');
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
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(192, 132, 252, 0.3)', borderTopColor: '#c084fc', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading gallery...</p>
        </div>
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

      {/* ================= GALLERY DISPLAY AREA CONTENT MODULE ================= */}
      <main className="fade-in" style={{ flexGrow: 1, height: '100vh', padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {/* Gallery Interface View Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="heartbeat" style={{ padding: '8px', background: 'rgba(192, 132, 252, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', border: '1px solid rgba(192, 132, 252, 0.2)' }}>
              <Camera className="w-5 h-5" style={{ color: '#c084fc' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.01em' }}>Our Gallery</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '300' }}>Capturing our precious moments 📸</p>
            </div>
          </div>

          {/* Form Native File Upload Input Overlay Component */}
          <label className="card-hover" style={{ cursor: 'pointer' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <div className="btn-primary" style={{ height: '46px', padding: '0 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(192, 132, 252, 0.2)', fontSize: '0.9rem' }}>
              {uploading ? (
                <div style={{ border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#ffffff', borderRadius: '50%', width: '18px', height: '18px', animation: 'spin 0.8s linear infinite' }}></div>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Photo</span>
                </>
              )}
            </div>
          </label>
        </div>

        {/* Gallery Dynamic Images Flow System */}
        {photos.length === 0 ? (
          <div className="glass" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Camera style={{ width: '56px', height: '56px', color: 'var(--text-secondary)', opacity: 0.3 }} />
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>No photos uploaded yet</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '300', marginTop: '4px' }}>Start uploading your favorite visual highlights above!</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="glass card-hover"
                onClick={() => setSelectedPhoto(photo)}
                style={{ 
                  position: 'relative', 
                  aspectRatio: '1 / 1', 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.title || 'Memory'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.06)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1.0)'}
                />
                
                {/* Action buttons overlay */}
                <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px', opacity: 0, transition: 'opacity 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                     onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditStart(photo); }}
                    style={{ padding: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff' }}
                  >
                    <Pencil style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                    style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.8)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff' }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>

                {/* Descriptive hover captions configuration */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '16px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', display: 'flex', alignItems: 'flex-end' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#ffffff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                    {photo.title || 'Untitled memory'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Photo Fullscreen Viewer overlay layout */}
        {selectedPhoto && !editingPhoto && (
          <div
            className="fade-in"
            onClick={() => setSelectedPhoto(null)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 5, 0.95)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(10px)' }}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0, zIndex: 101 }}
            >
              <X className="w-8 h-8 hover:scale-110 transition-transform" />
            </button>
            
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title || 'Expanded Memory'}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            />
            
            <div style={{ marginTop: '20px', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', margin: '0 0 8px 0' }}>
                {selectedPhoto.title || 'Untitled'}
              </h3>
              {selectedPhoto.description && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
                  {selectedPhoto.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => handleEditStart(selectedPhoto)}
                  style={{ padding: '8px 16px', background: 'rgba(192, 132, 252, 0.2)', border: '1px solid rgba(192, 132, 252, 0.3)', borderRadius: '8px', cursor: 'pointer', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
                >
                  <Edit3 style={{ width: '14px', height: '14px' }} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedPhoto.id)}
                  style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingPhoto && (
          <div
            className="fade-in"
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(5, 5, 5, 0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(10px)' }}
          >
            <div className="glass" style={{ maxWidth: '500px', width: '100%', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#ffffff', marginBottom: '24px' }}>Edit Photo Details</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Enter photo title"
                    className="input-field"
                    style={{ width: '100%', height: '44px' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter photo description (optional)"
                    className="input-field"
                    style={{ width: '100%', minHeight: '100px', resize: 'vertical', paddingTop: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => handleEditSave(editingPhoto)}
                  className="btn-primary"
                  style={{ flex: 1, height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Save style={{ width: '16px', height: '16px' }} />
                  Save Changes
                </button>
                <button
                  onClick={handleEditCancel}
                  style={{ flex: 1, height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default GalleryPage;