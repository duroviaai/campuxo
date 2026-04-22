import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFacultyAssignments, submitAttendanceBatch } from '../services/facultyService';
import { getClassCourseOverview } from '../../attendance/services/attendanceService';
import axiosInstance from '../../../api/axiosInstance';
import ROUTES from '../../../app/routes/routeConstants';

const today = () => new Date().toISOString().split('T')[0];

const cls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

// ── Shared assignment selector ────────────────────────────────────────────────
const AssignmentSelector = ({ assignments, value, onChange, date, onDateChange }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course → Class</label>
        <select className={cls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">— Select assignment —</option>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.courseName} → {a.classDisplayName}
            </option>
          ))}
        </select>
      </div>
      {onDateChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input type="date" className={cls} value={date} onChange={(e) => onDateChange(e.target.value)} />
        </div>
      )}
    </div>
  </div>
);

// ── Mark tab ──────────────────────────────────────────────────────────────────
const MarkTab = ({ assignments }) => {
  const navigate                                = useNavigate();
  const [selAssignment, setSelAssignment]       = useState('');
  const [date, setDate]                         = useState(today());
  const [students, setStudents]                 = useState([]);
  const [statuses, setStatuses]                 = useState({});
  const [loading, setLoading]                   = useState(false);
  const [studentsLoaded, setStudentsLoaded]     = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitMsg, setSubmitMsg]               = useState(null);
  const [error, setError]                       = useState(null);

  const assignment = assignments.find((a) => String(a.id) === selAssignment);

  const resetStudents = () => {
    setStudentsLoaded(false);
    setStudents([]);
    setAlreadySubmitted(false);
    setSubmitMsg(null);
    setError(null);
  };

  const handleLoadStudents = async () => {
    if (!assignment) return;
    setLoading(true);
    resetStudents();
    try {
      const [enrolled, existing] = await Promise.all([
        // enrolled students in this course+class
        axiosInstance
          .get(`/api/v1/attendance/class/${assignment.classId}/course/${assignment.courseId}/overview`)
          .then((r) => r.data),
        // existing attendance for this date
        axiosInstance
          .get(`/api/v1/attendance/course/${assignment.courseId}/class/${assignment.classId}`, {
            params: { date },
          })
          .then((r) => r.data)
          .catch(() => []),
      ]);

      setStudents(enrolled);
      const statusMap = {};
      enrolled.forEach((s) => { statusMap[s.studentId] = 'PRESENT'; });
      if (existing.length > 0) {
        existing.forEach((r) => { statusMap[r.studentId] = r.status; });
        setAlreadySubmitted(true);
      }
      setStatuses(statusMap);
      setStudentsLoaded(true);
    } catch {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) =>
    setStatuses((prev) => ({ ...prev, [id]: prev[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT' }));

  const markAll = (status) => {
    const next = {};
    students.forEach((s) => { next[s.studentId] = status; });
    setStatuses(next);
  };

  const handleSubmit = async () => {
    if (!assignment || !studentsLoaded) return;
    setLoading(true);
    setSubmitMsg(null);
    setError(null);
    try {
      const records = students.map((s) => ({
        studentId: s.studentId,
        courseId:  assignment.courseId,
        classId:   assignment.classId,
        date,
        status:    statuses[s.studentId] ?? 'ABSENT',
      }));
      await submitAttendanceBatch(records);
      setSubmitMsg('Attendance submitted successfully!');
      setAlreadySubmitted(true);
    } catch {
      setError('Failed to submit attendance.');
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(statuses).filter((s) => s === 'PRESENT').length;
  const absentCount  = students.length - presentCount;

  return (
    <div className="space-y-5">
      <AssignmentSelector
        assignments={assignments}
        value={selAssignment}
        onChange={(v) => { setSelAssignment(v); resetStudents(); }}
        date={date}
        onDateChange={(d) => { setDate(d); resetStudents(); }}
      />

      <div className="flex gap-2">
        <button
          onClick={handleLoadStudents}
          disabled={!selAssignment || loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading && !studentsLoaded ? 'Loading...' : 'Load Students'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {alreadySubmitted && studentsLoaded && !submitMsg && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-sm text-amber-700 font-medium">
          ⚠️ Attendance already submitted for this date. You can re-submit to update it.
        </div>
      )}

      {studentsLoaded && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {students.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">No students enrolled in this course for this class.</p>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="text-green-600">✓ Present: {presentCount}</span>
                  <span className="text-red-500">✗ Absent: {absentCount}</span>
                  <span className="text-gray-400">Total: {students.length}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => markAll('PRESENT')}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    All Present
                  </button>
                  <button
                    onClick={() => markAll('ABSENT')}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    All Absent
                  </button>
                </div>
              </div>

              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Student</th>
                    <th className="px-6 py-3 text-left">Reg No</th>
                    <th className="px-6 py-3 text-left">Overall</th>
                    <th className="px-6 py-3 text-left">Today</th>
                    <th className="px-6 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s, i) => (
                    <tr key={s.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">{s.studentName}</td>
                      <td className="px-6 py-3 text-gray-400 text-xs font-mono">{s.registrationNumber || '—'}</td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-semibold ${
                          s.attendancePercentage >= 75 ? 'text-green-600' :
                          s.attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {s.attendancePercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => toggle(s.studentId)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            statuses[s.studentId] === 'PRESENT'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {statuses[s.studentId] === 'PRESENT' ? '✓ Present' : '✗ Absent'}
                        </button>
                      </td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => navigate(
                            ROUTES.FACULTY_STUDENT_ATTENDANCE.replace(':studentId', s.studentId),
                            { state: { studentName: s.studentName } }
                          )}
                          className="text-xs text-indigo-600 hover:underline"
                        >
                          Summary
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : alreadySubmitted ? 'Re-submit Attendance' : 'Submit Attendance'}
                </button>
                {submitMsg && <span className="text-sm text-green-600 font-medium">{submitMsg}</span>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ── History tab ───────────────────────────────────────────────────────────────
const HistoryTab = ({ assignments }) => {
  const navigate                          = useNavigate();
  const [selAssignment, setSelAssignment] = useState('');
  const [date, setDate]                   = useState(today());
  const [records, setRecords]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const assignment = assignments.find((a) => String(a.id) === selAssignment);

  const handleLoad = useCallback(async () => {
    if (!assignment) return;
    setLoading(true);
    setError(null);
    try {
      const data = await axiosInstance
        .get(`/api/v1/attendance/course/${assignment.courseId}/class/${assignment.classId}`, {
          params: { date },
        })
        .then((r) => r.data);
      setRecords(data);
    } catch {
      setError('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  }, [assignment, date]);

  return (
    <div className="space-y-5">
      <AssignmentSelector
        assignments={assignments}
        value={selAssignment}
        onChange={(v) => { setSelAssignment(v); setRecords(null); }}
        date={date}
        onDateChange={(d) => { setDate(d); setRecords(null); }}
      />

      <button
        onClick={handleLoad}
        disabled={!selAssignment || loading}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Records'}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {records !== null && (
        records.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">No attendance records found for this date.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {assignment?.courseName} · {date}
              </p>
              <div className="flex gap-3 text-xs">
                <span className="text-green-600 font-semibold">
                  ✓ Present: {records.filter((r) => r.status === 'PRESENT').length}
                </span>
                <span className="text-red-500 font-semibold">
                  ✗ Absent: {records.filter((r) => r.status === 'ABSENT').length}
                </span>
              </div>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r, i) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{r.studentName}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        r.status === 'PRESENT'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {r.status === 'PRESENT' ? '✓ Present' : '✗ Absent'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigate(
                          ROUTES.FACULTY_STUDENT_ATTENDANCE.replace(':studentId', r.studentId),
                          { state: { studentName: r.studentName } }
                        )}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Summary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

// ── Overview tab ──────────────────────────────────────────────────────────────
const OverviewTab = ({ assignments }) => {
  const navigate                          = useNavigate();
  const [selAssignment, setSelAssignment] = useState('');
  const [overview, setOverview]           = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const assignment = assignments.find((a) => String(a.id) === selAssignment);

  const handleLoad = useCallback(async () => {
    if (!assignment) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getClassCourseOverview(assignment.classId, assignment.courseId);
      setOverview(data);
    } catch {
      setError('Failed to load overview.');
    } finally {
      setLoading(false);
    }
  }, [assignment]);

  return (
    <div className="space-y-5">
      <AssignmentSelector
        assignments={assignments}
        value={selAssignment}
        onChange={(v) => { setSelAssignment(v); setOverview(null); }}
      />

      <button
        onClick={handleLoad}
        disabled={!selAssignment || loading}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Load Overview'}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {overview !== null && (
        overview.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">No students found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">
                {assignment?.courseName} — {assignment?.classDisplayName}
              </p>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Reg No</th>
                  <th className="px-5 py-3 text-left">Present</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left">%</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overview.map((s, i) => (
                  <tr key={s.studentId} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{s.studentName}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs font-mono">{s.registrationNumber || '—'}</td>
                    <td className="px-5 py-3 text-green-600 font-semibold">{s.attendedClasses}</td>
                    <td className="px-5 py-3 text-gray-500">{s.totalClasses}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              s.attendancePercentage >= 75 ? 'bg-green-500' :
                              s.attendancePercentage >= 50 ? 'bg-yellow-400' : 'bg-red-500'
                            }`}
                            style={{ width: `${s.attendancePercentage}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${
                          s.attendancePercentage >= 75 ? 'text-green-600' :
                          s.attendancePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {s.attendancePercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigate(
                          ROUTES.FACULTY_STUDENT_ATTENDANCE.replace(':studentId', s.studentId),
                          { state: { studentName: s.studentName } }
                        )}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Summary
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'mark',     label: 'Mark Attendance' },
  { key: 'history',  label: 'View History' },
  { key: 'overview', label: 'Overview' },
];

const FacultyAttendancePage = () => {
  const [assignments, setAssignments]               = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [error, setError]                           = useState(null);
  const [tab, setTab]                               = useState('mark');

  useEffect(() => {
    getFacultyAssignments()
      .then(setAssignments)
      .catch(() => setError('Failed to load assignments.'))
      .finally(() => setLoadingAssignments(false));
  }, []);

  const noAssignments = !loadingAssignments && assignments.length === 0;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              tab === key
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loadingAssignments ? (
        <p className="text-sm text-gray-500">Loading assignments...</p>
      ) : noAssignments ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center space-y-2">
          <p className="text-3xl">🗓️</p>
          <p className="text-sm font-semibold text-gray-700">No course assignments yet.</p>
          <p className="text-xs text-gray-400">Contact your admin to get courses assigned to you, and ensure students are enrolled.</p>
        </div>
      ) : tab === 'mark' ? (
        <MarkTab assignments={assignments} />
      ) : tab === 'history' ? (
        <HistoryTab assignments={assignments} />
      ) : (
        <OverviewTab assignments={assignments} />
      )}
    </div>
  );
};

export default FacultyAttendancePage;
