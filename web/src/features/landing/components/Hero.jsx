import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section style={{ background: '#060b18', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '64px', position: 'relative', overflow: 'hidden' }}>

      {/* Background glow — behind everything */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.25), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Content — always on top */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '56rem', margin: '0 auto', padding: '7rem 1.5rem', textAlign: 'center' }}>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#93c5fd', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '32px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
          All-in-one Campus Management
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.75rem)', fontWeight: 900, color: '#ffffff', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: '24px', fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
          The smarter way to run
          <br />
          <span style={{ color: '#818cf8' }}>your campus</span>
        </h1>

        {/* Subtitle */}
        <p style={{ color: '#cbd5e1', fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '40px', maxWidth: '36rem', marginLeft: 'auto', marginRight: 'auto' }}>
          campuxo unifies students, faculty, and admins — streamlining courses,
          attendance, and academic management in one powerful platform.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/register')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', fontWeight: 700, fontSize: '14px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
          >
            Get Started Free
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

      </div>
    </section>
  );
};

export default Hero;
