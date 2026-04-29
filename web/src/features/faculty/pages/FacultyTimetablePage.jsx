import { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosInstance';

const DAYS = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
  { key: 'SAT', label: 'Saturday' },
];

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8..18

const TYPE_STYLE = {
  LECTURE:  { bg: '#f5f3ff', border: '#7c3aed', text: '#5b21b6', badge: '#ede9fe' },
  LAB:      { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8', badge: '#dbeafe' },
  TUTORIAL: { bg: '#f0fdf4', border: '#16a34a', text: '#15803d', badge: '#dcfce7' },
};

const fmt12 = (time) => {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const timeToDecimal = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
};

const EntryCard = ({ entry }) => {
  const style  = TYPE_STYLE[entry.type] ?? TYPE_STYLE.LECTURE;
  const start  = timeToDecimal(entry.startTime);
  const end    = timeToDecimal(entry.endTime);
  const top    = (start - 8) * 64;
  const height = Math.max((end - start) * 64 - 4, 28);

  return (
    <div
      className="absolute left-1 right-1 rounded-lg px-2 py-1.5 overflow-hidden"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        background: style.bg,
        border: `1.5px solid ${style.border}`,
      }}
      title={`${entry.courseName} · ${fmt12(entry.startTime)} – ${fmt12(entry.endTime)}${entry.room ? ` · ${entry.room}` : ''}`}
    >
      <p className="text-[11px] font-bold leading-tight truncate" style={{ color: style.text }}>
        {entry.courseName}
      </p>
      {height >= 44 && entry.classStructureDisplay && (
        <p className="text-[10px] leading-tight truncate mt-0.5" style={{ color: style.text, opacity: 0.8 }}>
          {entry.classStructureDisplay}
        </p>
      )}
      {height >= 58 && entry.room && (
        <p className="text-[10px] leading-tight truncate" style={{ color: style.text, opacity: 0.65 }}>
          {entry.room}
        </p>
      )}
      <span
        className="absolute top-1 right-1 text-[9px] font-bold px-1 rounded"
        style={{ background: style.badge, color: style.text }}>
        {entry.type[0]}
      </span>
    </div>
  );
};

const FacultyTimetablePage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    axiosInstance.get('/api/v1/timetable/faculty/me')
      .then(r => setEntries(r.data))
      .catch(() => setError('Failed to load timetable.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 max-w-6xl">
        {[1, 2].map(i => <div key={i} className="h-32 rounded-xl skeleton" />)}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: '#f5f3ff' }}>📅</div>
        <p className="text-base font-semibold" style={{ color: '#0f172a' }}>No timetable yet</p>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Timetable not set up yet. Contact your administrator.
        </p>
      </div>
    );
  }

  const byDay = Object.fromEntries(DAYS.map(d => [d.key, []]));
  entries.forEach(e => { if (byDay[e.dayOfWeek]) byDay[e.dayOfWeek].push(e); });

  const legend = Object.entries(TYPE_STYLE).map(([type, s]) => ({ type, ...s }));

  return (
    <div className="space-y-4 max-w-full">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {legend.map(({ type, border, text, bg }) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: bg, border: `1.5px solid ${border}` }} />
            <span className="text-xs font-semibold" style={{ color: text }}>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="rounded-xl overflow-auto" style={{ border: '1px solid #e2e8f0' }}>
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid" style={{ gridTemplateColumns: '56px repeat(6, 1fr)', background: '#fafafa', borderBottom: '1px solid #e2e8f0' }}>
            <div className="px-2 py-3" />
            {DAYS.map(d => (
              <div key={d.key} className="px-2 py-3 text-center">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#334155' }}>{d.label.slice(0, 3)}</p>
                <p className="text-[10px] hidden sm:block mt-0.5" style={{ color: '#94a3b8' }}>{d.label}</p>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="grid" style={{ gridTemplateColumns: '56px repeat(6, 1fr)' }}>
            {/* Time labels */}
            <div>
              {HOURS.map(h => (
                <div key={h} className="flex items-start justify-end pr-2 pt-1"
                  style={{ height: '64px', borderBottom: '1px solid #f1f5f9' }}>
                  <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>
                    {h % 12 || 12}{h < 12 ? 'am' : 'pm'}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map(d => (
              <div key={d.key} className="relative" style={{ borderLeft: '1px solid #f1f5f9' }}>
                {HOURS.map(h => (
                  <div key={h} style={{ height: '64px', borderBottom: '1px solid #f8fafc' }} />
                ))}
                {byDay[d.key].map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyTimetablePage;
