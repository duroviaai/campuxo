import { ATTENDANCE_STATUSES } from '../utils/attendanceHelpers';

const STYLES = {
  PRESENT: { active: 'bg-green-600 text-white border-green-600', idle: 'text-green-700 border-green-200 hover:bg-green-50' },
  ABSENT:  { active: 'bg-red-600 text-white border-red-600',     idle: 'text-red-600 border-red-200 hover:bg-red-50' },
  LATE:    { active: 'bg-yellow-500 text-white border-yellow-500', idle: 'text-yellow-600 border-yellow-200 hover:bg-yellow-50' },
};

const StatusSelector = ({ value, onChange }) => (
  <div className="flex gap-1">
    {ATTENDANCE_STATUSES.map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
          value === s ? STYLES[s].active : STYLES[s].idle
        }`}
      >
        {s}
      </button>
    ))}
  </div>
);

export default StatusSelector;
