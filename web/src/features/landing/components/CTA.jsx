import { useNavigate } from 'react-router-dom';

const TRUST = [
  { icon: 'fa-circle-check', label: 'No credit card required' },
  { icon: 'fa-circle-check', label: 'Free forever plan' },
  { icon: 'fa-circle-check', label: 'Setup in minutes' },
];

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-28 px-6 md:px-10 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', background: '#060b18', padding: '80px 64px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>

          {/* Glow */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.28), transparent)', pointerEvents: 'none' }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#a5b4fc', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '32px' }}>
              <i className="fa-solid fa-rocket" style={{ fontSize: '10px' }} />
              Get Started Today
            </div>

            {/* Heading */}
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '20px', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
              Ready to transform<br />
              <span style={{ color: '#818cf8' }}>your institution?</span>
            </h2>

            {/* Subtitle */}
            <p style={{ color: '#cbd5e1', fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '48px', maxWidth: '28rem', marginLeft: 'auto', marginRight: 'auto' }}>
              Simplify administration, empower faculty, and give students the transparency they deserve — all in one platform.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
              <button
                onClick={() => navigate('/register')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: '#ffffff', color: '#111827', fontWeight: 700, fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-user-plus" style={{ fontSize: '12px' }} />
                Create Free Account
                <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px' }} />
              </button>
              <button
                onClick={() => navigate('/login')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'transparent', color: '#e2e8f0', fontWeight: 700, fontSize: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}
              >
                <i className="fa-solid fa-right-to-bracket" style={{ fontSize: '12px' }} />
                Sign In
              </button>
            </div>

            {/* Trust */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
              {TRUST.map(({ icon, label }) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                  <i className={`fa-solid ${icon}`} style={{ color: '#34d399', fontSize: '13px' }} />
                  {label}
                </span>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
