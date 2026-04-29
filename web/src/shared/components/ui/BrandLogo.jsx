/**
 * BrandLogo — shared across Sidebar, Navbar, Login, Landing
 *
 * Props:
 *   size     — 'sm' | 'md' | 'lg'   (default 'md')
 *   dark     — true = white wordmark (for dark backgrounds)
 *   iconOnly — true = show only the icon mark
 */

const SIZES = {
  sm: { icon: 48, font: '18px', gap: 8,  letterSpacing: '0.12em' },
  md: { icon: 56, font: '22px', gap: 10, letterSpacing: '0.14em' },
  lg: { icon: 68, font: '26px', gap: 12, letterSpacing: '0.16em' },
};

const LogoMark = ({ size = 32 }) => (
  <img
    src="/campuxo_logo.png"
    alt="Campuxo"
    width={size}
    height={size}
    style={{ display: 'block', flexShrink: 0, objectFit: 'contain' }}
  />
);

const BrandLogo = ({ size = 'md', dark = false, iconOnly = false }) => {
  const s = SIZES[size] ?? SIZES.md;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      <LogoMark size={s.icon} />
      {!iconOnly && (
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
            fontSize: s.font,
            fontWeight: 800,
            letterSpacing: s.letterSpacing,
            textTransform: 'uppercase',
            color: dark ? '#ffffff' : '#0f172a',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          CAMPUXO
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
