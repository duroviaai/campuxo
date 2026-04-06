import { memo } from 'react';

const cards = [
  { label: 'Total Students',    key: 'students', icon: '🎓', color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Total Faculty',     key: 'faculty',  icon: '👨‍🏫', color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Total Courses',     key: 'courses',  icon: '📚', color: 'bg-amber-50 text-amber-600' },
  { label: 'Pending Approvals', key: 'pending',  icon: '⏳', color: 'bg-rose-50 text-rose-600' },
];

const StatsCards = memo(({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {cards.map(({ label, key, icon, color }) => (
      <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 leading-tight">{stats[key] ?? 0}</p>
        </div>
      </div>
    ))}
  </div>
));

export default StatsCards;
