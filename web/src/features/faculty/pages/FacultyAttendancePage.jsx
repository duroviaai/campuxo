import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFacultyAssignments, submitAttendanceBatch } from '../services/facultyService';
import { getClassCourseOverview } from '../../attendance/services/attendanceService';
import axiosInstance from '../../../api/axiosInstance';
import ROUTES from '../../../app/routes/routeConstants';
import { Card, Tabs, Btn, EmptyState, PctBar, SelectInput } from '../../../shared/components/ui/PageShell';

const today = () => new Date().toISOString().split('T')[0];

const inputCls = 'px-3 py-2 text-sm rounded-lg outline-none';
const inputStyle = { border: '1px solid #e2e8f0', background: '#fff', color: '#334155' };

const AssignmentSelector = ({ assignments, value, onChange, date, onDateChange }) => (
  <Card>
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Course → Class</label>
        <SelectInput value={value} onChange={onChange}>
          <option value="">Select assignment</option>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>{a.courseName} → {a.classDisplayName}</option>
          ))}
        </SelectInput>
      </div>
      {onDateChange && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold" style={{ color: '#64748b' }}>Date</label>
          <input type="date" className={inputCls} style={inputStyle} value={date} onChange={(e) => onDateChange(e.target.value)} />
        </div>
      )}
    </div>
  </Card>
);

const MarkTab = ({ assignments }) => {
  const navigate = useNavigate();
  const [selAssignment, setSelAssignment] = useState('');
  const [date, setDate]                   = useState(today());
  const [students, setStudents]           = useState([]);
  const [statuses, setStatuses]           = useState({});
  const [loading, setLoading]             = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitMsg, setSubmitMsg]         = useState(null);
  const [error, setError]                 = useState(null);

  const assignment = assignments.find((a) => String(a.id) === selAssignment);

  const resetStudents = () => { setStudentsLoaded(false); setStudents([]); setAlreadySubmitted(false); setSubmitMsg(null); setError(null); };

  const handleLoadStudents = async () => {
    if (!assignment) return;
    setLoading(true); resetStudents();
    try {
      const [enrolled, existing] = await Promise.all([
        axiosInstance.get(`/api/v1/attendance/class/${assignment.classId}/course/${assignment.courseId}/overview`).then(r => r.data),
        axiosInstance.get(`/api/v1/attendance/course/${assignment.courseId}/class/${assignment.classId}`, { params: { date } }).then(r => r.data).catch(() => []),
      ]);
      setStudents(enrolled);
      const statusMap = {};
      enrolled.forEach(s => { statusMap[s.studentId] = 'PRESENT'; });
      if (existing.length > 0) { existing.forEach(r => { statusMap[r.studentId] = r.status; }); setAlreadySubmitted(true); }
      setStatuses(statusMap); setStudentsLoaded(true);
    } catch { setError('Failed to load students.'); }
    finally { setLoading(false); }
  };

  const toggle = (id) => setStatuses(prev => ({ ...prev, [id]: prev[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT' }));
  const markAll = (status) => { const next = {}; students.forEach(s => { next[s.studentId] = status; }); setStatuses(next); };

  const handleSubmit = async () => {
    if (!assignment || !studentsLoaded) return;
    setLoading(true); setSubmitMsg(null); setError(null);
    try {
      await submitAttendanceBatch(students.map(s => ({ studentId: s.studentId, courseId: assignment.courseId, classId: assignment.classId, date, status: statuses[s.studentId] ?? 'ABSENT' })));
      setSubmitMsg('Attendance submitted.'); setAlreadySubmitted(true);
    } catch { setError('Failed to submit attendance.'); }
    finally { setLoading(false); }
  };

  const presentCount = Object.values(statuses).filter(s => s === 'PRESENT').length;

  return (
    <div className="space-y-4">
      <AssignmentSelector assignments={assignments} value={selAssignment} onChange={v => { setSelAssignment(v); resetStudents(); }} date={date} onDateChange={d => { setDate(d); resetStudents(); }} />
      <Btn onClick={handleLoadStudents} disabled={!selAssignment || loading}>{loading && !studentsLoaded ? 'Loading…' : 'Load Students'}</Btn>
      {error && <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</p>}
      {alreadySubmitted && studentsLoaded && !submitMsg && (
        <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' }}>
          Attendance already submitted for this date. Re-submit to update.
        </p>
      )}
      {studentsLoaded && (
        <Card>
          {students.length === 0 ? (
            <p className="p-5 text-sm" style={{ color: '#94a3b8' }}>No students enrolled in this course for this class.</p>
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
                      {['#', 'Student', 'Reg No', 'Overall', 'Today', ''].map(h => (
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
                          <button
                            onClick={() => toggle(s.studentId)}
                            className="px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                            style={statuses[s.studentId] === 'PRESENT'
                              ? { background: '#ecfdf5', color: '#059669' }
                              : { background: '#fef2f2', color: '#dc2626' }}
                          >
                            {statuses[s.studentId] === 'PRESENT' ? 'Present' : 'Absent'}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => navigate(ROUTES.FACULTY_STUDENT_ATTENDANCE.replace(':studentId', s.studentId), { state: { studentName: s.studentName } })}
                            className="text-xs font-semibold" style={{ color: '#7c3aed' }}>Summary</button>
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

const HistoryTab = ({ assignments }) => {
  const navigate = useNavigate();
  const [selAssignment, setSelAssignment] = useState('');
  const [date, setDate]   = useState(today());
  const [records, setRecords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const assignment = assignments.find(a => String(a.id) === selAssignment);

  const handleLoad = useCallback(async () => {
    if (!assignment) return;
    setLoading(true); setError(null);
    try {
      const data = await axiosInstance.get(`/api/v1/attendance/course/${assignment.courseId}/class/${assignment.classId}`, { params: { date } }).then(r => r.data);
      setRecords(data);
    } catch { setError('Failed to load records.'); }
    finally { setLoading(false); }
  }, [assignment, date]);

  return (
    <div className="space-y-4">
      <AssignmentSelector assignments={assignments} value={selAssignment} onChange={v => { setSelAssignment(v); setRecords(null); }} date={date} onDateChange={d => { setDate(d); setRecords(null); }} />
      <Btn onClick={handleLoad} disabled={!selAssignment || loading}>{loading ? 'Loading…' : 'Load Records'}</Btn>
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
                    {['#', 'Student', 'Status', ''].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {records.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}
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
                        <td className="px-5 py-3">
                          <button onClick={() => navigate(ROUTES.FACULTY_STUDENT_ATTENDANCE.replace(':studentId', r.studentId), { state: { studentName: r.studentName } })}
                            className="text-xs font-semibold" style={{ color: '#7c3aed' }}>Summary</button>
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

const OverviewTab = ({ assignments }) => {
  const navigate = useNavigate();
  const [selAssignment, setSelAssignment] = useState('');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const assignment = assignments.find(a => String(a.id) === selAssignment);

  const handleLoad = useCallback(async () => {
    if (!assignment) return;
    setLoading(true); setError(null);
    try { setOverview(await getClassCourseOverview(assignment.classId, assignment.courseId)); }
    catch { setError('Failed to load overview.'); }
    finally { setLoading(false); }
  }, [assignment]);

  return (
    <div className="space-y-4">
      <AssignmentSelector assignments={assignments} value={selAssignment} onChange={v => { setSelAssignment(v); setOverview(null); }} />
      <Btn onClick={handleLoad} disabled={!selAssignment || loading}>{loading ? 'Loading…' : 'Load Overview'}</Btn>
      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
      {overview !== null && (
        overview.length === 0
          ? <Card><p className="p-8 text-sm text-center" style={{ color: '#94a3b8' }}>No students found.</p></Card>
          : (
            <Card>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <p className="text-xs font-semibold" style={{ color: '#334155' }}>{assignment?.courseName} — {assignment?.classDisplayName}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
                    {['#', 'Student', 'Reg No', 'Present', 'Total', 'Attendance', ''].map(h => <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>)}
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
                        <td className="px-5 py-3">
                          <button onClick={() => navigate(ROUTES.FACULTY_STUDENT_ATTENDANCE.replace(':studentId', s.studentId), { state: { studentName: s.studentName } })}
                            className="text-xs font-semibold" style={{ color: '#7c3aed' }}>Summary</button>
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

const TABS = [
  { key: 'mark',     label: 'Mark Attendance' },
  { key: 'history',  label: 'History' },
  { key: 'overview', label: 'Overview' },
];

const FacultyAttendancePage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab]     = useState('mark');

  useEffect(() => {
    getFacultyAssignments()
      .then(setAssignments)
      .catch(() => setError('Failed to load assignments.'))
      .finally(() => setLoadingAssignments(false));
  }, []);

  return (
    <div className="space-y-5 max-w-4xl">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {error && <p className="text-xs" style={{ color: '#dc2626' }}>{error}</p>}
      {loadingAssignments
        ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="rounded-xl h-12 skeleton" />)}</div>
        : assignments.length === 0
          ? <EmptyState message="No course assignments yet." sub="Contact your admin to get courses assigned." />
          : tab === 'mark'     ? <MarkTab assignments={assignments} />
          : tab === 'history'  ? <HistoryTab assignments={assignments} />
          : <OverviewTab assignments={assignments} />
      }
    </div>
  );
};

export default FacultyAttendancePage;
