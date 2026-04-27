// Shared primitives used across all panels

export const Card = ({ children, className = '', style = {} }) => (
  <div className={className} style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 12, ...style }}>
    {children}
  </div>
);

export const TableWrap = ({ children }) => (
  <Card>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  </Card>
);

export const Thead = ({ cols }) => (
  <thead>
    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
      {cols.map((c) => (
        <th key={c} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
          {c}
        </th>
      ))}
    </tr>
  </thead>
);

export const Tr = ({ children, onClick }) => (
  <tr
    onClick={onClick}
    className={onClick ? 'cursor-pointer' : ''}
    style={{ borderBottom: '1px solid #f8fafc' }}
    onMouseEnter={e => { e.currentTarget.style.background = '#fafafa'; }}
    onMouseLeave={e => { e.currentTarget.style.background = ''; }}
  >
    {children}
  </tr>
);

export const Td = ({ children, mono, muted, className = '' }) => (
  <td className={`px-5 py-3.5 ${className}`} style={{ color: muted ? '#94a3b8' : '#0f172a', fontFamily: mono ? 'monospace' : undefined, fontSize: mono ? '12px' : undefined }}>
    {children}
  </td>
);

export const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-0.5 p-1 rounded-lg w-fit" style={{ background: '#f1f5f9' }}>
    {tabs.map(({ key, label }) => (
      <button
        key={key}
        onClick={() => onChange(key)}
        className="px-4 py-1.5 text-xs font-semibold rounded-md transition-all"
        style={active === key
          ? { background: '#fff', color: '#0f172a', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
          : { color: '#64748b' }}
      >
        {label}
      </button>
    ))}
  </div>
);

export const Badge = ({ children, color = 'gray' }) => {
  const map = {
    green:  { bg: '#ecfdf5', color: '#059669' },
    red:    { bg: '#fef2f2', color: '#dc2626' },
    amber:  { bg: '#fffbeb', color: '#d97706' },
    blue:   { bg: '#eff6ff', color: '#2563eb' },
    violet: { bg: '#f5f3ff', color: '#7c3aed' },
    gray:   { bg: '#f8fafc', color: '#64748b' },
  };
  const s = map[color] ?? map.gray;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold" style={s}>
      {children}
    </span>
  );
};

export const PctBar = ({ pct }) => {
  const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  const textColor = pct >= 75 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-20 rounded-full h-1" style={{ background: '#f1f5f9' }}>
        <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold tabular-nums" style={{ color: textColor }}>{pct}%</span>
    </div>
  );
};

export const EmptyState = ({ message, sub }) => (
  <Card>
    <div className="py-16 text-center">
      <div className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
        <svg className="w-5 h-5" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-sm font-semibold" style={{ color: '#334155' }}>{message}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{sub}</p>}
    </div>
  </Card>
);

export const Btn = ({ children, onClick, disabled, variant = 'primary', type = 'button', className = '' }) => {
  const styles = {
    primary:   { background: '#7c3aed', color: '#fff' },
    secondary: { background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0' },
    danger:    { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    success:   { background: '#059669', color: '#fff' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-opacity disabled:opacity-50 ${className}`}
      style={styles[variant]}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {children}
    </button>
  );
};

export const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-8 pr-4 py-2 text-sm rounded-lg outline-none transition-all"
      style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', width: 220 }}
      onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; }}
    />
  </div>
);

export const Modal = ({ title, onClose, children, width = 560 }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-white rounded-xl overflow-hidden animate-scale-in mx-4" style={{ width: '100%', maxWidth: width, border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <h2 className="text-sm font-semibold" style={{ color: '#0f172a' }}>{title}</h2>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-slate-400 hover:text-slate-700 hover:bg-slate-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>{children}</div>
    </div>
  </div>
);

export const SelectInput = ({ value, onChange, children, className = '' }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`px-3 py-2 text-sm rounded-lg outline-none ${className}`}
    style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#334155' }}
    onFocus={e => { e.target.style.borderColor = '#7c3aed'; }}
    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
  >
    {children}
  </select>
);
