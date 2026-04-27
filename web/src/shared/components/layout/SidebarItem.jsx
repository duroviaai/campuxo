import { NavLink } from 'react-router-dom';
import { Icon } from '../icons/IconLibrary';

const SidebarItem = ({ to, label, icon, end = false, badge, collapsed }) => (
  <NavLink
    to={to}
    end={end}
    title={collapsed ? label : undefined}
    className="flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative"
    style={({ isActive }) => ({
      padding: collapsed ? '0.625rem 0' : '0.5rem 0.625rem',
      justifyContent: collapsed ? 'center' : undefined,
      margin: collapsed ? '0 4px' : undefined,
      background: isActive ? 'rgba(139,92,246,0.15)' : 'transparent',
      color: isActive ? '#e2d9f3' : 'rgba(148,163,184,1)',
    })}
    onMouseEnter={e => {
      if (!e.currentTarget.getAttribute('aria-current')) {
        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.color = '#f1f5f9';
      }
    }}
    onMouseLeave={e => {
      if (!e.currentTarget.getAttribute('aria-current')) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'rgba(148,163,184,1)';
      }
    }}
  >
    {({ isActive }) => (
      <>
        {isActive && !collapsed && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full"
            style={{ background: '#8b5cf6' }}
          />
        )}
        <Icon
          icon={icon}
          size="sm"
          style={{ color: isActive ? '#a78bfa' : 'rgba(100,116,139,1)', flexShrink: 0 }}
        />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && badge > 0 && (
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        {collapsed && badge > 0 && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
        )}
      </>
    )}
  </NavLink>
);

export default SidebarItem;
