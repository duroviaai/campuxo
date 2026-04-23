import { useEffect, useMemo, useState } from 'react';
import { getMyAttendanceSummary } from '../../attendance/services/attendanceService';

const pctColor = (pct) => {
  if (pct >= 75) return 'text-emerald-600';
  if (pct >= 50) return 'text-amber-600';
  return 'text-red-600';
};

const pctBg = (pct) => {
  if (pct >= 75) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-amber-400';
  return 'bg-red-500';
};

const pctBadge = (pct) => {
  if (pct >= 75) return 'bg-emerald-100 text-emerald-700';
  if (pct >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
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

  const overallPct = useMemo(() => {
    if (!summary.length) return null;
    return Math.round(summary.reduce((a, s) => a + s.attendancePercentage, 0) / summary.length);
  }, [summary]);

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-32 animate-pulse border border-gray-100" />)}
    </div>
  );
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  const inputCls = 'border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        {overallPct !== null && (
          <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${pctBadge(overallPct)}`}>
            Overall: {overallPct}%
          </span>
        )}
      </div>

      {/* Summary cards */}
      {summary.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{summary.filter(s => s.attendancePercentage >= 75).length}</p>
            <p className="text-xs text-gray-500 mt-1">Good Standing</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{summary.filter(s => s.attendancePercentage >= 50 && s.attendancePercentage < 75).length}</p>
            <p className="text-xs text-gray-500 mt-1">At Risk</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.filter(s => s.attendancePercentage < 50).length}</p>
            <p className="text-xs text-gray-500 mt-1">Critical</p>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter by</span>
        <select
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setVal1(''); setVal2(''); }}
          className={inputCls}
        >
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="range">Month Range</option>
        </select>

        {filterType === 'day' && (
          <input type="date" value={val1} onChange={(e) => setVal1(e.target.value)} className={inputCls} />
        )}
        {filterType === 'month' && (
          <input type="month" value={val1} onChange={(e) => setVal1(e.target.value)} className={inputCls} />
        )}
        {filterType === 'year' && (
          <input type="number" placeholder="YYYY" min="2000" max="2100" value={val1}
            onChange={(e) => setVal1(e.target.value)} className={`${inputCls} w-24`} />
        )}
        {filterType === 'range' && (
          <>
            <input type="month" value={val1} onChange={(e) => setVal1(e.target.value)} className={inputCls} />
            <span className="text-sm text-gray-400">to</span>
            <input type="month" value={val2} onChange={(e) => setVal2(e.target.value)} className={inputCls} />
          </>
        )}
        {val1 && (
          <button onClick={() => { setVal1(''); setVal2(''); }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
            ✕ Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm font-medium">No attendance records found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <div key={s.courseCode} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                    {s.courseCode?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{s.courseName}</p>
                    <p className="text-xs text-gray-400 font-mono">{s.courseCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-black ${pctColor(s.attendancePercentage)}`}>
                    {s.attendancePercentage}%
                  </p>
                  <p className="text-xs text-gray-500">{s.attendedClasses} / {s.totalClasses} classes</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Attendance progress</span>
                    <span className={`font-semibold ${pctColor(s.attendancePercentage)}`}>
                      {s.attendancePercentage >= 75 ? '✓ Good' : s.attendancePercentage >= 50 ? '⚠ At risk' : '✗ Critical'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${pctBg(s.attendancePercentage)}`}
                      style={{ width: `${s.attendancePercentage}%` }}
                    />
                  </div>
                  {s.attendancePercentage < 75 && (
                    <p className="text-xs text-amber-600 mt-1.5">
                      Need {Math.ceil((0.75 * s.totalClasses - s.attendedClasses) / 0.25)} more classes to reach 75%
                    </p>
                  )}
                </div>

                {/* Date lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DateList dates={s.presentDates} label="Present" color="text-emerald-600" />
                  <DateList dates={s.absentDates}  label="Absent"  color="text-red-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAttendancePage;
