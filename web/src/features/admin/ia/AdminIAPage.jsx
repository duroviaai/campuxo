import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetBatchesQuery,
  useGetDepartmentsQuery,
  useGetSpecializationsByDeptQuery,
  useGetClassStructureQuery,
  useGetAdminCoursesQuery,
  useGetOrCreateClassStructureMutation,
} from '../courses/coursesAdminApi';
import { useGetIAMarksQuery, useSaveIAMarksMutation, useGetAssignmentsQuery, useSaveAssignmentsMutation, useGetSeminarsQuery, useSaveSeminarsMutation } from './iaApi';
import ROUTES from '../../../app/routes/routeConstants';

const L = { BATCH: 0, DEPT: 1, SEMESTER: 2, COURSE: 3, IA: 4 };

// ─── IA business logic ────────────────────────────────────────────────────────
// IA1 & IA2 are out of 20. Student needs IA3 if absent OR scored < 35% in either.
// Scaling: each IA → /10 via ceil(raw / 2).  e.g. 15 → 8, 16 → 8, 17 → 9
// Final = best 2 of {IA1, IA2, IA3} scaled scores → total /20

const scaleToTen = (raw) => Math.ceil(Number(raw) / 2);

const needsIA3 = (r) => {
  const ia1 = r.marks?.[1]; const max1 = Number(r.maxMarks?.[1] ?? 20);
  const ia2 = r.marks?.[2]; const max2 = Number(r.maxMarks?.[2] ?? 20);
  const absent1 = ia1 === undefined;
  const absent2 = ia2 === undefined;
  const fail1   = !absent1 && Number(ia1) < 0.35 * max1;
  const fail2   = !absent2 && Number(ia2) < 0.35 * max2;
  return absent1 || absent2 || fail1 || fail2;
};

const computeFinal = (r) => {
  const candidates = [1, 2, 3]
    .filter((n) => r.marks?.[n] !== undefined)
    .map((n) => ({ n, scaled: scaleToTen(r.marks[n]) }))
    .sort((a, b) => b.scaled - a.scaled);
  if (!candidates.length) return null;
  const best = candidates.slice(0, 2);
  return { total: best.reduce((s, c) => s + c.scaled, 0), used: best.map((c) => c.n) };
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const Crumb = ({ items, onNav }) => (
  <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        {i > 0 && <span className="text-gray-300">›</span>}
        {i < items.length - 1
          ? <button onClick={() => onNav(i)} className="text-indigo-600 hover:underline font-medium">{item}</button>
          : <span className="text-gray-700 font-semibold">{item}</span>}
      </span>
    ))}
  </div>
);

// ─── Shared faculty link ─────────────────────────────────────────────────────
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

// ─── Step 0: Batch ────────────────────────────────────────────────────────────
const BatchStep = ({ onSelect }) => {
  const { data: batches = [], isLoading } = useGetBatchesQuery();
  if (isLoading) return <p className="text-sm text-gray-400">Loading batches…</p>;
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
        className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700">All</button>
      {isLoading ? <span className="text-xs text-gray-400">Loading…</span> : specs.map((s) => (
        <button key={s.id} onClick={() => onSelect(dept, s)}
          className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700">
          {s.name}
        </button>
      ))}
    </div>
  );
};

const DeptStep = ({ batch, onSelect }) => {
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

// ─── Step 2: Semester ─────────────────────────────────────────────────────────
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
  const existingMap = Object.fromEntries(structures.map((cs) => [`${cs.yearOfStudy}-${cs.semester}`, cs]));

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

// ─── Step 3: Course ───────────────────────────────────────────────────────────
const CourseStep = ({ classStructure, onSelect }) => {
  const { data: courses = [], isLoading } = useGetAdminCoursesQuery({ classStructureId: classStructure.id });
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
            {c.facultyName && <FacultyLink facultyId={c.facultyId} facultyName={c.facultyName} />}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Step 4: IA Panel ─────────────────────────────────────────────────────────
const IAPanel = ({ course, classStructure }) => {
  const [activeIA, setActiveIA] = useState(1);
  const [maxMarks, setMaxMarks] = useState('20');
  const [iaDate, setIaDate] = useState('');
  const [localMarks, setLocalMarks] = useState({});
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('reg');
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortBtn = ({ k, label }) => (
    <button onClick={() => toggleSort(k)}
      className={`px-2 py-1 text-xs rounded font-medium border transition-colors ${
        sortKey === k ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-500 hover:border-indigo-400'
      }`}>
      {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
    </button>
  );

  const { data: rows = [], isLoading, isFetching } = useGetIAMarksQuery({
    classStructureId: classStructure.id,
    courseId: course.id,
  });
  const [saveMarks, { isLoading: saving }] = useSaveIAMarksMutation();

  useEffect(() => {
    const init = {};
    let detectedMax = '20';
    let detectedDate = '';
    rows.forEach((r) => {
      const m  = r.marks?.[activeIA];
      const mx = r.maxMarks?.[activeIA];
      const dt = r.dates?.[activeIA];
      init[r.studentId] = { marks: m !== undefined ? String(m) : '', date: dt ?? '' };
      if (mx !== undefined) detectedMax = String(mx);
      if (dt && !detectedDate) detectedDate = dt;
    });
    setLocalMarks(init);
    setMaxMarks(detectedMax);
    setIaDate(detectedDate);
  }, [rows, activeIA]);

  const handleSave = async () => {
    const max = parseFloat(maxMarks);
    if (!max || max <= 0) { toast.error('Max marks must be > 0'); return; }

    // For IA3, only save eligible students
    const eligibleIds = new Set(rows.filter(needsIA3).map((r) => r.studentId));
    const marksToSave = rows
      .filter((r) => activeIA !== 3 || eligibleIds.has(r.studentId))
      .map((r) => ({
        studentId: r.studentId,
        marksObtained: parseFloat(localMarks[r.studentId]?.marks ?? 0) || 0,
        submittedDate: localMarks[r.studentId]?.date || null,
      }));

    try {
      await saveMarks({
        classStructureId: classStructure.id,
        courseId: course.id,
        iaNumber: activeIA,
        maxMarks: max,
        iaDate: iaDate || null,
        marks: marksToSave,
      }).unwrap();
      toast.success(`IA ${activeIA} marks saved!`);
    } catch {
      toast.error('Failed to save marks.');
    }
  };

  const ia3EligibleCount = rows.filter(needsIA3).length;
  const filledCount = rows.filter((r) => r.marks?.[activeIA] !== undefined).length;

  const displayRows = [...rows]
    .filter((r) => {
      const q = search.toLowerCase();
      return !q || r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let va, vb;
      if (sortKey === 'reg') { va = a.registrationNumber ?? ''; vb = b.registrationNumber ?? ''; }
      else if (sortKey === 'name') { va = a.studentName ?? ''; vb = b.studentName ?? ''; }
      else { va = computeFinal(a)?.total ?? -1; vb = computeFinal(b)?.total ?? -1; }
      const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  return (
    <div className="space-y-4">
      {/* IA tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[1, 2, 3].map((n) => (
          <button key={n} onClick={() => setActiveIA(n)}
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-colors ${
              activeIA === n ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            IA {n}
            {n === 3 && ia3EligibleCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                {ia3EligibleCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* IA3 info banner */}
      {activeIA === 3 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 space-y-1">
          <p><span className="font-semibold">Who writes IA3?</span> Students absent for IA1 or IA2, or who scored below 35% (&lt;7/20) in either.</p>
          <p><span className="font-semibold">Scaling:</span> Each IA is out of 20, scaled to /10 using ⌈marks ÷ 2⌉ — e.g. 15 → 8, 16 → 8, 17 → 9, 18 → 9, 19 → 10.</p>
          <p><span className="font-semibold">Final:</span> Best 2 of IA1, IA2, IA3 (scaled) are added → total out of 20.</p>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading students…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400">No students found for this class.</p>
      ) : (
        <div className="space-y-3">
          {/* Search + Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text" placeholder="Search name or reg no…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
            />
            <span className="text-xs text-gray-400">Sort:</span>
            <SortBtn k="reg" label="Reg No" />
            <SortBtn k="name" label="Name" />
            <SortBtn k="final" label="Final" />
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-medium text-gray-500">Max Marks (IA {activeIA})</label>
            <input type="number" min="1" value={maxMarks}
              onChange={(e) => setMaxMarks(e.target.value)}
              className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <label className="text-xs font-medium text-gray-500">IA {activeIA} Date</label>
            <input type="date" value={iaDate} onChange={(e) => setIaDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <span className="text-xs text-gray-400">{filledCount}/{rows.length} filled</span>
            {activeIA === 3 && ia3EligibleCount > 0 && (
              <span className="text-xs font-semibold text-amber-600">
                {ia3EligibleCount} student{ia3EligibleCount > 1 ? 's' : ''} eligible
              </span>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Reg No</th>
                  <th className="px-4 py-3 text-left">IA1 /20→/10</th>
                  <th className="px-4 py-3 text-left">IA2 /20→/10</th>
                  <th className="px-4 py-3 text-left">IA3 /20→/10</th>
                  <th className="px-4 py-3 text-left">Final /20</th>
                  <th className="px-4 py-3 text-left">Enter IA {activeIA}</th>
                  <th className="px-4 py-3 text-left">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayRows.map((r, i) => {
                  const eligible = needsIA3(r);
                  const final    = computeFinal(r);
                  const dimRow   = activeIA === 3 && !eligible;
                  return (
                    <tr key={r.studentId} className={`hover:bg-gray-50 ${dimRow ? 'opacity-40' : ''}`}>
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.studentName}
                        {eligible && (
                          <span className="ml-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                            IA3
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.registrationNumber || '—'}</td>

                      {/* IA1, IA2, IA3 columns */}
                      {[1, 2, 3].map((n) => {
                        const raw    = r.marks?.[n];
                        const mx     = Number(r.maxMarks?.[n] ?? 20);
                        const scaled = raw !== undefined ? scaleToTen(raw) : null;
                        const isUsed = final?.used?.includes(n);
                        const isFail = raw !== undefined && Number(raw) < 0.35 * mx;
                        const isAbsent = n <= 2 && raw === undefined && eligible;
                        return (
                          <td key={n} className="px-4 py-3">
                            {raw !== undefined ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isUsed    ? 'bg-green-100 text-green-700'
                                : isFail  ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600'
                              }`}>
                                {raw}/{mx}→{scaled}
                                {isUsed && <span>✓</span>}
                              </span>
                            ) : isAbsent ? (
                              <span className="text-xs font-semibold text-red-400">Absent</span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Final /20 */}
                      <td className="px-4 py-3">
                        {final ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            final.total >= 14 ? 'bg-green-100 text-green-700'
                            : final.total >= 10 ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-600'
                          }`}>
                            {final.total}/20
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </td>

                      {/* Input cell */}
                      <td className="px-4 py-3">
                        {activeIA !== 3 || eligible ? (
                          <input
                            type="number" min="0" max={maxMarks}
                            value={localMarks[r.studentId]?.marks ?? ''}
                            onChange={(e) => setLocalMarks((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], marks: e.target.value } }))}
                            placeholder="0"
                            className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="text-gray-300 text-xs">N/A</span>
                        )}
                      </td>
                      {/* Submitted Date */}
                      <td className="px-4 py-3">
                        {activeIA !== 3 || eligible ? (
                          <input type="date"
                            value={localMarks[r.studentId]?.date ?? ''}
                            onChange={(e) => setLocalMarks((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], date: e.target.value } }))}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        ) : <span className="text-gray-300 text-xs">N/A</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save + class avg */}
          <div className="flex items-center gap-4 pt-1 flex-wrap">
            <button onClick={handleSave} disabled={saving || isFetching}
              className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving…' : `Save IA ${activeIA} Marks`}
            </button>
            {(() => {
              const finals = rows.map(computeFinal).filter(Boolean);
              if (!finals.length) return null;
              const avg = finals.reduce((s, f) => s + f.total, 0) / finals.length;
              return (
                <span className="text-xs text-gray-500">
                  Class final avg: <span className="font-semibold text-indigo-600">{avg.toFixed(1)}/20</span>
                </span>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Assignment Panel ─────────────────────────────────────────────────────────
const AssignmentPanel = ({ course, classStructure }) => {
  const [maxMarks, setMaxMarks] = useState('10');
  const [date, setDate] = useState('');
  const [local, setLocal] = useState({});
  const [search, setSearch] = useState('');
  const { data: rows = [], isLoading, isFetching } = useGetAssignmentsQuery({ classStructureId: classStructure.id, courseId: course.id });
  const [save, { isLoading: saving }] = useSaveAssignmentsMutation();

  useEffect(() => {
    const init = {}; let detectedMax = '10'; let detectedDate = '';
    rows.forEach((r) => {
      init[r.studentId] = { submitted: r.submitted ?? false, marks: r.marksObtained != null ? String(r.marksObtained) : '' };
      if (r.maxMarks != null) detectedMax = String(r.maxMarks);
      if (r.assignmentDate && !detectedDate) detectedDate = r.assignmentDate;
    });
    setLocal(init); setMaxMarks(detectedMax); setDate(detectedDate);
  }, [rows]);

  const toggle = (id) => setLocal((p) => ({ ...p, [id]: { ...p[id], submitted: !p[id]?.submitted } }));
  const setMarks = (id, val) => setLocal((p) => ({ ...p, [id]: { ...p[id], marks: val } }));

  const handleSave = async () => {
    const max = parseFloat(maxMarks);
    if (!max || max <= 0) { toast.error('Max marks must be > 0'); return; }
    try {
      await save({ classStructureId: classStructure.id, courseId: course.id, maxMarks: max,
        assignmentDate: date || null,
        records: rows.map((r) => ({ studentId: r.studentId, submitted: local[r.studentId]?.submitted ?? false,
          marksObtained: local[r.studentId]?.marks ? parseFloat(local[r.studentId].marks) : null })) }).unwrap();
      toast.success('Assignment records saved!');
    } catch { toast.error('Failed to save.'); }
  };

  const displayed = rows.filter((r) => { const q = search.toLowerCase(); return !q || r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q); });
  const submittedCount = rows.filter((r) => local[r.studentId]?.submitted).length;

  if (isLoading) return <p className="text-sm text-gray-400">Loading students…</p>;
  if (!rows.length) return <p className="text-sm text-gray-400">No students found for this class.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Max Marks</label>
          <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)}
            className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Assignment Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <p className="text-xs text-gray-500 mt-4">Submitted: <span className="text-green-600 font-semibold">{submittedCount}</span> / {rows.length}</p>
        <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 mt-4" />
      </div>
      <div className="rounded-xl border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Reg No</th>
              <th className="px-4 py-3 text-center">Submitted</th>
              <th className="px-4 py-3 text-left">Marks / {maxMarks}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map((r, i) => {
              const isSubmitted = local[r.studentId]?.submitted ?? false;
              return (
                <tr key={r.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.studentName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.registrationNumber || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggle(r.studentId)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        isSubmitted ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}>
                      {isSubmitted ? '✓ Submitted' : '✗ Not Submitted'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min="0" max={maxMarks} value={local[r.studentId]?.marks ?? ''}
                      onChange={(e) => setMarks(r.studentId, e.target.value)} placeholder="0"
                      disabled={!isSubmitted}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:bg-gray-50" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={handleSave} disabled={saving || isFetching}
        className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save Assignment Records'}
      </button>
    </div>
  );
};

// ─── Seminar Panel ────────────────────────────────────────────────────────────
const SeminarPanel = ({ course, classStructure }) => {
  const [maxMarks, setMaxMarks] = useState('10');
  const [date, setDate] = useState('');
  const [local, setLocal] = useState({});
  const [search, setSearch] = useState('');
  const { data: rows = [], isLoading, isFetching } = useGetSeminarsQuery({ classStructureId: classStructure.id, courseId: course.id });
  const [save, { isLoading: saving }] = useSaveSeminarsMutation();

  useEffect(() => {
    const init = {}; let detectedMax = '10'; let detectedDate = '';
    rows.forEach((r) => {
      init[r.studentId] = { done: r.done ?? false, scriptSubmitted: r.scriptSubmitted ?? false,
        marks: r.marksObtained != null ? String(r.marksObtained) : '',
        submittedDate: r.submittedDate ?? '' };
      if (r.maxMarks != null) detectedMax = String(r.maxMarks);
      if (r.seminarDate && !detectedDate) detectedDate = r.seminarDate;
    });
    setLocal(init); setMaxMarks(detectedMax); setDate(detectedDate);
  }, [rows]);

  const toggleField = (id, field) => setLocal((p) => ({ ...p, [id]: { ...p[id], [field]: !p[id]?.[field] } }));
  const setMarks = (id, val) => setLocal((p) => ({ ...p, [id]: { ...p[id], marks: val } }));

  const handleSave = async () => {
    const max = parseFloat(maxMarks);
    if (!max || max <= 0) { toast.error('Max marks must be > 0'); return; }
    try {
      await save({ classStructureId: classStructure.id, courseId: course.id, maxMarks: max,
        seminarDate: date || null,
        records: rows.map((r) => ({ studentId: r.studentId, done: local[r.studentId]?.done ?? false,
          scriptSubmitted: local[r.studentId]?.scriptSubmitted ?? false,
          marksObtained: local[r.studentId]?.marks ? parseFloat(local[r.studentId].marks) : null,
          submittedDate: local[r.studentId]?.submittedDate || null })) }).unwrap();
      toast.success('Seminar records saved!');
    } catch { toast.error('Failed to save.'); }
  };

  const displayed = rows.filter((r) => { const q = search.toLowerCase(); return !q || r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q); });
  const doneCount   = rows.filter((r) => local[r.studentId]?.done).length;
  const scriptCount = rows.filter((r) => local[r.studentId]?.scriptSubmitted).length;

  if (isLoading) return <p className="text-sm text-gray-400">Loading students…</p>;
  if (!rows.length) return <p className="text-sm text-gray-400">No students found for this class.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Max Marks</label>
          <input type="number" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)}
            className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Seminar Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="text-xs text-gray-500 mt-4 flex gap-4">
          <span>Done: <span className="text-indigo-600 font-semibold">{doneCount}</span>/{rows.length}</span>
          <span>Script: <span className="text-indigo-600 font-semibold">{scriptCount}</span>/{rows.length}</span>
        </div>
        <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52 mt-4" />
      </div>
      <div className="rounded-xl border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Reg No</th>
              <th className="px-4 py-3 text-center">Seminar Done</th>
              <th className="px-4 py-3 text-center">Script Submitted</th>
              <th className="px-4 py-3 text-left">Marks / {maxMarks}</th>
              <th className="px-4 py-3 text-left">Submitted Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map((r, i) => {
              const isDone    = local[r.studentId]?.done ?? false;
              const hasScript = local[r.studentId]?.scriptSubmitted ?? false;
              return (
                <tr key={r.studentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.studentName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{r.registrationNumber || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleField(r.studentId, 'done')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        isDone ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}>
                      {isDone ? '✓ Done' : 'Pending'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleField(r.studentId, 'scriptSubmitted')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        hasScript ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}>
                      {hasScript ? '✓ Submitted' : 'Not Submitted'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" min="0" max={maxMarks} value={local[r.studentId]?.marks ?? ''}
                      onChange={(e) => setMarks(r.studentId, e.target.value)} placeholder="0"
                      disabled={!isDone}
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:bg-gray-50" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date"
                      value={local[r.studentId]?.submittedDate ?? ''}
                      onChange={(e) => setLocal((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], submittedDate: e.target.value } }))}
                      disabled={!isDone}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:bg-gray-50" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="date"
                      value={local[r.studentId]?.submittedDate ?? ''}
                      onChange={(e) => setLocal((p) => ({ ...p, [r.studentId]: { ...p[r.studentId], submittedDate: e.target.value } }))}
                      disabled={!isDone}
                      className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-40 disabled:bg-gray-50" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={handleSave} disabled={saving || isFetching}
        className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {saving ? 'Saving…' : 'Save Seminar Records'}
      </button>
    </div>
  );
};

// ─── Course Panel (IA + Assignment + Seminar tabs) ────────────────────────────
const CoursePanel = ({ course, classStructure }) => {
  const [tab, setTab] = useState('ia');
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-800">{course.name}</p>
        <p className="text-xs text-gray-400 font-mono">{course.code} · Semester {classStructure.semester}</p>
        {course.facultyName && <FacultyLink facultyId={course.facultyId} facultyName={course.facultyName} />}
      </div>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {[['ia', 'Internal Assessment'], ['assignment', 'Assignment'], ['seminar', 'Seminar']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              tab === key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>{label}</button>
        ))}
      </div>
      {tab === 'ia'         && <IAPanel        course={course} classStructure={classStructure} />}
      {tab === 'assignment' && <AssignmentPanel course={course} classStructure={classStructure} />}
      {tab === 'seminar'    && <SeminarPanel    course={course} classStructure={classStructure} />}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const AdminIAPage = () => {
  const [level, setLevel]                   = useState(L.BATCH);
  const [batch, setBatch]                   = useState(null);
  const [dept, setDept]                     = useState(null);
  const [spec, setSpec]                     = useState(null);
  const [classStructure, setClassStructure] = useState(null);
  const [course, setCourse]                 = useState(null);

  const goTo = (lv) => {
    if (lv <= L.BATCH)    { setBatch(null); setDept(null); setSpec(null); setClassStructure(null); setCourse(null); }
    if (lv <= L.DEPT)     { setDept(null); setSpec(null); setClassStructure(null); setCourse(null); }
    if (lv <= L.SEMESTER) { setClassStructure(null); setCourse(null); }
    if (lv <= L.COURSE)   { setCourse(null); }
    setLevel(lv);
  };

  const crumbs = [
    'Internal Assessment',
    ...(batch          ? [`${batch.startYear}–${batch.endYear} (${batch.scheme})`] : []),
    ...(dept           ? [dept.name + (spec ? ` · ${spec.name}` : '')] : []),
    ...(classStructure ? [`Sem ${classStructure.semester}`] : []),
    ...(course         ? [course.name] : []),
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <Crumb items={crumbs} onNav={(i) => goTo(i)} />
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {level === L.BATCH && <BatchStep onSelect={(b) => { setBatch(b); setLevel(L.DEPT); }} />}
        {level === L.DEPT && batch && <DeptStep batch={batch} onSelect={(d, s) => { setDept(d); setSpec(s); setLevel(L.SEMESTER); }} />}
        {level === L.SEMESTER && batch && dept && <SemesterStep batch={batch} dept={dept} spec={spec} onSelect={(cs) => { setClassStructure(cs); setLevel(L.COURSE); }} />}
        {level === L.COURSE && classStructure && <CourseStep classStructure={classStructure} onSelect={(c) => { setCourse(c); setLevel(L.IA); }} />}
        {level === L.IA && course && classStructure && <CoursePanel course={course} classStructure={classStructure} />}
      </div>
    </div>
  );
};

export default AdminIAPage;
