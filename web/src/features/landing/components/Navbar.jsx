import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BrandLogo from '../../../shared/components/ui/BrandLogo';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isLanding = pathname === '/home';
  const dark = isLanding && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={dark
        ? { background: 'transparent' }
        : { background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
      }
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center">
          <BrandLogo size="md" dark={dark} />
        </button>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={dark
              ? { color: 'rgba(255,255,255,0.8)' }
              : { color: '#374151' }
            }
            onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.1)' : '#f3f4f6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all"
            style={{ background: '#2563eb', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; }}
          >
            Get Started
          </button>
        </div>

        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: dark ? '#fff' : '#374151' }}
          onClick={() => setMenuOpen(p => !p)}
          aria-label="Toggle menu"
        >
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} text-base`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white px-6 py-4 flex flex-col gap-3" style={{ borderTop: '1px solid #e5e7eb' }}>
          <button onClick={() => navigate('/login')} className="w-full py-2.5 text-sm font-semibold rounded-lg" style={{ border: '1px solid #e5e7eb', color: '#374151' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/register')} className="w-full py-2.5 text-sm font-semibold text-white rounded-lg" style={{ background: '#2563eb' }}>
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
