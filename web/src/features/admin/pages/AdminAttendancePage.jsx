import { useState, useCallback } from 'react';
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
  useGetOrCreateClassStructureMutation,
} from '../courses/coursesAdminApi';
import toast from 'react-hot-toast';

// ─── level constants ──────────────────────────────────────────────────────────
const L = { BATCH: 0, DEPT: 1, SEMESTER: 2, COURSE: 3, TABS: 4 };

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const Crumb = ({ items, onNav }) => (
  <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        {i > 0 && <span className="text-gray-300">›</span>}
        {i < items.length - 1 ? (
          <button onClick={() => onNav(i)} className="text-indigo-600 hover:underline font-medium">
            {item}
          </button>
        ) : (
          <span className="text-gray-700 font-semibold">{item}</span>
        )}
      </span>
    ))}
  </div>
);

// ─── Step 0: Batch list ───────────────────────────────────────────────────────
const BatchStep = ({ onSelect }) => {
  const { data: batches = [], isLoading } = useGetBatchesQuery();
  if (isLoading) return <p className="text-sm text-gray-400">Loading batches…</p>;
  if (!batches.length) return <p className="text-sm text-gray-400">No batches found.</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-600">Select Batch</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {batches.map((b) => (
          <button key={b.id} onClick={() => onSelect(b)}
            className="p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-left transition-all">
            <p className="text-base font-bold text-gray-900 font-mono">{b.startYear}–{b.endYear}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
              {b.scheme}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Step 1: Dept + Spec ──────────────────────────────────────────────────────
const SpecChips = ({ dept, batch, onSelect }) => {
  const { data: specs = [], isLoading } = useGetSpecializationsByDeptQuery(
    { deptId: dept.id, scheme: batch.scheme }, { skip: !dept.id }
  );
  return (
    <div className="mt-2 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
      <button onClick={() => onSelect(dept, null)}
        className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700">
        All
      </button>
      {isLoading ? <span className="text-xs text-gray-400">Loading…</span> : specs.map((s) => (
        <button key={s.id} onClick={() => onSelect(dept, s)}
          className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700">
          {s.name}
        </button>
      ))}
    </div>
  );
};

const DeptStep = ({ batch, onSelect, onBack }) => {
  const { data: depts = [], isLoading } = useGetDepartmentsQuery();
  if (isLoading) return <p className="text-sm text-gray-400">Loading departments…</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-600">Select Department</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {depts.map((d) => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 transition-colors">
            <p className="text-sm font-bold text-gray-900">{d.name}</p>
            <SpecChips dept={d} batch={batch} onSelect={onSelect} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Step 2: Semester grid ────────────────────────────────────────────────────
const YEAR_GROUPS = [
  { year: 1, label: 'Year 1', sems: [1, 2] },
  { year: 2, label: 'Year 2', sems: [3, 4] },
  { year: 3, label: 'Year 3', sems: [5, 6] },
];

const SemesterStep = ({ batch, dept, spec, onSelect }) => {
  const { data: structures = [], isLoading } = useGetClassStructureQuery(
    { batchId: batch.id, deptId: dept.id, specId: spec?.id ?? undefined },
    { skip: !batch.id || !dept.id }
  );
  const [getOrCreate, { isLoading: creating }] = useGetOrCreateClassStructureMutation();

  const existingMap = Object.fromEntries(
    structures.map((cs) => [`${cs.yearOfStudy}-${cs.semester}`, cs])
  );

  const handleClick = async (yearOfStudy, semester) => {
    const key = `${yearOfStudy}-${semester}`;
    if (existingMap[key]) { onSelect(existingMap[key]); return; }
    try {
      const cs = await getOrCreate({
        batchId: batch.id, departmentId: dept.id,
        specializationId: spec?.id ?? null, yearOfStudy, semester,
      }).unwrap();
      onSelect(cs);
    } catch { toast.error('Failed to open semester.'); }
  };

  if (isLoading) return <p className="text-sm text-gray-400">Loading semesters…</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-600">Select Semester</p>
      {YEAR_GROUPS.map(({ year, label, sems }) => (
        <div key={year}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
          <div className="grid grid-cols-2 gap-3">
            {sems.map((sem) => {
              const exists = !!existingMap[`${year}-${sem}`];
              return (
                <button key={sem} onClick={() => handleClick(year, sem)} disabled={creating}
                  className={`py-5 rounded-xl border-2 text-sm font-bold transition-all disabled:opacity-50 ${
                    exists
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      : 'border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-600'
                  }`}>
                  Semester {sem}
                  {exists && <span className="block text-xs font-normal text-indigo-400 mt-0.5">configured</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Step 3: Course list ──────────────────────────────────────────────────────
const CourseStep = ({ classStructure, onSelect }) => {
  const { data: courses = [], isLoading } = useGetAdminCoursesQuery(classStructure.id);
  if (isLoading) return <p className="text-sm text-gray-400">Loading courses…</p>;
  if (!courses.length) return <p className="text-sm text-gray-400">No courses assigned to this semester.</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-600">Select Course</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {courses.map((c) => (
          <button key={c.id} onClick={() => onSelect(c)}
            className="p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-left transition-all">
            <p className="text-sm font-bold text-gray-800">{c.name}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{c.code}{c.credits ? ` · ${c.credits} cr` : ''}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── helpers ─────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

const pctBg  = (p) => p >= 75 ? 'bg-green-100 text-green-700' : p >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
const pctBar = (p) => p >= 75 ? 'bg-green-500' : p >= 50 ? 'bg-yellow-400' : 'bg-red-500';

const fmt = (d) => {
  if (!d) return '—';
  if (Array.isArray(d)) return `${d[0]}-${String(d[1]).padStart(2,'0')}-${String(d[2]).padStart(2,'0')}`;
  return d;
};

// ─── Student detail panel ──────────────────────────────────────────────────
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
              {present.map((d) => (
                <span key={fmt(d)} className="px-2 py-1 rounded-lg text-xs bg-green-50 text-green-700 border border-green-100">{fmt(d)}</span>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold text-red-600 mb-2">✗ Absent ({absent.length})</p>
          {absent.length === 0 ? <p className="text-xs text-gray-400">No records</p> : (
            <div className="flex flex-wrap gap-1.5">
              {absent.map((d) => (
                <span key={fmt(d)} className="px-2 py-1 rounded-lg text-xs bg-red-50 text-red-700 border border-red-100">{fmt(d)}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Overview tab ─────────────────────────────────────────────────────────────────
const OverviewTab = ({ course, classStructure }) => {
  const [rows, setRows]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');
  const [sortBy, setSortBy]       = useState('reg');
  const [sortDir, setSortDir]     = useState('asc');
  const [selStudent, setSelStudent] = useState(null);

  const handleLoad = useCallback(async () => {
    setLoading(true); setError(null); setSelStudent(null);
    try {
      const data = await getOverviewByClassStructure(classStructure.id, course.id);
      setRows(data);
    } catch { setError('Failed to load overview.'); }
    finally { setLoading(false); }
  }, [classStructure.id, course.id]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filtered = (rows ?? []).filter((r) => {
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

  if (selStudent) return (
    <StudentDetail student={selStudent} courseName={course.name} onBack={() => setSelStudent(null)} />
  );

  return (
    <div className="space-y-4">
      <button onClick={handleLoad} disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {loading ? 'Loading…' : rows === null ? 'Load Overview' : 'Refresh'}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {rows !== null && (
        <div className="space-y-3">
          {/* Controls */}
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name / reg no…"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52" />
              <select value={filter} onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Students</option>
                <option value="low">Below 75%</option>
                <option value="ok">75% and above</option>
              </select>
            </div>
            <p className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left cursor-pointer select-none hover:text-gray-700"
                    onClick={() => toggleSort('name')}>
                    Student {sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th className="px-5 py-3 text-left cursor-pointer select-none hover:text-gray-700"
                    onClick={() => toggleSort('reg')}>
                    Reg No {sortBy === 'reg' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th className="px-5 py-3 text-left">Present</th>
                  <th className="px-5 py-3 text-left">Total</th>
                  <th className="px-5 py-3 text-left cursor-pointer select-none hover:text-gray-700"
                    onClick={() => toggleSort('pct')}>
                    % {sortBy === 'pct' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                  </th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-gray-400">No students found.</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{r.studentName}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs font-mono">{r.registrationNumber || '—'}</td>
                    <td className="px-5 py-3 text-green-600 font-semibold">{r.attendedClasses}</td>
                    <td className="px-5 py-3 text-gray-500">{r.totalClasses}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${pctBg(r.attendancePercentage)}`}>
                        {r.attendancePercentage}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelStudent(r)}
                        className="text-xs text-indigo-600 hover:underline font-medium">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary cards */}
          {rows.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Students', value: rows.length,                                                                          color: 'text-gray-700' },
                { label: 'Below 75%',      value: rows.filter((r) => r.attendancePercentage < 75).length,                               color: 'text-red-600'  },
                { label: 'Class Average',  value: `${(rows.reduce((s, r) => s + r.attendancePercentage, 0) / rows.length).toFixed(1)}%`, color: 'text-indigo-600' },
              ].map((s) => (
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
  const [date, setDate]             = useState(today());
  const [students, setStudents]     = useState([]);
  const [statuses, setStatuses]     = useState({});
  const [loaded, setLoaded]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg]               = useState(null);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [sortKey, setSortKey]       = useState('reg');
  const [sortDir, setSortDir]       = useState('asc');

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const displayStudents = [...students]
    .filter((s) => {
      const q = search.toLowerCase();
      return !q || s.studentName?.toLowerCase().includes(q) || (s.registrationNumber ?? '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const va = sortKey === 'reg' ? (a.registrationNumber ?? '') : a.studentName ?? '';
      const vb = sortKey === 'reg' ? (b.registrationNumber ?? '') : b.studentName ?? '';
      const cmp = va.localeCompare(vb);
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const handleLoad = useCallback(async () => {
    setLoading(true); setError(null); setMsg(null); setLoaded(false);
    try {
      const data = await getOverviewByClassStructure(classStructure.id, course.id);
      setStudents(data);
      const init = {};
      data.forEach((s) => { init[s.studentId] = 'PRESENT'; });
      setStatuses(init);
      setLoaded(true);
    } catch { setError('Failed to load students.'); }
    finally { setLoading(false); }
  }, [classStructure.id, course.id]);

  const toggle = (id) =>
    setStatuses((p) => ({ ...p, [id]: p[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT' }));

  const markAll = (status) => {
    const next = {};
    students.forEach((s) => { next[s.studentId] = status; });
    setStatuses(next);
  };

  const handleSubmit = async () => {
    setSubmitting(true); setMsg(null); setError(null);
    try {
      await markAttendanceBatch(
        students.map((s) => ({
          studentId: s.studentId,
          courseId:  course.id,
          date,
          status:    statuses[s.studentId] ?? 'ABSENT',
        }))
      );
      setMsg('Attendance submitted successfully!');
    } catch { setError('Failed to submit attendance.'); }
    finally { setSubmitting(false); }
  };

  const presentCount = Object.values(statuses).filter((s) => s === 'PRESENT').length;
  const SortBtn = ({ k, label }) => (
    <button onClick={() => toggleSort(k)}
      className={`px-2 py-1 text-xs rounded font-medium border transition-colors ${
        sortKey === k ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-500 hover:border-indigo-400'
      }`}>
      {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input type="date" value={date}
            onChange={(e) => { setDate(e.target.value); setLoaded(false); }}
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
          {students.length === 0 ? (
            <p className="p-5 text-sm text-gray-400">No students found for this class.</p>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-gray-100 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex gap-4 text-xs font-semibold">
                    <span className="text-green-600">✓ Present: {presentCount}</span>
                    <span className="text-red-500">✗ Absent: {students.length - presentCount}</span>
                    <span className="text-gray-400">Total: {students.length}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => markAll('PRESENT')}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
                      All Present
                    </button>
                    <button onClick={() => markAll('ABSENT')}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200">
                      All Absent
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="text" placeholder="Search name or reg no…" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52" />
                  <span className="text-xs text-gray-400">Sort:</span>
                  <SortBtn k="reg" label="Reg No" />
                  <SortBtn k="name" label="Name" />
                  {search && <span className="text-xs text-gray-400">{displayStudents.length} shown</span>}
                </div>
              </div>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-5 py-3 text-left">Student</th>
                    <th className="px-5 py-3 text-left">Reg No</th>
                    <th className="px-5 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayStudents.map((s, i) => (
                    <tr key={s.studentId} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{s.studentName}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs font-mono">{s.registrationNumber || '—'}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => toggle(s.studentId)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            statuses[s.studentId] === 'PRESENT'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}>
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
          )}
        </div>
      )}
    </div>
  );
};

// ─── Attendance tabs shell ──────────────────────────────────────────────────
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
      </div>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'mark'     && <MarkTab course={course} classStructure={classStructure} />}
      {tab === 'overview' && <OverviewTab course={course} classStructure={classStructure} />}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const AdminAttendancePage = () => {
  const [level, setLevel]               = useState(L.BATCH);
  const [batch, setBatch]               = useState(null);
  const [dept, setDept]                 = useState(null);
  const [spec, setSpec]                 = useState(null);
  const [classStructure, setClassStructure] = useState(null);
  const [course, setCourse]             = useState(null);

  const goTo = (lv) => {
    if (lv <= L.BATCH)    { setBatch(null); setDept(null); setSpec(null); setClassStructure(null); setCourse(null); }
    if (lv <= L.DEPT)     { setDept(null); setSpec(null); setClassStructure(null); setCourse(null); }
    if (lv <= L.SEMESTER) { setClassStructure(null); setCourse(null); }
    if (lv <= L.COURSE)   { setCourse(null); }
    setLevel(lv);
  };

  const crumbs = [
    'Attendance',
    ...(batch          ? [`${batch.startYear}–${batch.endYear} (${batch.scheme})`] : []),
    ...(dept           ? [dept.name + (spec ? ` · ${spec.name}` : '')] : []),
    ...(classStructure ? [`Sem ${classStructure.semester}`] : []),
    ...(course         ? [course.name] : []),
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>

      <Crumb items={crumbs} onNav={(i) => goTo(i)} />

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {level === L.BATCH && (
          <BatchStep onSelect={(b) => { setBatch(b); setLevel(L.DEPT); }} />
        )}
        {level === L.DEPT && batch && (
          <DeptStep batch={batch} onSelect={(d, s) => { setDept(d); setSpec(s); setLevel(L.SEMESTER); }} />
        )}
        {level === L.SEMESTER && batch && dept && (
          <SemesterStep batch={batch} dept={dept} spec={spec}
            onSelect={(cs) => { setClassStructure(cs); setLevel(L.COURSE); }} />
        )}
        {level === L.COURSE && classStructure && (
          <CourseStep classStructure={classStructure}
            onSelect={(c) => { setCourse(c); setLevel(L.TABS); }} />
        )}
        {level === L.TABS && course && classStructure && (
          <AttendanceTabs course={course} classStructure={classStructure} />
        )}
      </div>
    </div>
  );
};

export default AdminAttendancePage;
