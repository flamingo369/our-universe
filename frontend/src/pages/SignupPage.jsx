import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(name, username, email, password);
      if (result.success) {
        toast.success('Account created! 💕');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      
      {/* Background Soft Ambient Light Filters */}
      <div style={{ position: 'absolute', top: '15%', left: '15%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Top Branding Section */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="heartbeat" style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.15)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(236, 72, 153, 0.25)', marginBottom: '8px' }}>
            <Heart className="w-8 h-8" style={{ color: 'var(--primary-pink)' }} fill="currentColor" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.025em', color: '#ffffff' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '300' }}>
            Start your private universe together
          </p>
        </div>

        {/* Form Container */}
        <form className="glass" onSubmit={handleSubmit} style={{ padding: '36px 32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}>
          
          {/* Name Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', letterSpacing: '0.02em' }}>
              Name
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User className="w-5 h-5" style={{ position: 'absolute', left: '16px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '48px' }}
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Username Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', letterSpacing: '0.02em' }}>
              Username
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <User className="w-5 h-5" style={{ position: 'absolute', left: '16px', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '48px' }}
                placeholder="Choose a username"
              />
            </div>
          </div>

          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', letterSpacing: '0.02em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail className="w-5 h-5" style={{ position: 'absolute', left: '16px', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '48px' }}
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', letterSpacing: '0.02em' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock className="w-5 h-5" style={{ position: 'absolute', left: '16px', color: 'var(--text-secondary)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '48px', paddingRight: '48px' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /> : <Eye className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e2e8f0', letterSpacing: '0.02em' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock className="w-5 h-5" style={{ position: 'absolute', left: '16px', color: 'var(--text-secondary)' }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="input-field"
                style={{ paddingLeft: '48px', paddingRight: '48px' }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} /> : <Eye className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '1rem', marginTop: '8px', opacity: loading ? 0.6 : 1, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Redirection Link Area */}
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '300' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-pink)', textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }} className="card-hover">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;