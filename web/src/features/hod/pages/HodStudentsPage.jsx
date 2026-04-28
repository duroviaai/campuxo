import { useState } from 'react';
import {
  useGetBatchesQuery,
  useGetSpecializationsByDeptQuery,
  useGetClassStructureQuery,
} from '../../admin/courses/coursesAdminApi';
import {
  useGetHodDeptQuery,
  useGetHodStudentsByClassStructureQuery,
  useGetHodStudentPerformanceQuery,
} from '../state/hodApi';
import { Badge, PctBar } from '../../../shared/components/ui/PageShell';

const L = { BATCH: 0, SEMESTER: 1, STUDENTS: 2, DETAIL: 3 };

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

// ── Step 2: Students Panel ────────────────────────────────────────────────────
const StudentsPanel = ({ classStructure, spec, onStudentSelect }) => {
  const { data: students = [], isLoading } = useGetHodStudentsByClassStructureQuery(classStructure.id);
  const [search, setSearch] = useState('');

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    return !q || s.fullName?.toLowerCase().includes(q) || (s.registrationNumber ?? '').toLowerCase().includes(q);
  });

  if (isLoading) return (
    <div className="space-y-2">
      {[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-medium" style={{ color: '#64748b' }}>
          Semester {classStructure.semester}{spec ? ` · ${spec.name}` : ''} — {students.length} Student{students.length !== 1 ? 's' : ''}
        </p>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or reg no…"
            className="pl-8 pr-4 py-2 text-sm rounded-lg outline-none transition-all"
            style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a', width: 220 }}
            onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; }} />
        </div>
      </div>

      {!filtered.length
        ? <p className="text-sm py-8 text-center" style={{ color: '#94a3b8' }}>{search ? 'No students match your search.' : 'No students in this semester.'}</p>
        : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <table className="min-w-full text-sm">
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                <tr>
                  {['#', 'Name', 'Reg No.', 'Class', 'Year', 'Scheme', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} onClick={() => onStudentSelect(s)}
                    className="cursor-pointer"
                    style={{ borderBottom: '1px solid #f8fafc' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                          style={{ background: '#059669' }}>
                          {s.fullName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{s.fullName}</p>
                          <p className="text-[11px]" style={{ color: '#94a3b8' }}>{s.email ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono" style={{ color: '#94a3b8' }}>{s.registrationNumber ?? '—'}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#94a3b8' }}>{s.classBatchDisplayName ?? s.classBatchName ?? '—'}</td>
                    <td className="px-5 py-3.5 text-xs" style={{ color: '#94a3b8' }}>{s.yearOfStudy ? `Year ${s.yearOfStudy}` : '—'}</td>
                    <td className="px-5 py-3.5">
                      {s.scheme
                        ? <Badge color={s.scheme === 'NEP' ? 'blue' : 'violet'}>{s.scheme}</Badge>
                        : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium" style={{ color: '#7c3aed' }}>View →</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
};

// ── Step 3: Student Detail ────────────────────────────────────────────────────
const Field = ({ label, value }) => value ? (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>{label}</p>
    <p className="text-sm" style={{ color: '#0f172a' }}>{value}</p>
  </div>
) : null;

const StudentDetail = ({ student, onBack }) => {
  const { data: courses = [], isLoading, isError } = useGetHodStudentPerformanceQuery(student.id);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = courses.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.courseName.toLowerCase().includes(q) && !(c.courseCode ?? '').toLowerCase().includes(q)) return false;
    if (filter === 'shortage' && c.attendancePercentage >= 75) return false;
    if (filter === 'ok'       && c.attendancePercentage <  75) return false;
    return true;
  });

  const shortageCount = courses.filter(c => c.attendancePercentage < 75).length;
  const totalClasses  = courses.reduce((s, c) => s + c.totalClasses, 0);
  const totalAttended = courses.reduce((s, c) => s + c.attendedClasses, 0);
  const overallPct    = totalClasses === 0 ? 0 : Math.round((totalAttended / totalClasses) * 1000) / 10;

  const fmt = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) return `${d[2].toString().padStart(2,'0')}/${d[1].toString().padStart(2,'0')}/${d[0]}`;
    return d;
  };

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-xs font-medium hover:underline" style={{ color: '#7c3aed' }}>← Back to students</button>

      {/* Profile card */}
      <div className="rounded-xl p-5" style={{ border: '1px solid #e2e8f0', background: '#fafafa' }}>
        <div className="flex items-start gap-4 flex-wrap">
          {/* Avatar / photo */}
          {student.photoUrl
            ? <img src={student.photoUrl} alt={student.fullName} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            : (
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
                style={{ background: '#059669' }}>
                {student.fullName?.[0]?.toUpperCase() ?? '?'}
              </div>
            )
          }
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-lg font-bold" style={{ color: '#0f172a' }}>{student.fullName}</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: '#64748b' }}>{student.registrationNumber ?? '—'}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {student.scheme && <Badge color={student.scheme === 'NEP' ? 'blue' : 'violet'}>{student.scheme}</Badge>}
                {student.yearOfStudy && <Badge color="blue">Year {student.yearOfStudy}</Badge>}
                {student.department && <Badge color="gray">{student.department}</Badge>}
              </div>
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mt-4">
              <Field label="Email"        value={student.email} />
              <Field label="Phone"        value={student.phone} />
              <Field label="Date of Birth" value={fmt(student.dateOfBirth)} />
              <Field label="Class"        value={student.classBatchDisplayName ?? student.classBatchName} />
              <Field label="Course Years" value={
                student.courseStartYear && student.courseEndYear
                  ? `${student.courseStartYear} – ${student.courseEndYear}`
                  : student.courseStartYear ? `${student.courseStartYear}` : null
              } />
              <Field label="Specialization" value={student.specialization} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && courses.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Programs',     value: courses.length, color: '#334155' },
            { label: 'Shortage (<75%)',    value: shortageCount,  color: '#dc2626' },
            { label: 'Overall Attendance', value: `${overallPct}%`, color: pctColor(overallPct) },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search program…"
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-48"
            style={{ border: '1px solid #e2e8f0' }} />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ border: '1px solid #e2e8f0' }}>
            <option value="all">All Programs</option>
            <option value="shortage">Shortage (&lt;75%)</option>
            <option value="ok">75% and above</option>
          </select>
        </div>
        <p className="text-xs" style={{ color: '#94a3b8' }}>{filtered.length} program{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Table */}
      {isLoading
        ? <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-lg skeleton" />)}</div>
        : isError
        ? <p className="text-sm" style={{ color: '#dc2626' }}>Failed to load performance data.</p>
        : courses.length === 0
        ? <p className="text-sm py-8 text-center" style={{ color: '#94a3b8' }}>No attendance records found for this student.</p>
        : (
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <table className="min-w-full text-sm">
              <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                <tr>
                  {['#', 'Program', 'Code', 'Total Classes', 'Present', 'Absent', 'Attendance'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0
                  ? <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No programs match the filter.</td></tr>
                  : filtered.map((c, i) => {
                    const shortage = c.attendancePercentage < 75;
                    const absent   = c.totalClasses - c.attendedClasses;
                    const needed   = shortage && c.totalClasses > 0
                      ? Math.ceil((0.75 * c.totalClasses - c.attendedClasses) / 0.25) : 0;
                    return (
                      <tr key={c.courseCode + c.courseName} style={{ borderBottom: '1px solid #f8fafc' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-4 py-3 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{c.courseName}</p>
                          {shortage && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#dc2626' }}>
                              Shortage{needed > 0 ? ` · +${needed} needed` : ''}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono" style={{ color: '#94a3b8' }}>{c.courseCode}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-center" style={{ color: '#334155' }}>{c.totalClasses}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-center" style={{ color: '#059669' }}>{c.attendedClasses}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-center" style={{ color: '#dc2626' }}>{absent}</td>
                        <td className="px-4 py-3"><PctBar pct={c.attendancePercentage} /></td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HodStudentsPage = () => {
  const { data: dept, isLoading: deptLoading } = useGetHodDeptQuery();

  const [level, setLevel]                   = useState(L.BATCH);
  const [batch, setBatch]                   = useState(null);
  const [spec, setSpec]                     = useState(null);
  const [classStructure, setClassStructure] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const goTo = (lv) => {
    if (lv <= L.BATCH)    { setBatch(null); setSpec(null); setClassStructure(null); setSelectedStudent(null); }
    if (lv <= L.SEMESTER) { setClassStructure(null); setSpec(null); setSelectedStudent(null); }
    if (lv <= L.STUDENTS) { setSelectedStudent(null); }
    setLevel(lv);
  };

  const crumbs = [
    'Students',
    ...(batch          ? [`${batch.startYear}–${batch.endYear} (${batch.scheme})`] : []),
    ...(classStructure ? [`Sem ${classStructure.semester}${spec ? ` · ${spec.name}` : ''}`] : []),
    ...(selectedStudent ? [selectedStudent.fullName] : []),
  ];

  if (deptLoading) return <p className="text-sm" style={{ color: '#94a3b8' }}>Loading…</p>;

  return (
    <div className="space-y-5 max-w-5xl">
      <Crumb items={crumbs} onNav={i => {
        if (i === 0) goTo(L.BATCH);
        else if (i === 1) goTo(L.SEMESTER);
        else if (i === 2) goTo(L.STUDENTS);
      }} />
      <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
        {level === L.BATCH && (
          <BatchStep onSelect={b => { setBatch(b); setLevel(L.SEMESTER); }} />
        )}
        {level === L.SEMESTER && batch && dept && (
          <SemesterStep batch={batch} dept={dept} onSelect={(cs, s) => { setClassStructure(cs); setSpec(s ?? null); setLevel(L.STUDENTS); }} />
        )}
        {level === L.STUDENTS && classStructure && (
          <StudentsPanel
            classStructure={classStructure}
            spec={spec}
            onStudentSelect={s => { setSelectedStudent(s); setLevel(L.DETAIL); }}
          />
        )}
        {level === L.DETAIL && selectedStudent && (
          <StudentDetail
            student={selectedStudent}
            onBack={() => goTo(L.STUDENTS)}
          />
        )}
      </div>
    </div>
  );
};

export default HodStudentsPage;
