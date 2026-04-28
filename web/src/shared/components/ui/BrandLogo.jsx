/**
 * BrandLogo — shared across Sidebar, Navbar, Login, Landing
 *
 * Props:
 *   size     — 'sm' | 'md' | 'lg'   (default 'md')
 *   dark     — true = white wordmark (for dark backgrounds)
 *   iconOnly — true = show only the icon mark
 */

const SIZES = {
  sm: { icon: 28, font: '11px', gap: 8,  letterSpacing: '0.12em' },
  md: { icon: 32, font: '13px', gap: 10, letterSpacing: '0.14em' },
  lg: { icon: 40, font: '16px', gap: 12, letterSpacing: '0.16em' },
};

/* ── SVG logo mark: stylised "C" mortarboard ── */
const LogoMark = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', flexShrink: 0 }}
  >
    {/* Background tile */}
    <rect width="40" height="40" rx="10" fill="#2563EB" />

    {/* Mortarboard cap — flat top */}
    <polygon points="20,9 34,15 20,21 6,15" fill="white" opacity="0.95" />

    {/* Left tassel drop */}
    <line x1="6" y1="15" x2="6" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    <circle cx="6" cy="24.5" r="1.5" fill="#14B8A6" />

    {/* Diploma scroll body */}
    <rect x="13" y="21" width="14" height="9" rx="2" fill="white" opacity="0.9" />

    {/* Teal accent stripe on scroll */}
    <rect x="13" y="27" width="14" height="3" rx="2" fill="#14B8A6" opacity="0.85" />
  </svg>
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
            color: dark ? '#ffffff' : '#111827',
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
