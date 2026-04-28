import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetBatchesQuery,
  useGetSpecializationsByDeptQuery,
  useGetClassStructureQuery,
  useGetAdminCoursesQuery,
} from '../../admin/courses/coursesAdminApi';
import {
  useGetHodDeptQuery,
  useGetHodFacultyQuery,
  useAssignFacultyToCourseMutation,
  useChangeFacultyForCourseMutation,
  useGetHodCourseStudentsPerformanceQuery,
} from '../state/hodApi';
import { Modal, Btn, SelectInput, Badge, PctBar } from '../../../shared/components/ui/PageShell';
import HodAttendancePage from './HodAttendancePage';
import HodIAPage from './HodIAPage';

const CATALOG_TABS = [
  { key: 'courses',  label: 'Programs' },
  { key: 'attend',   label: 'Dept Attendance' },
  { key: 'ia',       label: 'Dept IA' },
];

const L = { BATCH: 0, SEMESTER: 1, COURSES: 2, DETAIL: 3 };

const pctColor = (p) => p >= 75 ? '#059669' : p >= 50 ? '#d97706' : '#dc2626';

// ── Breadcrumb ────────────────────────────────────────────────────────────────
const Crumb = ({ items, onNav }) => (
  <div className="flex items-center gap-1 text-xs flex-wrap" style={{ color: '#64748b' }}>
    {items.map((item, i) => (
      <span key={i} className="flex items-center gap-1">
        {i > 0 && <span style={{ color: '#cbd5e1' }}>›</span>}
        {i < items.length - 1
          ? <button onClick={() => onNav(i)} className="font-medium hover:underline" style={{ color: '#7c3aed' }}>{item}</button>
          : <span className="font-semibold" style={{ color: '#334155' }}>{item}</span>}
      </span>
    ))}
  </div>
);

// ── Step 0: Batch ─────────────────────────────────────────────────────────────
const BatchStep = ({ onSelect }) => {
  const { data: batches = [], isLoading } = useGetBatchesQuery();
  if (isLoading) return <p className="text-sm" style={{ color: '#94a3b8' }}>Loading batches…</p>;
  if (!batches.length) return <p className="text-sm" style={{ color: '#94a3b8' }}>No batches found.</p>;
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium" style={{ color: '#64748b' }}>Select Batch</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {batches.map(b => (
          <button key={b.id} onClick={() => onSelect(b)}
            className="p-4 rounded-xl text-left transition-all"
            style={{ border: '2px solid #e2e8f0' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = '#f5f3ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = ''; }}>
            <p className="text-base font-bold font-mono" style={{ color: '#0f172a' }}>{b.startYear}–{b.endYear}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>{b.scheme}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Step 1: Semester ──────────────────────────────────────────────────────────
const YEAR_GROUPS = [
  { year: 1, label: 'Year 1', sems: [1, 2] },
  { year: 2, label: 'Year 2', sems: [3, 4] },
  { year: 3, label: 'Year 3', sems: [5, 6] },
];

const SemesterStep = ({ batch, dept, onSelect }) => {
  const [spec, setSpec] = useState(null);
  const { data: specs = [] } = useGetSpecializationsByDeptQuery(
    { deptId: dept.id, scheme: batch.scheme }, { skip: !dept.id }
  );
  const { data: structures = [], isLoading } = useGetClassStructureQuery(
    { batchId: batch.id, deptId: dept.id, specId: spec?.id ?? undefined },
    { skip: !batch.id || !dept.id }
  );
  const existingMap = Object.fromEntries(structures.map(cs => [`${cs.yearOfStudy}-${cs.semester}`, cs]));

  if (isLoading) return <p className="text-sm" style={{ color: '#94a3b8' }}>Loading semesters…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-medium" style={{ color: '#64748b' }}>{dept.name} — Select Semester</p>
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setSpec(null)}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={!spec ? { background: '#7c3aed', color: '#fff' } : { border: '1px solid #e2e8f0', color: '#64748b' }}>
              All
            </button>
            {specs.map(s => (
              <button key={s.id} onClick={() => setSpec(s)}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={spec?.id === s.id ? { background: '#7c3aed', color: '#fff' } : { border: '1px solid #e2e8f0', color: '#64748b' }}>
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
      {!structures.length
        ? <p className="text-sm" style={{ color: '#94a3b8' }}>No semesters configured yet.</p>
        : YEAR_GROUPS.map(({ year, label, sems }) => (
          <div key={year}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#94a3b8' }}>{label}</p>
            <div className="grid grid-cols-2 gap-3">
              {sems.map(sem => {
                const cs = existingMap[`${year}-${sem}`];
                return (
                  <button key={sem} onClick={() => cs && onSelect(cs, spec)} disabled={!cs}
                    className="py-5 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                    style={{
                      border: cs ? '2px solid #7c3aed' : '2px dashed #e2e8f0',
                      background: cs ? '#f5f3ff' : '',
                      color: cs ? '#7c3aed' : '#94a3b8',
                      cursor: cs ? 'pointer' : 'not-allowed',
                    }}>
                    Semester {sem}
                    {cs && <span className="block text-xs font-normal mt-0.5" style={{ color: '#a78bfa' }}>configured</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      }
    </div>
  );
};

// ── Faculty Modal (Assign or Change) ─────────────────────────────────────────
const FacultyModal = ({ course, classStructureId, onClose }) => {
  const { data: faculty = [], isLoading } = useGetHodFacultyQuery();
  const [assignFaculty, { isLoading: assigning }] = useAssignFacultyToCourseMutation();
  const [changeFaculty, { isLoading: changing }]  = useChangeFacultyForCourseMutation();
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const isChange = !!course.facultyId;

  const handleSubmit = async () => {
    if (!selectedFacultyId) return;
    try {
      if (isChange) {
        await changeFaculty({ courseId: course.id, newFacultyId: Number(selectedFacultyId), classStructureId }).unwrap();
        toast.success('Faculty changed successfully.');
      } else {
        await assignFaculty({ facultyId: Number(selectedFacultyId), courseId: course.id, classStructureId }).unwrap();
        toast.success('Faculty assigned successfully.');
      }
      onClose();
    } catch {
      toast.error(isChange ? 'Failed to change faculty.' : 'Failed to assign faculty.');
    }
  };

  return (
    <Modal title={`${isChange ? 'Change' : 'Assign'} Faculty — ${course.name}`} onClose={onClose} width={400}>
      <div className="p-5 flex flex-col gap-4">
        {isChange && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#f5f3ff', border: '1px solid #ede9fe' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: '#7c3aed' }}>
              {course.facultyName?.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#5b21b6' }}>Current: {course.facultyName}</p>
              <p className="text-[10px]" style={{ color: '#a78bfa' }}>Will be replaced</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold" style={{ color: '#374151' }}>
            {isChange ? 'Select New Faculty' : 'Select Faculty'}
          </label>
          {isLoading
            ? <div className="h-9 rounded-lg skeleton" />
            : (
              <SelectInput value={selectedFacultyId} onChange={setSelectedFacultyId} className="w-full">
                <option value="">— Choose faculty —</option>
                {faculty.filter(f => f.id !== course.facultyId).map(f => (
                  <option key={f.id} value={f.id}>{f.name || f.fullName}{f.email ? ` (${f.email})` : ''}</option>
                ))}
              </SelectInput>
            )
          }
        </div>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSubmit} disabled={!selectedFacultyId || assigning || changing}>
            {assigning || changing ? 'Saving…' : isChange ? 'Change Faculty' : 'Assign'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

// ── Course Detail Panel ───────────────────────────────────────────────────────
const CourseDetail = ({ course, classStructureId, onBack }) => {
  const { data: students = [], isLoading, isError } = useGetHodCourseStudentsPerformanceQuery(
    { courseId: course.id, classStructureId },
    { skip: !course.id || !classStructureId }
  );
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [facultyModal, setFacultyModal] = useState(false);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    if (q && !s.studentName.toLowerCase().includes(q) && !(s.registrationNumber ?? '').toLowerCase().includes(q)) return false;
    if (filter === 'shortage' && s.attendancePercentage >= 75) return false;
    if (filter === 'ok' && s.attendancePercentage < 75) return false;
    return true;
  });

  const shortageCount = students.filter(s => s.attendancePercentage < 75).length;
  const avgPct = students.length
    ? (students.reduce((sum, s) => sum + s.attendancePercentage, 0) / students.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs font-medium hover:underline" style={{ color: '#7c3aed' }}>← Back to programs</button>

      {/* Course header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-base font-bold" style={{ color: '#0f172a' }}>{course.name}</p>
          <p className="text-xs font-mono mt-0.5" style={{ color: '#94a3b8' }}>
            {course.code}{course.credits ? ` · ${course.credits} cr` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {course.facultyName
            ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: '#ecfdf5', border: '1px solid #d1fae5' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: '#059669' }}>
                    {course.facultyName.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#059669' }}>{course.facultyName}</span>
                </div>
                <Btn variant="secondary" onClick={() => setFacultyModal(true)}>Change Faculty</Btn>
              </div>
            )
            : <Btn onClick={() => setFacultyModal(true)}>Assign Faculty</Btn>
          }
        </div>
      </div>

      {/* Stats */}
      {!isLoading && students.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Students', value: students.length, color: '#334155' },
            { label: 'Shortage (<75%)', value: shortageCount, color: '#dc2626' },
            { label: 'Class Average', value: `${avgPct}%`, color: '#7c3aed' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
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

      {/* Table */}
      {isLoading
        ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg skeleton" />)}</div>
        : isError
        ? <p className="text-sm" style={{ color: '#dc2626' }}>Failed to load student data.</p>
        : students.length === 0
        ? <p className="text-sm" style={{ color: '#94a3b8' }}>No students enrolled in this program.</p>
        : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <table className="min-w-full text-sm">
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                <tr>
                  {['#', 'Student', 'Reg No', 'Total Classes', 'Present', 'Absent', 'Attendance'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No students match the filter.</td></tr>
                  : filtered.map((s, i) => {
                    const shortage = s.attendancePercentage < 75;
                    const absent = s.totalClasses - s.attendedClasses;
                    return (
                      <tr key={s.studentId} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{s.studentName}</p>
                          {shortage && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#dc2626' }}>Shortage</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{s.registrationNumber || '—'}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-center" style={{ color: '#334155' }}>{s.totalClasses}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-center" style={{ color: '#059669' }}>{s.attendedClasses}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-center" style={{ color: '#dc2626' }}>{absent}</td>
                        <td className="px-4 py-3">
                          <PctBar pct={s.attendancePercentage} />
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )
      }

      {facultyModal && (
        <FacultyModal
          course={course}
          classStructureId={classStructureId}
          onClose={() => setFacultyModal(false)}
        />
      )}
    </div>
  );
};

// ── Step 2: Courses Panel ─────────────────────────────────────────────────────
const CoursesPanel = ({ classStructure, spec, onCourseSelect }) => {
  const { data: courses = [], isLoading } = useGetAdminCoursesQuery({ classStructureId: classStructure.id });
  const [facultyTarget, setFacultyTarget] = useState(null);

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl skeleton" />)}
    </div>
  );
  if (!courses.length) return (
    <p className="text-sm py-8 text-center" style={{ color: '#94a3b8' }}>No programs in this semester.</p>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium" style={{ color: '#64748b' }}>
          Semester {classStructure.semester}{spec ? ` · ${spec.name}` : ''} — {courses.length} Program{courses.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {courses.map(c => (
          <div key={c.id} className="p-4 rounded-xl" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
            <div className="flex items-start justify-between gap-3">
              <button className="flex items-center gap-3 min-w-0 text-left flex-1" onClick={() => onCourseSelect(c)}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: '#7c3aed' }}>
                  {c.code?.slice(0, 2) ?? '??'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate hover:underline" style={{ color: '#0f172a' }}>{c.name}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: '#94a3b8' }}>
                    {c.code}{c.credits ? ` · ${c.credits} cr` : ''}
                  </p>
                </div>
              </button>
              {c.studentCount != null && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: '#f1f5f9', color: '#64748b' }}>
                  {c.studentCount} students
                </span>
              )}
            </div>
            <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #f1f5f9' }}>
              {c.facultyName
                ? (
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ background: '#059669' }}>
                        {c.facultyName.charAt(0)}
                      </div>
                      <span className="text-xs font-medium" style={{ color: '#059669' }}>{c.facultyName}</span>
                    </div>
                    <button onClick={() => setFacultyTarget(c)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-opacity hover:opacity-75"
                      style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                      Change Faculty
                    </button>
                  </div>
                )
                : (
                  <button onClick={() => setFacultyTarget(c)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-opacity hover:opacity-75"
                    style={{ background: '#fef3c7', color: '#d97706', border: '1px dashed #fcd34d' }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Assign Faculty
                  </button>
                )
              }
            </div>
          </div>
        ))}
      </div>
      {facultyTarget && (
        <FacultyModal
          course={facultyTarget}
          classStructureId={classStructure.id}
          onClose={() => setFacultyTarget(null)}
        />
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HodCoursesPage = () => {
  const { data: dept, isLoading: deptLoading } = useGetHodDeptQuery();
  const [activeTab, setActiveTab] = useState('courses');

  const [level, setLevel]                   = useState(L.BATCH);
  const [batch, setBatch]                   = useState(null);
  const [spec, setSpec]                     = useState(null);
  const [classStructure, setClassStructure] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const goTo = (lv) => {
    if (lv <= L.BATCH)    { setBatch(null); setSpec(null); setClassStructure(null); setSelectedCourse(null); }
    if (lv <= L.SEMESTER) { setClassStructure(null); setSpec(null); setSelectedCourse(null); }
    if (lv <= L.COURSES)  { setSelectedCourse(null); }
    setLevel(lv);
  };

  const crumbs = [
    'Programs',
    ...(batch          ? [`${batch.startYear}–${batch.endYear} (${batch.scheme})`] : []),
    ...(classStructure ? [`Sem ${classStructure.semester}${spec ? ` · ${spec.name}` : ''}`] : []),
    ...(selectedCourse ? [selectedCourse.name] : []),
  ];

  if (deptLoading) return <p className="text-sm" style={{ color: '#94a3b8' }}>Loading…</p>;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: '#f1f5f9' }}>
        {CATALOG_TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="px-5 py-2 text-sm font-semibold rounded-md transition-colors"
            style={activeTab === t.key
              ? { background: '#fff', color: '#7c3aed', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
              : { color: '#64748b' }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'attend' && <HodAttendancePage />}
      {activeTab === 'ia'     && <HodIAPage />}

      {activeTab === 'courses' && (
        <>
          <Crumb items={crumbs} onNav={i => {
            if (i === 0) goTo(L.BATCH);
            else if (i === 1) goTo(L.SEMESTER);
            else if (i === 2) goTo(L.COURSES);
          }} />
          <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
            {level === L.BATCH && (
              <BatchStep onSelect={b => { setBatch(b); setLevel(L.SEMESTER); }} />
            )}
            {level === L.SEMESTER && batch && dept && (
              <SemesterStep batch={batch} dept={dept} onSelect={(cs, s) => { setClassStructure(cs); setSpec(s ?? null); setLevel(L.COURSES); }} />
            )}
            {level === L.COURSES && classStructure && (
              <CoursesPanel
                classStructure={classStructure}
                spec={spec}
                onCourseSelect={c => { setSelectedCourse(c); setLevel(L.DETAIL); }}
              />
            )}
            {level === L.DETAIL && selectedCourse && classStructure && (
              <CourseDetail
                course={selectedCourse}
                classStructureId={classStructure.id}
                onBack={() => goTo(L.COURSES)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HodCoursesPage;
