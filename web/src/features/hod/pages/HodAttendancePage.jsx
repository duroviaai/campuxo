import { useState, useCallback } from 'react';
import { getOverviewByClassStructure } from '../../attendance/services/attendanceService';
import { useGetHodMeQuery, useGetHodFacultyAssignmentsQuery } from '../state/hodApi';

// ── Helpers ───────────────────────────────────────────────────────────────────
const pctColor = (p) => p >= 75 ? '#059669' : p >= 50 ? '#d97706' : '#dc2626';

const fmt = (d) => {
  if (!d) return '—';
  if (Array.isArray(d)) return `${d[0]}-${String(d[1]).padStart(2,'0')}-${String(d[2]).padStart(2,'0')}`;
  return d;
};

// ── Student Detail ────────────────────────────────────────────────────────────
const StudentDetail = ({ student, courseName, onBack }) => {
  const present = student.presentDates ?? [];
  const absent  = student.absentDates  ?? [];
  const total   = present.length + absent.length;
  const pct     = total === 0 ? 0 : Math.round((present.length / total) * 1000) / 10;
  const shortage = pct < 75 && total > 0;
  const classesNeeded = shortage ? Math.ceil((0.75 * total - present.length) / 0.25) : 0;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs font-medium hover:underline" style={{ color: '#7c3aed' }}>← Back to overview</button>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-base font-bold" style={{ color: '#0f172a' }}>{student.studentName}</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{student.registrationNumber || '—'} · {student.email || '—'}</p>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{courseName}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color: pctColor(pct) }}>{pct}%</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{present.length} / {total} classes</p>
          {shortage && <p className="text-xs font-semibold mt-1" style={{ color: '#dc2626' }}>Needs {classesNeeded} more class{classesNeeded !== 1 ? 'es' : ''} to reach 75%</p>}
        </div>
      </div>
      <div className="w-full rounded-full h-2" style={{ background: '#f1f5f9' }}>
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: pctColor(pct) }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: '#059669' }}>✓ Present ({present.length})</p>
          {present.length === 0 ? <p className="text-xs" style={{ color: '#94a3b8' }}>No records</p> : (
            <div className="flex flex-wrap gap-1.5">
              {present.map(d => <span key={fmt(d)} className="px-2 py-1 rounded-lg text-xs" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5' }}>{fmt(d)}</span>)}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: '#dc2626' }}>✗ Absent ({absent.length})</p>
          {absent.length === 0 ? <p className="text-xs" style={{ color: '#94a3b8' }}>No records</p> : (
            <div className="flex flex-wrap gap-1.5">
              {absent.map(d => <span key={fmt(d)} className="px-2 py-1 rounded-lg text-xs" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{fmt(d)}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Overview Panel ────────────────────────────────────────────────────────────
const OverviewPanel = ({ course }) => {
  const [rows, setRows]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [sortBy, setSortBy]   = useState('reg');
  const [sortDir, setSortDir] = useState('asc');
  const [selStudent, setSelStudent] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setSelStudent(null);
    try { setRows(await getOverviewByClassStructure(course.classStructureId, course.courseId)); }
    catch { setError('Failed to load attendance data.'); }
    finally { setLoading(false); }
  }, [course.classStructureId, course.courseId]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filtered = (rows ?? []).filter(r => {
    const q = search.toLowerCase();
    if (q && !r.studentName.toLowerCase().includes(q) && !(r.registrationNumber ?? '').toLowerCase().includes(q)) return false;
    if (filter === 'shortage' && r.attendancePercentage >= 75) return false;
    if (filter === 'ok'       && r.attendancePercentage <  75) return false;
    return true;
  }).sort((a, b) => {
    const cmp = sortBy === 'pct'
      ? a.attendancePercentage - b.attendancePercentage
      : sortBy === 'reg'
      ? (a.registrationNumber ?? '').localeCompare(b.registrationNumber ?? '')
      : a.studentName.localeCompare(b.studentName);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (selStudent) return <StudentDetail student={selStudent} courseName={course.courseName} onBack={() => setSelStudent(null)} />;

  const shortageCount = (rows ?? []).filter(r => r.attendancePercentage < 75).length;
  const avgPct = rows?.length ? (rows.reduce((s, r) => s + r.attendancePercentage, 0) / rows.length).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      <button onClick={load} disabled={loading}
        className="px-4 py-2 text-sm font-medium rounded-lg text-white disabled:opacity-50"
        style={{ background: '#7c3aed' }}>
        {loading ? 'Loading…' : rows === null ? 'Load Attendance' : 'Refresh'}
      </button>
      {error && <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>}
      {rows !== null && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Students',  value: rows.length,   color: '#334155' },
              { label: 'Shortage (<75%)', value: shortageCount, color: '#dc2626' },
              { label: 'Class Average',   value: `${avgPct}%`,  color: '#7c3aed' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2 flex-wrap">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / reg no…"
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-52"
                style={{ border: '1px solid #e2e8f0' }} />
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ border: '1px solid #e2e8f0' }}>
                <option value="all">All Students</option>
                <option value="shortage">Shortage (&lt;75%)</option>
                <option value="ok">75% and above</option>
              </select>
            </div>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <table className="min-w-full text-sm">
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                <tr>
                  {['#', 'Student', 'Reg No', 'Classes Taken', 'Present', 'Absent', 'Attendance', ''].map((h, i) => (
                    <th key={i}
                      onClick={() => i === 1 ? toggleSort('name') : i === 2 ? toggleSort('reg') : i === 6 ? toggleSort('pct') : null}
                      className={`px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider ${[1,2,6].includes(i) ? 'cursor-pointer select-none' : ''}`}
                      style={{ color: '#94a3b8' }}>
                      {h}{[1,2,6].includes(i) ? (sortBy === ['','name','reg','','','','pct'][i] ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={8} className="px-5 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No students found.</td></tr>
                  : filtered.map((r, i) => {
                    const shortage = r.attendancePercentage < 75;
                    const classesNeeded = shortage && r.totalClasses > 0 ? Math.ceil((0.75 * r.totalClasses - r.attendedClasses) / 0.25) : 0;
                    return (
                      <tr key={r.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-5 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                        <td className="px-5 py-3 font-medium" style={{ color: '#0f172a' }}>
                          {r.studentName}
                          {shortage && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#dc2626' }}>Shortage</span>}
                        </td>
                        <td className="px-5 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{r.registrationNumber || '—'}</td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#334155' }}>{r.totalClasses}</td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#059669' }}>{r.attendedClasses}</td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#dc2626' }}>{r.totalClasses - r.attendedClasses}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 rounded-full h-1.5" style={{ background: '#f1f5f9' }}>
                              <div className="h-1.5 rounded-full" style={{ width: `${r.attendancePercentage}%`, background: pctColor(r.attendancePercentage) }} />
                            </div>
                            <span className="text-xs font-semibold tabular-nums" style={{ color: pctColor(r.attendancePercentage) }}>{r.attendancePercentage}%</span>
                            {shortage && classesNeeded > 0 && <span className="text-[10px]" style={{ color: '#dc2626' }}>+{classesNeeded} needed</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => setSelStudent(r)} className="text-xs font-medium hover:underline" style={{ color: '#7c3aed' }}>Details</button>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HodAttendancePage = () => {
  const { data: me, isLoading: meLoading } = useGetHodMeQuery();
  const { data: courses = [], isLoading: coursesLoading } = useGetHodFacultyAssignmentsQuery(
    me?.id, { skip: !me?.id }
  );
  const isLoading = meLoading || coursesLoading;
  const [selKey, setSelKey] = useState('');

  const selected = courses.find(c => `${c.courseId}|${c.classStructureId}` === selKey);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Course dropdown */}
      <div className="rounded-xl p-4" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
        <label className="text-xs font-semibold block mb-1.5" style={{ color: '#64748b' }}>Select Program</label>
        <select
          value={selKey}
          onChange={e => setSelKey(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          style={{ border: '1px solid #e2e8f0' }}
          disabled={isLoading}>
          <option value="">{isLoading ? 'Loading programs…' : 'Select a program'}</option>
          {courses.map(c => (
            <option key={`${c.courseId}|${c.classStructureId}`} value={`${c.courseId}|${c.classStructureId}`}>
              {c.courseName} — Sem {c.semester}{c.specialization ? ` (${c.specialization})` : ''}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
          <div className="mb-4">
            <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{selected.courseName}</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#94a3b8' }}>
              {selected.courseCode} · Semester {selected.semester}
              {selected.batchStartYear ? ` · ${selected.batchStartYear}–${selected.batchEndYear}` : ''}
            </p>
          </div>
          <OverviewPanel key={selKey} course={selected} />
        </div>
      )}
    </div>
  );
};

export default HodAttendancePage;
