import { useEffect, useMemo, useState } from 'react';
import { getMyAttendanceSummary } from '../../attendance/services/attendanceService';

const pctColor = (pct) => {
  if (pct >= 75) return 'text-green-600';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const toStr = (d) =>
  Array.isArray(d) ? `${d[0]}-${String(d[1]).padStart(2,'0')}-${String(d[2]).padStart(2,'0')}` : d;

const DateList = ({ dates, label, color }) => (
  <div>
    <p className={`text-xs font-semibold mb-1 ${color}`}>{label} ({dates.length})</p>
    {dates.length === 0 ? (
      <p className="text-xs text-gray-400">None</p>
    ) : (
      <div className="flex flex-wrap gap-1">
        {dates.map((d) => (
          <span key={d} className={`px-2 py-0.5 rounded text-xs ${color === 'text-green-600' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {toStr(d)}
          </span>
        ))}
      </div>
    )}
  </div>
);

const filterDates = (dates, type, val1, val2) => {
  if (!val1) return dates;
  return dates.filter((d) => {
    const s = toStr(d);
    if (type === 'day')   return s === val1;
    if (type === 'month') return s.startsWith(val1);
    if (type === 'year')  return s.startsWith(val1);
    if (type === 'range') return (!val1 || s >= val1) && (!val2 || s <= val2);
    return true;
  });
};

const StudentAttendancePage = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filterType, setFilterType] = useState('month');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');

  useEffect(() => {
    getMyAttendanceSummary()
      .then(setSummary)
      .catch((e) => setError(e.message ?? 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    summary.map((s) => ({
      ...s,
      presentDates: filterDates(s.presentDates, filterType, val1, val2),
      absentDates:  filterDates(s.absentDates,  filterType, val1, val2),
    })),
  [summary, filterType, val1, val2]);

  if (loading) return <p className="text-sm text-gray-500">Loading attendance...</p>;
  if (error)   return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setVal1(''); setVal2(''); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700"
        >
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="range">Month Range</option>
        </select>

        {filterType === 'day' && (
          <input type="date" value={val1} onChange={(e) => setVal1(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        )}
        {filterType === 'month' && (
          <input type="month" value={val1} onChange={(e) => setVal1(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        )}
        {filterType === 'year' && (
          <input type="number" placeholder="YYYY" min="2000" max="2100" value={val1}
            onChange={(e) => setVal1(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        )}
        {filterType === 'range' && (
          <>
            <input type="month" value={val1} onChange={(e) => setVal1(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            <span className="text-sm text-gray-400">to</span>
            <input type="month" value={val2} onChange={(e) => setVal2(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </>
        )}

        {val1 && (
          <button onClick={() => { setVal1(''); setVal2(''); }}
            className="text-xs text-gray-400 hover:text-gray-600">
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500">No attendance records found.</p>
      ) : (
        filtered.map((s) => (
          <div key={s.courseCode} className="bg-white rounded-xl shadow p-5 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{s.courseName}</p>
                <p className="text-xs text-gray-400">{s.courseCode}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${pctColor(s.attendancePercentage)}`}>
                  {s.attendancePercentage}%
                </p>
                <p className="text-xs text-gray-500">
                  {s.attendedClasses} / {s.totalClasses} classes
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${s.attendancePercentage >= 75 ? 'bg-green-500' : s.attendancePercentage >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                style={{ width: `${s.attendancePercentage}%` }}
              />
            </div>

            {/* Date lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DateList dates={s.presentDates} label="Present" color="text-green-600" />
              <DateList dates={s.absentDates}  label="Absent"  color="text-red-600" />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentAttendancePage;
