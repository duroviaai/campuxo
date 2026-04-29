import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOverviewByClassStructure,
  markAttendanceBatch,
} from '../../attendance/services/attendanceService';
import {
  useGetBatchesQuery,
  useGetDepartmentsQuery,
  useGetSpecializationsByDeptQuery,
  useGetClassStructureQuery,
  useGetAdminCoursesQuery,
} from '../courses/coursesAdminApi';
import toast from 'react-hot-toast';
import ROUTES from '../../../app/routes/routeConstants';

// ─── Faculty link ─────────────────────────────────────────────────────────────
const FacultyLink = ({ facultyId, facultyName }) => {
  const navigate = useNavigate();
  if (!facultyName) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); navigate(ROUTES.ADMIN_FACULTY_ASSIGN_COURSES.replace(':id', facultyId)); }}
      className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline mt-1 truncate block text-left">
      {facultyName}
    </button>
  );
};

const pctBg  = (p) => p >= 75 ? 'bg-green-100 text-green-700' : p >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
const pctBar = (p) => p >= 75 ? 'bg-green-500' : p >= 50 ? 'bg-yellow-400' : 'bg-red-500';
const today  = () => new Date().toISOString().split('T')[0];
const fmt    = (d) => { if (!d) return '—'; if (Array.isArray(d)) return `${d[0]}-${String(d[1]).padStart(2,'0')}-${String(d[2]).padStart(2,'0')}`; return d; };

// ─── Cascading dropdowns ──────────────────────────────────────────────────────
const useDropdowns = () => {
  const [batchId, setBatchId]   = useState('');
  const [deptId, setDeptId]     = useState('');
  const [specId, setSpecId]     = useState('');
  const [csId, setCsId]         = useState('');
  const [courseId, setCourseId] = useState('');

  const { data: batches = [], isLoading: batchLoading }   = useGetBatchesQuery();
  const { data: depts = [],   isLoading: deptLoading }    = useGetDepartmentsQuery();
  const selectedBatch = batches.find(b => String(b.id) === batchId);
  const { data: specs = [] } = useGetSpecializationsByDeptQuery(
    { deptId: Number(deptId), scheme: selectedBatch?.scheme },
    { skip: !deptId || !selectedBatch }
  );
  const { data: structures = [], isLoading: csLoading } = useGetClassStructureQuery(
    { batchId: Number(batchId), deptId: Number(deptId), specId: specId ? Number(specId) : undefined },
    { skip: !batchId || !deptId }
  );
  const { data: courses = [], isLoading: courseLoading } = useGetAdminCoursesQuery(
    { classStructureId: Number(csId) },
    { skip: !csId }
  );

  const selectedCs     = structures.find(s => String(s.id) === csId);
  const selectedCourse = courses.find(c => String(c.id) === courseId);

  const reset = (from) => {
    if (from <= 0) { setBatchId(''); }
    if (from <= 1) { setDeptId(''); }
    if (from <= 2) { setSpecId(''); setCsId(''); }
    if (from <= 3) { setCsId(''); }
    if (from <= 4) { setCourseId(''); }
  };

  return {
    batchId, setBatchId: (v) => { setBatchId(v); reset(1); },
    deptId,  setDeptId:  (v) => { setDeptId(v);  reset(2); },
    specId,  setSpecId:  (v) => { setSpecId(v);  reset(3); },
    csId,    setCsId:    (v) => { setCsId(v);    reset(4); },
    courseId, setCourseId,
    batches, depts, specs, structures, courses,
    batchLoading, deptLoading, csLoading, courseLoading,
    selectedBatch, selectedCs, selectedCourse,
  };
};

const sel = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:bg-gray-50';

const Dropdowns = ({ state }) => {
  const { batchId, setBatchId, deptId, setDeptId, specId, setSpecId, csId, setCsId, courseId, setCourseId,
    batches, depts, specs, structures, courses, batchLoading, deptLoading, csLoading, courseLoading } = state;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Batch</label>
        <select value={batchId} onChange={e => setBatchId(e.target.value)} className={sel} disabled={batchLoading}>
          <option value="">{batchLoading ? 'Loading…' : 'Select batch'}</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.startYear}–{b.endYear} ({b.scheme})</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Department</label>
        <select value={deptId} onChange={e => setDeptId(e.target.value)} className={sel} disabled={!batchId || deptLoading}>
          <option value="">{deptLoading ? 'Loading…' : 'Select department'}</option>
          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      {specs.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Specialization</label>
          <select value={specId} onChange={e => setSpecId(e.target.value)} className={sel}>
            <option value="">All</option>
            {specs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Semester</label>
        <select value={csId} onChange={e => setCsId(e.target.value)} className={sel} disabled={!deptId || csLoading}>
          <option value="">{csLoading ? 'Loading…' : 'Select semester'}</option>
          {structures.map(cs => <option key={cs.id} value={cs.id}>Sem {cs.semester} · Year {cs.yearOfStudy}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-1">Program</label>
        <select value={courseId} onChange={e => setCourseId(e.target.value)} className={sel} disabled={!csId || courseLoading}>
          <option value="">{courseLoading ? 'Loading…' : 'Select program'}</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
        </select>
      </div>
    </div>
  );
};

// ─── Student detail ───────────────────────────────────────────────────────────
const StudentDetail = ({ student, courseName, onBack }) => {
  const present = student.presentDates ?? [];
  const absent  = student.absentDates  ?? [];
  const total   = present.length + absent.length;
  const pct     = total === 0 ? 0 : Math.round((present.length / total) * 1000) / 10;
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs text-indigo-600 hover:underline">← Back to overview</button>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-bold text-gray-900">{student.studentName}</p>
          <p className="text-xs text-gray-400">{student.registrationNumber || '—'} · {student.email || '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{courseName}</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${pct >= 75 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{pct}%</p>
          <p className="text-xs text-gray-400">{present.length} / {total} classes</p>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${pctBar(pct)}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-green-600 mb-2">✓ Present ({present.length})</p>
          {present.length === 0 ? <p className="text-xs text-gray-400">No records</p> : (
            <div className="flex flex-wrap gap-1.5">
              {present.map(d => <span key={fmt(d)} className="px-2 py-1 rounded-lg text-xs bg-green-50 text-green-700 border border-green-100">{fmt(d)}</span>)}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-red-600 mb-2">✗ Absent ({absent.length})</p>
          {absent.length === 0 ? <p className="text-xs text-gray-400">No records</p> : (
            <div className="flex flex-wrap gap-1.5">
              {absent.map(d => <span key={fmt(d)} className="px-2 py-1 rounded-lg text-xs bg-red-50 text-red-700 border border-red-100">{fmt(d)}</span>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Overview tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ course, classStructure }) => {
  const [rows, setRows]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [sortBy, setSortBy]     = useState('reg');
  const [sortDir, setSortDir]   = useState('asc');
  const [selStudent, setSelStudent] = useState(null);

  const handleLoad = useCallback(async () => {
    setLoading(true); setError(null); setSelStudent(null);
    try { setRows(await getOverviewByClassStructure(classStructure.id, course.id)); }
    catch { setError('Failed to load overview.'); }
    finally { setLoading(false); }
  }, [classStructure.id, course.id]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filtered = (rows ?? []).filter(r => {
    const q = search.toLowerCase();
    if (q && !r.studentName.toLowerCase().includes(q) && !(r.registrationNumber ?? '').toLowerCase().includes(q)) return false;
    if (filter === 'low' && r.attendancePercentage >= 75) return false;
    if (filter === 'ok'  && r.attendancePercentage <  75) return false;
    return true;
  }).sort((a, b) => {
    const cmp = sortBy === 'pct'
      ? a.attendancePercentage - b.attendancePercentage
      : sortBy === 'reg'
      ? (a.registrationNumber ?? '').localeCompare(b.registrationNumber ?? '')
      : a.studentName.localeCompare(b.studentName);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (selStudent) return <StudentDetail student={selStudent} courseName={course.name} onBack={() => setSelStudent(null)} />;

  return (
    <div className="space-y-4">
      <button onClick={handleLoad} disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Loading…' : rows === null ? 'Load Overview' : 'Refresh'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {rows !== null && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / reg no…"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52" />
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Students</option>
                <option value="low">Below 75%</option>
                <option value="ok">75% and above</option>
              </select>
            </div>
            <p className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort('name')}>Student {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th className="px-5 py-3 text-left cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort('reg')}>Reg No {sortBy === 'reg' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th className="px-5 py-3 text-left">Present</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left cursor-pointer select-none hover:text-gray-700" onClick={() => toggleSort('pct')}>% {sortBy === 'pct' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0
                  ? <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">No students found.</td></tr>
                  : filtered.map((r, i) => (
                    <tr key={r.studentId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{r.studentName}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs font-mono">{r.registrationNumber || '—'}</td>
                      <td className="px-5 py-3 text-green-600 font-semibold">{r.attendedClasses}</td>
                      <td className="px-5 py-3 text-gray-500">{r.totalClasses}</td>
                      <td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pctBg(r.attendancePercentage)}`}>{r.attendancePercentage}%</span></td>
                      <td className="px-5 py-3"><button onClick={() => setSelStudent(r)} className="text-xs text-indigo-600 hover:underline font-medium">Details</button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          {rows.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Students', value: rows.length, color: 'text-gray-700' },
                { label: 'Below 75%', value: rows.filter(r => r.attendancePercentage < 75).length, color: 'text-red-600' },
                { label: 'Class Average', value: `${(rows.reduce((s, r) => s + r.attendancePercentage, 0) / rows.length).toFixed(1)}%`, color: 'text-indigo-600' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Mark tab ─────────────────────────────────────────────────────────────────
const MarkTab = ({ course, classStructure }) => {
  const [date, setDate]         = useState(today());
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loaded, setLoaded]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]           = useState(null);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');

  const handleLoad = useCallback(async () => {
    setLoading(true); setError(null); setMsg(null); setLoaded(false);
    try {
      const data = await getOverviewByClassStructure(classStructure.id, course.id);
      setStudents(data);
      const init = {};
      data.forEach(s => { init[s.studentId] = 'PRESENT'; });
      setStatuses(init); setLoaded(true);
    } catch { setError('Failed to load students.'); }
    finally { setLoading(false); }
  }, [classStructure.id, course.id]);

  const toggle  = (id) => setStatuses(p => ({ ...p, [id]: p[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT' }));
  const markAll = (s)  => { const n = {}; students.forEach(st => { n[st.studentId] = s; }); setStatuses(n); };

  const handleSubmit = async () => {
    setSubmitting(true); setMsg(null); setError(null);
    try {
      await markAttendanceBatch(students.map(s => ({ studentId: s.studentId, courseId: course.id, date, status: statuses[s.studentId] ?? 'ABSENT' })));
      setMsg('Attendance submitted successfully!');
    } catch { setError('Failed to submit attendance.'); }
    finally { setSubmitting(false); }
  };

  const displayed = students.filter(s => { const q = search.toLowerCase(); return !q || s.studentName?.toLowerCase().includes(q) || (s.registrationNumber ?? '').toLowerCase().includes(q); });
  const presentCount = Object.values(statuses).filter(s => s === 'PRESENT').length;

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input type="date" value={date} onChange={e => { setDate(e.target.value); setLoaded(false); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <button onClick={handleLoad} disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? 'Loading…' : 'Load Students'}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {loaded && (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {students.length === 0
            ? <p className="p-5 text-sm text-gray-400">No students found for this class.</p>
            : (
              <>
                <div className="px-5 py-3 border-b border-gray-100 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex gap-4 text-xs font-semibold">
                      <span className="text-green-600">✓ Present: {presentCount}</span>
                      <span className="text-red-500">✗ Absent: {students.length - presentCount}</span>
                      <span className="text-gray-400">Total: {students.length}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => markAll('PRESENT')} className="px-3 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200">All Present</button>
                      <button onClick={() => markAll('ABSENT')}  className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200">All Absent</button>
                    </div>
                  </div>
                  <input type="text" placeholder="Search name or reg no…" value={search} onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52" />
                </div>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      {['#', 'Student', 'Reg No', 'Status'].map(h => <th key={h} className="px-5 py-3 text-left">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayed.map((s, i) => (
                      <tr key={s.studentId} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-5 py-3 font-medium text-gray-900">{s.studentName}</td>
                        <td className="px-5 py-3 text-gray-400 text-xs font-mono">{s.registrationNumber || '—'}</td>
                        <td className="px-5 py-3">
                          <button onClick={() => toggle(s.studentId)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${statuses[s.studentId] === 'PRESENT' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                            {statuses[s.studentId] === 'PRESENT' ? '✓ Present' : '✗ Absent'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-4">
                  <button onClick={handleSubmit} disabled={submitting}
                    className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50">
                    {submitting ? 'Submitting…' : 'Submit Attendance'}
                  </button>
                  {msg   && <span className="text-sm text-green-600 font-medium">{msg}</span>}
                  {error && <span className="text-sm text-red-500">{error}</span>}
                </div>
              </>
            )
          }
        </div>
      )}
    </div>
  );
};

// ─── Attendance tabs shell ────────────────────────────────────────────────────
const TABS = [
  { key: 'mark',     label: 'Mark Attendance' },
  { key: 'overview', label: 'Overview' },
];

const AttendanceTabs = ({ course, classStructure }) => {
  const [tab, setTab] = useState('mark');
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-800">{course.name}</p>
        <p className="text-xs text-gray-400 font-mono">{course.code} · Semester {classStructure.semester}</p>
        <FacultyLink facultyId={course.facultyId} facultyName={course.facultyName} />
      </div>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'mark'     && <MarkTab     course={course} classStructure={classStructure} />}
      {tab === 'overview' && <OverviewTab course={course} classStructure={classStructure} />}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const AdminAttendancePage = () => {
  const state = useDropdowns();
  const { selectedCs, selectedCourse } = state;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <Dropdowns state={state} />
      {selectedCs && selectedCourse && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <AttendanceTabs key={`${selectedCs.id}-${selectedCourse.id}`} course={selectedCourse} classStructure={selectedCs} />
        </div>
      )}
    </div>
  );
};

export default AdminAttendancePage;
