import { useState, useCallback } from 'react';
import { useGetHodMeQuery, useGetHodFacultyAssignmentsQuery } from '../state/hodApi';
import { submitAttendanceBatch } from '../../faculty/services/facultyService';
import { getOverviewByClassStructure } from '../../attendance/services/attendanceService';
import axiosInstance from '../../../api/axiosInstance';
import { Card, Tabs, Btn, EmptyState, PctBar, SelectInput } from '../../../shared/components/ui/PageShell';

const today = () => new Date().toISOString().split('T')[0];

const inputStyle = { border: '1px solid #e2e8f0', background: '#fff', color: '#334155' };

// HOD assignments have courseId, courseName, courseCode, classStructureId, semester, etc.
// We need classId for the attendance endpoints — use classStructureId as classId fallback
const AssignmentSelector = ({ assignments, value, onChange, date, onDateChange }) => (
  <Card>
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Program</label>
        <SelectInput value={value} onChange={onChange}>
          <option value="">Select program</option>
          {assignments.map((a) => (
            <option key={`${a.courseId}-${a.classStructureId}`} value={`${a.courseId}|${a.classStructureId}`}>
              {a.courseName} — Sem {a.semester}{a.specialization ? ` (${a.specialization})` : ''}
            </option>
          ))}
        </SelectInput>
      </div>
      {onDateChange && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Date</label>
          <input type="date" className="px-3 py-2 text-sm rounded-lg outline-none" style={inputStyle}
            value={date} onChange={(e) => onDateChange(e.target.value)} />
        </div>
      )}
    </div>
  </Card>
);

const parseKey = (key) => {
  const [courseId, classStructureId] = key.split('|');
  return { courseId: Number(courseId), classStructureId: Number(classStructureId) };
};

// ── Mark Tab ──────────────────────────────────────────────────────────────────
const MarkTab = ({ assignments }) => {
  const [selKey, setSelKey]           = useState('');
  const [date, setDate]               = useState(today());
  const [students, setStudents]       = useState([]);
  const [statuses, setStatuses]       = useState({});
  const [loading, setLoading]         = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitMsg, setSubmitMsg]     = useState(null);
  const [error, setError]             = useState(null);

  const reset = () => { setStudentsLoaded(false); setStudents([]); setAlreadySubmitted(false); setSubmitMsg(null); setError(null); };

  const handleLoad = async () => {
    if (!selKey) return;
    const { courseId, classStructureId } = parseKey(selKey);
    setLoading(true); reset();
    try {
      const [enrolled, existing] = await Promise.all([
        axiosInstance.get(`/api/v1/attendance/class-structure/${classStructureId}/course/${courseId}/overview`).then(r => r.data),
        axiosInstance.get(`/api/v1/attendance/course/${courseId}/class-structure/${classStructureId}`, { params: { date } }).then(r => r.data).catch(() => []),
      ]);
      setStudents(enrolled);
      const map = {};
      enrolled.forEach(s => { map[s.studentId] = 'PRESENT'; });
      if (existing.length > 0) { existing.forEach(r => { map[r.studentId] = r.status; }); setAlreadySubmitted(true); }
      setStatuses(map); setStudentsLoaded(true);
    } catch { setError('Failed to load students.'); }
    finally { setLoading(false); }
  };

  const toggle = (id) => setStatuses(p => ({ ...p, [id]: p[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT' }));
  const markAll = (s) => { const n = {}; students.forEach(st => { n[st.studentId] = s; }); setStatuses(n); };

  const handleSubmit = async () => {
    if (!selKey || !studentsLoaded) return;
    const { courseId, classStructureId } = parseKey(selKey);
    setLoading(true); setSubmitMsg(null); setError(null);
    try {
      await submitAttendanceBatch(students.map(s => ({
        studentId: s.studentId, courseId, classStructureId, date,
        status: statuses[s.studentId] ?? 'ABSENT',
      })));
      setSubmitMsg('Attendance submitted.'); setAlreadySubmitted(true);
    } catch { setError('Failed to submit attendance.'); }
    finally { setLoading(false); }
  };

  const presentCount = Object.values(statuses).filter(s => s === 'PRESENT').length;

  return (
    <div className="space-y-4">
      <AssignmentSelector assignments={assignments} value={selKey}
        onChange={v => { setSelKey(v); reset(); }} date={date} onDateChange={d => { setDate(d); reset(); }} />
      <Btn onClick={handleLoad} disabled={!selKey || loading}>{loading && !studentsLoaded ? 'Loading…' : 'Load Students'}</Btn>
      {error && <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</p>}
      {alreadySubmitted && studentsLoaded && !submitMsg && (
        <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
          Attendance already submitted for this date. Re-submit to update.
        </p>
      )}
      {studentsLoaded && (
        <Card>
          {students.length === 0 ? (
            <p className="p-5 text-sm" style={{ color: '#94a3b8' }}>No students enrolled.</p>
          ) : (
            <>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="flex gap-4 text-xs font-semibold">
                  <span style={{ color: '#059669' }}>Present: {presentCount}</span>
                  <span style={{ color: '#dc2626' }}>Absent: {students.length - presentCount}</span>
                  <span style={{ color: '#94a3b8' }}>Total: {students.length}</span>
                </div>
                <div className="flex gap-2">
                  <Btn variant="success" onClick={() => markAll('PRESENT')}>All Present</Btn>
                  <Btn variant="danger" onClick={() => markAll('ABSENT')}>All Absent</Btn>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                      {['#', 'Student', 'Reg No', 'Overall', 'Today'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-5 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                        <td className="px-5 py-3 font-medium" style={{ color: '#0f172a' }}>{s.studentName}</td>
                        <td className="px-5 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{s.registrationNumber || '—'}</td>
                        <td className="px-5 py-3"><PctBar pct={s.attendancePercentage} /></td>
                        <td className="px-5 py-3">
                          <button onClick={() => toggle(s.studentId)}
                            className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                            style={statuses[s.studentId] === 'PRESENT'
                              ? { background: '#ecfdf5', color: '#059669' }
                              : { background: '#fef2f2', color: '#dc2626' }}>
                            {statuses[s.studentId] === 'PRESENT' ? 'Present' : 'Absent'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-4 flex items-center gap-4" style={{ borderTop: '1px solid #f1f5f9' }}>
                <Btn variant="success" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting…' : alreadySubmitted ? 'Re-submit' : 'Submit Attendance'}
                </Btn>
                {submitMsg && <span className="text-xs font-semibold" style={{ color: '#059669' }}>{submitMsg}</span>}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

// ── History Tab ───────────────────────────────────────────────────────────────
const HistoryTab = ({ assignments }) => {
  const [selKey, setSelKey]   = useState('');
  const [date, setDate]       = useState(today());
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleLoad = useCallback(async () => {
    if (!selKey) return;
    const { courseId, classStructureId } = parseKey(selKey);
    setLoading(true); setError(null);
    try {
      const data = await axiosInstance.get(`/api/v1/attendance/course/${courseId}/class-structure/${classStructureId}`, { params: { date } }).then(r => r.data);
      setRecords(data);
    } catch { setError('Failed to load records.'); }
    finally { setLoading(false); }
  }, [selKey, date]);

  const assignment = assignments.find(a => `${a.courseId}|${a.classStructureId}` === selKey);

  return (
    <div className="space-y-4">
      <AssignmentSelector assignments={assignments} value={selKey}
        onChange={v => { setSelKey(v); setRecords(null); }} date={date} onDateChange={d => { setDate(d); setRecords(null); }} />
      <Btn onClick={handleLoad} disabled={!selKey || loading}>{loading ? 'Loading…' : 'Load Records'}</Btn>
      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
      {records !== null && (
        records.length === 0
          ? <Card><p className="p-8 text-sm text-center" style={{ color: '#94a3b8' }}>No records for this date.</p></Card>
          : (
            <Card>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <p className="text-xs font-semibold" style={{ color: '#334155' }}>{assignment?.courseName} · {date}</p>
                <div className="flex gap-4 text-xs font-semibold">
                  <span style={{ color: '#059669' }}>Present: {records.filter(r => r.status === 'PRESENT').length}</span>
                  <span style={{ color: '#dc2626' }}>Absent: {records.filter(r => r.status === 'ABSENT').length}</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                    {['#', 'Student', 'Status'].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r.id ?? r.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-5 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                        <td className="px-5 py-3 font-medium" style={{ color: '#0f172a' }}>{r.studentName}</td>
                        <td className="px-5 py-3">
                          <span className="px-2 py-0.5 rounded-md text-xs font-semibold"
                            style={r.status === 'PRESENT' ? { background: '#ecfdf5', color: '#059669' } : { background: '#fef2f2', color: '#dc2626' }}>
                            {r.status === 'PRESENT' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
      )}
    </div>
  );
};

// ── Overview Tab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ assignments }) => {
  const [selKey, setSelKey]   = useState('');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleLoad = useCallback(async () => {
    if (!selKey) return;
    const { courseId, classStructureId } = parseKey(selKey);
    setLoading(true); setError(null);
    try { setOverview(await getOverviewByClassStructure(classStructureId, courseId)); }
    catch { setError('Failed to load overview.'); }
    finally { setLoading(false); }
  }, [selKey]);

  const assignment = assignments.find(a => `${a.courseId}|${a.classStructureId}` === selKey);

  return (
    <div className="space-y-4">
      <AssignmentSelector assignments={assignments} value={selKey} onChange={v => { setSelKey(v); setOverview(null); }} />
      <Btn onClick={handleLoad} disabled={!selKey || loading}>{loading ? 'Loading…' : 'Load Overview'}</Btn>
      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
      {overview !== null && (
        overview.length === 0
          ? <Card><p className="p-8 text-sm text-center" style={{ color: '#94a3b8' }}>No students found.</p></Card>
          : (
            <Card>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <p className="text-xs font-semibold" style={{ color: '#334155' }}>{assignment?.courseName} — Sem {assignment?.semester}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                    {['#', 'Student', 'Reg No', 'Present', 'Total', 'Attendance'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {overview.map((s, i) => (
                      <tr key={s.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-5 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                        <td className="px-5 py-3 font-medium" style={{ color: '#0f172a' }}>{s.studentName}</td>
                        <td className="px-5 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{s.registrationNumber || '—'}</td>
                        <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#059669' }}>{s.attendedClasses}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: '#64748b' }}>{s.totalClasses}</td>
                        <td className="px-5 py-3"><PctBar pct={s.attendancePercentage} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
      )}
    </div>
  );
};

const TABS = [
  { key: 'mark',     label: 'Mark Attendance' },
  { key: 'history',  label: 'History' },
  { key: 'overview', label: 'Overview' },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const HodMarkAttendancePage = ({ embedded = false }) => {
  const { data: me, isLoading: meLoading } = useGetHodMeQuery();
  const { data: assignments = [], isLoading: assignLoading } = useGetHodFacultyAssignmentsQuery(
    me?.id, { skip: !me?.id }
  );
  const [tab, setTab] = useState('mark');
  const isLoading = meLoading || assignLoading;

  return (
    <div className="space-y-5 max-w-4xl">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {isLoading
        ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-xl h-12 skeleton" />)}</div>
        : assignments.length === 0
          ? <EmptyState message="No programs assigned to you yet." sub="Contact admin to get programs assigned." />
          : tab === 'mark'     ? <MarkTab assignments={assignments} />
          : tab === 'history'  ? <HistoryTab assignments={assignments} />
          : <OverviewTab assignments={assignments} />
      }
    </div>
  );
};

export default HodMarkAttendancePage;
