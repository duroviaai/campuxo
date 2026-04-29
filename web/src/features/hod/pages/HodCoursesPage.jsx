import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetBatchesQuery,
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
import { Modal, Btn, SelectInput, PctBar } from '../../../shared/components/ui/PageShell';
import HodAttendancePage from './HodAttendancePage';
import HodIAPage from './HodIAPage';

const CATALOG_TABS = [
  { key: 'courses', label: 'Programs' },
  { key: 'attend',  label: 'Dept Attendance' },
  { key: 'ia',      label: 'Dept IA' },
];

const pctColor = (p) => p >= 75 ? '#059669' : p >= 50 ? '#d97706' : '#dc2626';

// ── Faculty Modal ─────────────────────────────────────────────────────────────
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
const CourseDetail = ({ course, classStructureId }) => {
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
                        <td className="px-4 py-3"><PctBar pct={s.attendancePercentage} /></td>
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

// ── Main Page ─────────────────────────────────────────────────────────────────
const HodCoursesPage = () => {
  const { data: dept, isLoading: deptLoading } = useGetHodDeptQuery();
  const [activeTab, setActiveTab] = useState('courses');

  const [batchId, setBatchId]   = useState('');
  const [csId, setCsId]         = useState('');
  const [courseId, setCourseId] = useState('');

  const { data: batches = [] }    = useGetBatchesQuery();
  const { data: structures = [] } = useGetClassStructureQuery(
    { batchId, deptId: dept?.id ?? 0 }, { skip: !batchId || !dept?.id }
  );
  const { data: courses = [] } = useGetAdminCoursesQuery(
    { classStructureId: csId }, { skip: !csId }
  );

  const selectedCourse = courses.find(c => c.id === Number(courseId));

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
          {/* Cascading dropdowns */}
          <div className="rounded-xl p-4 space-y-4" style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: '#64748b' }}>Batch</label>
              <select value={batchId} onChange={e => { setBatchId(e.target.value); setCsId(''); setCourseId(''); }}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                style={{ border: '1px solid #e2e8f0' }}>
                <option value="">Select batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.startYear}–{b.endYear} ({b.scheme})</option>)}
              </select>
            </div>
            {batchId && (
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: '#64748b' }}>Semester</label>
                <select value={csId} onChange={e => { setCsId(e.target.value); setCourseId(''); }}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  style={{ border: '1px solid #e2e8f0' }}>
                  <option value="">Select semester</option>
                  {structures.map(cs => (
                    <option key={cs.id} value={cs.id}>Year {cs.yearOfStudy} · Sem {cs.semester}</option>
                  ))}
                </select>
              </div>
            )}
            {csId && (
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: '#64748b' }}>Program</label>
                <select value={courseId} onChange={e => setCourseId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  style={{ border: '1px solid #e2e8f0' }}>
                  <option value="">Select program</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>
            )}
          </div>

          {selectedCourse && csId && (
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
              <CourseDetail key={courseId} course={selectedCourse} classStructureId={Number(csId)} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HodCoursesPage;
