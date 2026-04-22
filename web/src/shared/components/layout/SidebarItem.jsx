import { NavLink } from 'react-router-dom';

const SidebarItem = ({ to, label, icon, end = false, badge }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`
    }
  >
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
    </svg>
    <span className="flex-1">{label}</span>
    {badge > 0 && (
      <span className="ml-auto bg-amber-400 text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </NavLink>
);

export default SidebarItem;
