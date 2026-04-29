import { useEffect, useMemo, useState } from 'react';
import { getMyAttendanceSummary } from '../../attendance/services/attendanceService';
import { Card, SelectInput } from '../../../shared/components/ui/PageShell';

const toStr = (d) =>
  Array.isArray(d) ? `${d[0]}-${String(d[1]).padStart(2,'0')}-${String(d[2]).padStart(2,'0')}` : d;

const filterDates = (dates, type, val1, val2) => {
  if (!val1) return dates;
  return dates.filter((d) => {
    const s = toStr(d);
    if (type === 'day')   return s === val1;
    if (type === 'month') return s.startsWith(val1);
    if (type === 'year')  return s.startsWith(val1 + '-');
    if (type === 'range') return (!val1 || s >= val1) && (!val2 || s <= val2);
    return true;
  });
};

const DateChip = ({ date, present }) => (
  <span className="px-2 py-0.5 rounded text-[11px] font-medium"
    style={present ? { background: '#ecfdf5', color: '#059669' } : { background: '#fef2f2', color: '#dc2626' }}>
    {toStr(date)}
  </span>
);

// ── Calculator ────────────────────────────────────────────────────────────────

const AttendanceCalculator = ({ attended, total, pct }) => {
  const [target, setTarget] = useState('');

  const canMiss = pct >= 75
    ? Math.floor((attended - 0.75 * total) / 0.75)
    : null;

  const needFor75 = pct < 75
    ? Math.ceil((0.75 * total - attended) / 0.25)
    : null;

  const targetNum = parseFloat(target);
  const validTarget = !isNaN(targetNum) && targetNum > 0 && targetNum <= 100;
  const targetFrac  = validTarget ? targetNum / 100 : null;

  let whatIfResult = null;
  if (validTarget && targetFrac !== null) {
    if (pct >= targetNum) {
      const miss = Math.floor((attended - targetFrac * total) / targetFrac);
      whatIfResult = { type: 'can-miss', value: Math.max(0, miss) };
    } else {
      const need = Math.ceil((targetFrac * total - attended) / (1 - targetFrac));
      whatIfResult = { type: 'need', value: Math.max(0, need) };
    }
  }

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
      <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
        Attendance Calculator
      </p>

      {/* Status message */}
      {pct < 50 ? (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <span className="text-sm">🚨</span>
          <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>
            Critical — contact your HOD immediately
          </p>
        </div>
      ) : pct < 75 ? (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <span className="text-sm">⚠️</span>
          <p className="text-xs font-medium" style={{ color: '#92400e' }}>
            Attend <span className="font-bold">{needFor75}</span> consecutive class{needFor75 !== 1 ? 'es' : ''} to reach 75%
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <span className="text-sm">✅</span>
          <p className="text-xs font-medium" style={{ color: '#065f46' }}>
            You can miss <span className="font-bold">{canMiss}</span> more class{canMiss !== 1 ? 'es' : ''} and still maintain 75%
          </p>
        </div>
      )}

      {/* What-if input */}
      <div>
        <p className="text-[11px] font-medium mb-1.5" style={{ color: '#64748b' }}>
          What if I target a different percentage?
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="number"
              min="1"
              max="100"
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="e.g. 80"
              className="px-3 py-1.5 text-sm rounded-lg outline-none w-24 pr-7"
              style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#334155' }}
              onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; }}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
              style={{ color: '#94a3b8' }}>%</span>
          </div>

          {whatIfResult && (
            <p className="text-xs font-medium" style={{ color: '#334155' }}>
              {whatIfResult.type === 'can-miss' ? (
                <>You can miss{' '}
                  <span className="font-bold" style={{ color: '#059669' }}>{whatIfResult.value}</span>
                  {' '}more class{whatIfResult.value !== 1 ? 'es' : ''}
                </>
              ) : (
                <>Attend{' '}
                  <span className="font-bold" style={{ color: '#d97706' }}>{whatIfResult.value}</span>
                  {' '}more class{whatIfResult.value !== 1 ? 'es' : ''} to reach {targetNum}%
                </>
              )}
            </p>
          )}

          {target && !validTarget && (
            <p className="text-xs" style={{ color: '#dc2626' }}>Enter 1–100</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const inputStyle = { border: '1px solid #e2e8f0', background: '#fff', color: '#334155' };

const StudentAttendancePage = () => {
  const [summary, setSummary]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filterType, setFilterType] = useState('month');
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');

  useEffect(() => {
    getMyAttendanceSummary()
      .then(setSummary)
      .catch(e => setError(e.message ?? 'Failed to load attendance'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    summary.map(s => ({
      ...s,
      presentDates: filterDates(s.presentDates, filterType, val1, val2),
      absentDates:  filterDates(s.absentDates,  filterType, val1, val2),
    })),
  [summary, filterType, val1, val2]);

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="rounded-xl h-32 skeleton" />)}</div>;
  if (error)   return <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>;

  const good     = summary.filter(s => s.attendancePercentage >= 75).length;
  const atRisk   = summary.filter(s => s.attendancePercentage >= 50 && s.attendancePercentage < 75).length;
  const critical = summary.filter(s => s.attendancePercentage < 50).length;

  const SUMMARY_CARDS = [
    { label: 'Good Standing', value: good,     color: '#059669', bg: '#ecfdf5' },
    { label: 'At Risk',       value: atRisk,   color: '#d97706', bg: '#fffbeb' },
    { label: 'Critical',      value: critical, color: '#dc2626', bg: '#fef2f2' },
  ];

  const inputCls = 'px-3 py-2 text-sm rounded-lg outline-none';

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Summary row */}
      {summary.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {SUMMARY_CARDS.map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-xl p-4 text-center" style={{ border: '1px solid #e8edf2' }}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs font-medium mt-1" style={{ color: '#64748b' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <Card>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Filter</span>
          <SelectInput value={filterType} onChange={v => { setFilterType(v); setVal1(''); setVal2(''); }}>
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="range">Month Range</option>
          </SelectInput>
          {filterType === 'day'   && <input type="date"   value={val1} onChange={e => setVal1(e.target.value)} className={inputCls} style={inputStyle} />}
          {filterType === 'month' && <input type="month"  value={val1} onChange={e => setVal1(e.target.value)} className={inputCls} style={inputStyle} />}
          {filterType === 'year'  && (
            <input type="number" placeholder="YYYY" min="2000" max="2100"
              value={val1}
              onChange={e => {
                const v = e.target.value;
                if (v.length === 4 || v === '') setVal1(v);
              }}
              className={inputCls} style={{ ...inputStyle, width: 90 }} />
          )}
          {filterType === 'range' && (
            <>
              <input type="month" value={val1} onChange={e => setVal1(e.target.value)} className={inputCls} style={inputStyle} />
              <span className="text-xs" style={{ color: '#94a3b8' }}>to</span>
              <input type="month" value={val2} onChange={e => setVal2(e.target.value)} className={inputCls} style={inputStyle} />
            </>
          )}
          {val1 && (
            <button onClick={() => { setVal1(''); setVal2(''); }} className="text-xs font-semibold" style={{ color: '#7c3aed' }}>Clear</button>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <p className="text-sm text-center py-10" style={{ color: '#94a3b8' }}>No attendance records found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <Card key={s.courseCode}>
              {/* Header */}
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>
                    {s.courseCode?.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{s.courseName}</p>
                    <p className="text-[11px] font-mono" style={{ color: '#94a3b8' }}>{s.courseCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold tabular-nums"
                    style={{ color: s.attendancePercentage >= 75 ? '#059669' : s.attendancePercentage >= 50 ? '#d97706' : '#dc2626' }}>
                    {s.attendancePercentage}%
                  </p>
                  <p className="text-[11px]" style={{ color: '#94a3b8' }}>{s.attendedClasses}/{s.totalClasses} classes</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5" style={{ color: '#94a3b8' }}>
                    <span>Attendance</span>
                    <span className="font-semibold"
                      style={{ color: s.attendancePercentage >= 75 ? '#059669' : s.attendancePercentage >= 50 ? '#d97706' : '#dc2626' }}>
                      {s.attendancePercentage >= 75 ? 'Good' : s.attendancePercentage >= 50 ? 'At risk' : 'Critical'}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: '#f1f5f9' }}>
                    <div className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${s.attendancePercentage}%`,
                        background: s.attendancePercentage >= 75 ? '#10b981' : s.attendancePercentage >= 50 ? '#f59e0b' : '#ef4444',
                      }} />
                  </div>
                </div>

                {/* Calculator */}
                <AttendanceCalculator
                  attended={s.attendedClasses}
                  total={s.totalClasses}
                  pct={s.attendancePercentage}
                />

                {/* Date lists */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold mb-2" style={{ color: '#059669' }}>Present ({s.presentDates.length})</p>
                    {s.presentDates.length === 0
                      ? <p className="text-xs" style={{ color: '#cbd5e1' }}>None</p>
                      : <div className="flex flex-wrap gap-1">{s.presentDates.map(d => <DateChip key={toStr(d)} date={d} present />)}</div>
                    }
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold mb-2" style={{ color: '#dc2626' }}>Absent ({s.absentDates.length})</p>
                    {s.absentDates.length === 0
                      ? <p className="text-xs" style={{ color: '#cbd5e1' }}>None</p>
                      : <div className="flex flex-wrap gap-1">{s.absentDates.map(d => <DateChip key={toStr(d)} date={d} present={false} />)}</div>
                    }
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAttendancePage;
