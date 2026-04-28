import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetHodFacultyQuery,
  useGetHodCoursesQuery,
  useGetHodCoursesByClassStructureQuery,
  useGetHodFacultyAssignmentsQuery,
  useAssignFacultyToCourseMutation,
  useRemoveFacultyFromCourseMutation,
} from '../state/hodApi';
import {
  useGetBatchesQuery,
  useGetClassStructureQuery,
} from '../../admin/courses/coursesAdminApi';
import { TableWrap, Thead, Tr, Td, EmptyState, Badge, Modal, Btn, SearchInput } from '../../../shared/components/ui/PageShell';

// ── Assign Course Modal ───────────────────────────────────────────────────────
const AssignModal = ({ faculty, onClose }) => {
  const [batchId, setBatchId]   = useState('');
  const [csId, setCsId]         = useState('');
  const [courseId, setCourseId] = useState('');

  const { data: batches = [] }    = useGetBatchesQuery();
  const { data: structures = [] } = useGetClassStructureQuery(
    { batchId, deptId: faculty.departmentId ?? 0 },
    { skip: !batchId || !faculty.departmentId }
  );
  const { data: allCourses = [] } = useGetHodCoursesByClassStructureQuery(
    Number(csId), { skip: !csId }
  );
  const { data: deptCourses = [] } = useGetHodCoursesQuery();
  const [assign, { isLoading }] = useAssignFacultyToCourseMutation();

  const assignedCourseIds = new Set(
    deptCourses.filter(c => c.facultyId === faculty.id).map(c => c.id)
  );
  const courses = allCourses.filter(c => !assignedCourseIds.has(c.id));

  const handleAssign = async () => {
    if (!courseId) { toast.error('Select a program'); return; }
    try {
      await assign({ facultyId: faculty.id, courseId: Number(courseId), classStructureId: csId ? Number(csId) : null }).unwrap();
      toast.success('Program assigned!');
      onClose();
    } catch { toast.error('Failed to assign program.'); }
  };

  const sel = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500';

  return (
    <Modal title={`Assign Program — ${faculty.fullName}`} onClose={onClose} width={480}>
      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 block mb-1">Batch</label>
          <select value={batchId} onChange={e => { setBatchId(e.target.value); setCsId(''); setCourseId(''); }} className={sel}>
            <option value="">Select batch…</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.startYear}–{b.endYear} ({b.scheme})</option>)}
          </select>
        </div>
        {batchId && (
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Semester</label>
            <select value={csId} onChange={e => { setCsId(e.target.value); setCourseId(''); }} className={sel}>
              <option value="">Select semester…</option>
              {structures.map(cs => (
                <option key={cs.id} value={cs.id}>Year {cs.yearOfStudy} · Sem {cs.semester}</option>
              ))}
            </select>
          </div>
        )}
        {csId && (
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Program</label>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className={sel}>
              <option value="">Select program…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleAssign} disabled={isLoading || !courseId}>
            {isLoading ? 'Assigning…' : 'Assign'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
};

// ── Field helper ──────────────────────────────────────────────────────────────
const Field = ({ label, value }) => value != null && value !== '' ? (
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>{label}</p>
    <p className="text-sm" style={{ color: '#0f172a' }}>{value}</p>
  </div>
) : null;

// ── Faculty Detail ────────────────────────────────────────────────────────────
const FacultyDetail = ({ faculty, onBack }) => {
  const { data: assignments = [], isLoading: assignmentsLoading } = useGetHodFacultyAssignmentsQuery(faculty.id);
  const [assignModal, setAssignModal] = useState(false);
  const [removeCourse, { isLoading: removing }] = useRemoveFacultyFromCourseMutation();

  const handleRemove = async (courseId, courseName) => {
    if (!window.confirm(`Remove "${courseName}" from ${faculty.fullName}?`)) return;
    try {
      await removeCourse({ facultyId: faculty.id, courseId }).unwrap();
      toast.success('Program removed.');
    } catch { toast.error('Failed to remove program.'); }
  };
  const fmt = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) return `${d[2].toString().padStart(2,'0')}/${d[1].toString().padStart(2,'0')}/${d[0]}`;
    return d;
  };

  const statusColor = faculty.status === 'ACTIVE' ? 'green' : faculty.status === 'INACTIVE' ? 'red' : 'gray';

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-xs font-medium hover:underline" style={{ color: '#7c3aed' }}>← Back to faculty</button>

      {/* Profile card */}
      <div className="rounded-xl p-5" style={{ border: '1px solid #e2e8f0', background: '#fafafa' }}>
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
            style={{ background: '#7c3aed' }}>
            {faculty.fullName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-lg font-bold" style={{ color: '#0f172a' }}>{faculty.fullName}</p>
                <p className="text-xs font-mono mt-0.5" style={{ color: '#64748b' }}>{faculty.facultyId ?? '—'}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {faculty.status  && <Badge color={statusColor}>{faculty.status}</Badge>}
                {faculty.role    && <Badge color="violet">{faculty.role}</Badge>}
                {faculty.department && <Badge color="gray">{faculty.department}</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mt-4">
              <Field label="Email"         value={faculty.email} />
              <Field label="Phone"         value={faculty.phone} />
              <Field label="Designation"   value={faculty.designation} />
              <Field label="Qualification" value={faculty.qualification} />
              <Field label="Experience"    value={faculty.experience != null ? `${faculty.experience} years` : null} />
              <Field label="Joining Date"  value={fmt(faculty.joiningDate)} />
              <Field label="Subjects"      value={faculty.subjects} />
            </div>
          </div>
        </div>
      </div>

      {/* Assigned programs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
            Assigned Programs
            <span className="ml-2 text-xs font-normal" style={{ color: '#94a3b8' }}>({assignments.length})</span>
          </p>
          <Btn onClick={() => setAssignModal(true)}>+ Assign Program</Btn>
        </div>

        {assignmentsLoading
          ? <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-12 rounded-lg skeleton" />)}</div>
          : assignments.length === 0
          ? (
            <div className="rounded-xl py-10 text-center" style={{ border: '1px dashed #e2e8f0' }}>
              <p className="text-sm" style={{ color: '#94a3b8' }}>No programs assigned yet.</p>
            </div>
          )
          : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
              <table className="min-w-full text-sm">
                <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
                  <tr>
                    {['#', 'Program', 'Code', 'Credits', 'Year', 'Semester', 'Batch', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a, i) => (
                    <tr key={`${a.courseId}-${a.classStructureId}`} style={{ borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#94a3b8' }}>{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                            style={{ background: '#7c3aed' }}>
                            {a.courseCode?.slice(0, 2) ?? '??'}
                          </div>
                          <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{a.courseName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono" style={{ color: '#94a3b8' }}>{a.courseCode ?? '—'}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#64748b' }}>{a.credits ? `${a.credits} cr` : '—'}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#64748b' }}>
                        {a.yearOfStudy
                          ? (a.yearOfStudy === 1 ? '1st' : a.yearOfStudy === 2 ? '2nd' : '3rd') + ' Year'
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        {a.semester
                          ? <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: '#f5f3ff', color: '#7c3aed' }}>Sem {a.semester}</span>
                          : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#64748b' }}>
                        {a.batchStartYear && a.batchEndYear
                          ? `${a.batchStartYear}–${a.batchEndYear}${a.batchScheme ? ` (${a.batchScheme})` : ''}`
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => handleRemove(a.courseId, a.courseName)} disabled={removing}
                          className="text-xs font-medium hover:underline disabled:opacity-50"
                          style={{ color: '#dc2626' }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {assignModal && <AssignModal faculty={faculty} onClose={() => setAssignModal(false)} />}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const HodFacultyPage = () => {
  const { data: faculty = [], isLoading, isError } = useGetHodFacultyQuery();
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);

  const filtered = faculty.filter(f => {
    const q = search.toLowerCase();
    return !q || f.fullName?.toLowerCase().includes(q) || f.facultyId?.toLowerCase().includes(q);
  });

  if (selected) return <FacultyDetail faculty={selected} onBack={() => setSelected(null)} />;

  if (isLoading) return <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="rounded-xl h-12 skeleton" />)}</div>;
  if (isError)   return <p className="text-sm" style={{ color: '#dc2626' }}>Failed to load faculty.</p>;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: '#64748b' }}>{filtered.length} faculty member{filtered.length !== 1 ? 's' : ''}</p>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name or ID…" />
      </div>

      {filtered.length === 0
        ? <EmptyState message="No faculty in your department." />
        : (
          <TableWrap>
            <Thead cols={['#', 'Name', 'Faculty ID', 'Designation', 'Programs', '']} />
            <tbody>
              {filtered.map((f, i) => (
                <Tr key={f.id} onClick={() => setSelected(f)}>
                  <Td muted>{i + 1}</Td>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ background: '#7c3aed' }}>
                        {f.fullName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{f.fullName}</p>
                        <p className="text-[11px]" style={{ color: '#94a3b8' }}>{f.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td mono muted>{f.facultyId ?? '—'}</Td>
                  <Td muted>{f.designation ?? '—'}</Td>
                  <Td><Badge color="violet">{f.courseCount ?? 0} programs</Badge></Td>
                  <Td>
                    <span className="text-xs font-medium" style={{ color: '#7c3aed' }}>View →</span>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        )
      }
    </div>
  );
};

export default HodFacultyPage;
