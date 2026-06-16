import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ArrowRight, Star, Infinity, ShieldCheck, 
  Sparkles, Milestone, Zap, Coffee, Moon 
} from 'lucide-react';

const LandingPage = () => {
  const [timeTogether, setTimeTogether] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = [
    { text: "Distance means so little when someone means so much.", author: "Tom McNeal" },
    { text: "I exist in two places, here and where you are.", author: "Margaret Atwood" },
    { text: "How lucky I am to have something that makes saying goodbye so hard.", author: "A.A. Milne" },
    { text: "True love doesn't mean being inseparable; it means being separated and nothing changes.", author: "Unknown" },
  ];

  // Configured to start counting from June 17, 2024
  const relationshipStart = new Date('2024-06-17');

  useEffect(() => {
    const updateCounter = () => {
      const now = new Date();
      const diff = now - relationshipStart;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeTogether({ days, hours, minutes, seconds });
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const relationshipPillars = [
    { id: 1, icon: ShieldCheck, title: 'Unwavering Trust', description: 'A secure foundation built on transparency and absolute devotion.', iconColor: '#60a5fa' },
    { id: 2, icon: Sparkles, title: 'Infinite Growth', description: 'Supporting each other\'s journeys and evolving stronger together.', iconColor: '#c084fc' },
    { id: 3, icon: Milestone, title: 'Shared Dreams', description: 'Aligning our visions to construct an incredible future, hand in hand.', iconColor: '#f472b6' },
  ];

  const dailyRituals = [
    { icon: Coffee, title: 'Morning Synced Sparks', description: 'Begin every morning exchanging high-intent reflections to kickstart the day.', iconColor: '#facc15', glow: 'rgba(250, 204, 21, 0.15)' },
    { icon: Zap, title: 'Real-Time Presence Vibrations', description: 'Send unspoken, gentle digital signals just letting them know they are on your mind.', iconColor: '#4ade80', glow: 'rgba(74, 222, 128, 0.15)' },
    { icon: Moon, title: 'Midnight Safe Harbor', description: 'Wrap up the daily sequence within an encrypted space meant for raw, deep reflections.', iconColor: '#818cf8', glow: 'rgba(129, 140, 248, 0.15)' },
  ];

  const floatingHearts = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 10 + Math.random() * 8,
    size: 12 + Math.random() * 16,
  }));

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Immersive Deep Nebula Atmospheric Mesh */}
      <div style={{ position: 'absolute', top: '5%', left: '10%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '40%', right: '5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 1 }} />

      {/* Floating Particles/Hearts Layer */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 2 }}>
        {floatingHearts.map((heart) => (
          <motion.div
            key={heart.id}
            style={{ 
              position: 'absolute',
              color: 'rgba(236, 72, 153, 0.06)',
              left: `${heart.left}%`, 
              fontSize: `${heart.size}px`,
              filter: 'drop-shadow(0 0 4px rgba(236, 72, 153, 0.1))'
            }}
            initial={{ y: '110vh', opacity: 0 }}
            animate={{ 
              y: '-10vh',
              opacity: [0, 0.5, 0.5, 0],
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Heart fill="currentColor" />
          </motion.div>
        ))}
      </div>

      {/* Navigation Menu */}
      <nav style={{ position: 'relative', zIndex: 50, maxWidth: '1240px', margin: '0 auto', padding: '28px 20px 0 20px' }}>
        <div className="glass" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px', borderRadius: '20px', padding: '0 28px', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
          <div className="slide-in-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="heartbeat" style={{ padding: '10px', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
              <Heart className="w-5 h-5" style={{ color: 'var(--primary-pink)' }} fill="currentColor" />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#ffffff', background: 'linear-gradient(to right, #ffffff, #e2e8f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Our Universe
            </span>
          </div>
          
          <div className="slide-in-right" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.95rem', fontWeight: '600', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', borderRadius: '14px', fontSize: '0.95rem', letterSpacing: '-0.01em', boxShadow: '0 4px 15px rgba(236, 72, 153, 0.2)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        
        {/* Hero Section */}
        <section style={{ padding: '100px 0 60px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', width: '100%' }}>
            
            {/* Animated Glow Centerpiece Logo */}
            <div className="float" style={{ position: 'relative', display: 'inline-block' }}>
              <div className="glass" style={{ padding: '24px', borderRadius: '50%', border: '1px solid rgba(236, 72, 153, 0.3)', boxShadow: '0 0 50px rgba(236, 72, 153, 0.15)' }}>
                <Heart className="heartbeat" style={{ width: '76px', height: '76px', color: 'var(--primary-pink)', filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.6))' }} fill="currentColor" />
              </div>
              <div className="absolute inset-0 bg-pink-500 blur-3xl opacity-10 scale-150 rounded-full" style={{ pointerEvents: 'none' }} />
            </div>

            {/* Typography Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1.05', color: '#ffffff', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                Our Universe
              </h1>
              <p className="gradient-text" style={{ fontSize: 'clamp(1.3rem, 3.5vw, 2rem)', fontWeight: '700', letterSpacing: '0.01em' }}>
                Two Hearts. One Story. Infinite Memories.
              </p>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '620px', margin: '8px auto 0 auto', lineHeight: '1.65', fontWeight: '300' }}>
                A custom-built encrypted sanctuary for <span style={{ color: '#ffffff', fontWeight: '600', borderBottom: '2px dashed var(--primary-pink)', paddingBottom: '3px' }}>Shofi & Ajesh</span> — where dynamic boundaries fade and connection thrives daily.
              </p>
            </div>

            {/* Relationship Metric Counter Dashboard */}
            <div style={{ width: '100%', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: 'var(--primary-pink)', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.25em', opacity: 0.85 }}>
                TIME ELAPSED TOGETHER
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                {[
                  { value: timeTogether.days, label: 'Days' },
                  { value: timeTogether.hours, label: 'Hours' },
                  { value: timeTogether.minutes, label: 'Minutes' },
                  { value: timeTogether.seconds, label: 'Seconds' },
                ].map((item) => (
                  <div key={item.label} className="glass card-hover" style={{ width: '140px', padding: '24px 20px', borderRadius: '22px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginBottom: '2px', textShadow: '0 2px 10px rgba(255,255,255,0.1)' }}>
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', width: '100%', maxWidth: '440px', marginTop: '16px' }}>
              <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flex: '1', minWidth: '220px', height: '58px', borderRadius: '16px', fontSize: '1rem', boxShadow: '0 6px 20px rgba(236, 72, 153, 0.25)' }}>
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '1', minWidth: '150px', height: '58px', borderRadius: '16px', fontSize: '1rem' }}>
                Sign In
              </Link>
            </div>

          </div>
        </section>

        {/* Quotes Carousels Slider */}
        <section style={{ padding: '60px 0' }}>
          <div className="glass" style={{ maxWidth: '800px', margin: '0 auto', padding: '56px 40px', borderRadius: '28px', textAlign: 'center', position: 'relative', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 15px 35px rgba(0,0,0,0.3)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(to right, var(--primary-pink), var(--primary-purple), var(--primary-pink))' }} />
            <Star className="twinkle" style={{ width: '24px', height: '24px', color: 'var(--primary-pink)', margin: '0 auto 28px auto', opacity: 0.7, filter: 'drop-shadow(0 0 8px var(--primary-pink))' }} />
            
            <div style={{ minHeight: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuote}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                  <p style={{ fontSize: '1.25rem', color: '#f8fafc', fontStyle: 'italic', lineHeight: '1.65', fontWeight: '300', padding: '0 10px' }}>
                    "{quotes[currentQuote].text}"
                  </p>
                  <p style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.18em', color: 'var(--primary-pink)', opacity: 0.9 }}>
                    — {quotes[currentQuote].author.toUpperCase()}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '36px' }}>
              {quotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuote(index)}
                  aria-label={`View item ${index + 1}`}
                  style={{
                    border: 'none',
                    borderRadius: '9999px',
                    height: '7px',
                    width: currentQuote === index ? '28px' : '7px',
                    backgroundColor: currentQuote === index ? 'var(--primary-pink)' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Relationship Core Pillars Board */}
        <section style={{ padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em' }}>Our Shared Pillars</h2>
            <p style={{ color: 'var(--text-secondary)', fontWeight: '300', fontSize: '1.05rem' }}>The foundations that keep Ajesh & Shofi closely aligned, no matter the miles between.</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
            {relationshipPillars.map((pillar) => (
              <div key={pillar.id} className="glass card-hover" style={{ width: '280px', padding: '36px 24px', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ color: pillar.iconColor, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
                  <pillar.icon style={{ width: '48px', height: '48px' }} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.01em' }}>{pillar.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.55', fontWeight: '300' }}>{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Daily Rituals Section */}
        <section style={{ padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: '70px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 2.75rem)', fontWeight: '900', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Our Daily Rituals
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontWeight: '300', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
              Intentional spaces intentionally designed to protect our daily cadence.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'center' }}>
            {dailyRituals.map((ritual) => (
              <div key={ritual.title} className="glass card-hover" style={{ width: '280px', padding: '32px 28px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: ritual.glow, border: `1px solid ${ritual.iconColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${ritual.glow}` }}>
                  <ritual.icon style={{ width: '24px', height: '24px', color: ritual.iconColor }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#ffffff', letterSpacing: '-0.01em' }}>{ritual.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.55', fontWeight: '300' }}>{ritual.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Call To Action Banner */}
        <section style={{ padding: '100px 0 140px 0' }}>
          <div className="glass" style={{ maxWidth: '880px', margin: '0 auto', padding: '64px 40px', borderRadius: '36px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', border: '1px solid rgba(236,72,153,0.2)', boxShadow: '0 20px 50px rgba(236,72,153,0.05)' }}>
            <Infinity className="float" style={{ width: '40px', height: '40px', color: 'var(--primary-pink)', filter: 'drop-shadow(0 0 8px rgba(236,72,153,0.4))' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Ready to Build Your Universe?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto', lineHeight: '1.65', fontWeight: '300' }}>
                Secure configurations initialized. Gain instant real-time access into your centralized dashboard environment module below.
              </p>
            </div>
            <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', height: '54px', padding: '0 32px', borderRadius: '14px', fontSize: '1rem', fontWeight: '700', marginTop: '10px', boxShadow: '0 6px 25px rgba(236, 72, 153, 0.3)' }}>
              Create Your Space
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer Interface */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 20px', position: 'relative', zIndex: 10, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Heart style={{ width: '15px', height: '15px', color: 'var(--primary-pink)', opacity: 0.6 }} fill="currentColor" />
            <span style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.25em', color: 'var(--text-secondary)' }}>OUR UNIVERSE</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '300' }}>
              Made with love for <span style={{ color: '#f1f5f9', fontWeight: '400' }}>Ajesh & Shofi</span>
            </p>
            <p style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'monospace', marginTop: '8px', trackingWidth: '0.05em' }}>
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;