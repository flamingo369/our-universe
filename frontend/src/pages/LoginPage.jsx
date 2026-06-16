import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome back! 💕');
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
      
      {/* Background soft ambient glowing background nodes */}
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '15%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Top Header Information Stack */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div className="heartbeat" style={{ padding: '12px', background: 'rgba(236, 72, 153, 0.15)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(236, 72, 153, 0.25)', marginBottom: '8px' }}>
            <Heart className="w-8 h-8" style={{ color: 'var(--primary-pink)' }} fill="currentColor" />
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '900', letterSpacing: '-0.025em', color: '#ffffff' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '300' }}>
            Sign in to your private space
          </p>
        </div>

        {/* Login Credentials Box Form */}
        <form className="glass" onSubmit={handleSubmit} style={{ padding: '36px 32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}>
          
          {/* Email Inputs Container */}
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

          {/* Password Inputs Container */}
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
                {showPassword ? (
                  <EyeOff className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                ) : (
                  <Eye className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Action Login Submission Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', height: '52px', borderRadius: '14px', fontSize: '1rem', marginTop: '8px', opacity: loading ? 0.6 : 1, transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Redirecting Navigation Option */}
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: '300' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary-pink)', textDecoration: 'none', fontWeight: '600', marginLeft: '4px' }} className="card-hover">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;