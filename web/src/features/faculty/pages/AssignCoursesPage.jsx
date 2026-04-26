import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetFacultyByIdQuery,
  useGetFacultyAssignedCoursesQuery,
  useAssignCoursesToFacultyMutation,
  useRemoveCourseFromFacultyMutation,
} from '../state/facultyApi';
import {
  useGetBatchesQuery,
  useGetAdminCoursesQuery,
  useGetClassStructureQuery,
} from '../../admin/courses/coursesAdminApi';
import { getFullName } from '../utils/facultyHelpers';
import Loader from '../../../shared/components/feedback/Loader';
import ROUTES from '../../../app/routes/routeConstants';

const YEAR_GROUPS = [
  { year: 1, semesters: [1, 2] },
  { year: 2, semesters: [3, 4] },
  { year: 3, semesters: [5, 6] },
];

// ── Semester courses scoped to a class structure ──────────────────────────────
const SemesterCourses = ({ classStructureId, facultyId, assignedIds, saving, onAssign, onBack }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const { data: semCourses = [], isLoading } = useGetAdminCoursesQuery({ classStructureId, excludeFacultyId: facultyId });

  const available = semCourses.filter(
    (c) => !assignedIds.has(c.id) &&
      (!search || c.name.toLowerCase().includes(search.toLowerCase()) ||
       c.code.toLowerCase().includes(search.toLowerCase()))
  );

  const toggle = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const handleAssign = async () => {
    await onAssign(selected);
    setSelected([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-xs text-indigo-600 hover:underline">← Back</button>
        <span className="text-xs text-gray-400">Courses in this semester</span>
      </div>
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or code…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />)
        ) : available.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">
            {semCourses.length === 0
              ? 'No courses assigned to this semester yet.'
              : search ? 'No courses match.' : 'All courses already assigned to this faculty.'}
          </p>
        ) : (
          available.map((c) => {
            const isSel = selected.includes(c.id);
            return (
              <label key={c.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                isSel ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
              }`}>
                <input type="checkbox" checked={isSel} onChange={() => toggle(c.id)}
                  className="accent-indigo-600 w-4 h-4 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{c.code}{c.credits ? ` · ${c.credits} cr` : ''}</p>
                </div>
              </label>
            );
          })
        )}
      </div>
      {selected.length > 0 && (
        <button onClick={handleAssign} disabled={saving}
          className="w-full py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50">
          {saving ? 'Assigning…' : `Assign ${selected.length} Course${selected.length > 1 ? 's' : ''} →`}
        </button>
      )}
    </div>
  );
};

// ── Batch → Year → Semester picker ───────────────────────────────────────────
const ClassStructurePicker = ({ deptId, deptName, assignedIds, saving, onAssign }) => {
  const [selBatch, setSelBatch] = useState(null);
  const [selYear, setSelYear]   = useState(null);
  const [selCs, setSelCs]       = useState(null);   // { id, semester, yearOfStudy }

  const { data: batches = [], isLoading: batchLoading } = useGetBatchesQuery();

  // Reset downstream when going back
  const resetToYear  = () => { setSelYear(null); setSelCs(null); };
  const resetToBatch = () => { setSelBatch(null); setSelYear(null); setSelCs(null); };

  if (!deptId && !deptName) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No department linked to this faculty. Edit faculty profile first.
      </p>
    );
  }

  // Step 3 — show semester-scoped courses
  if (selCs) {
    return (
      <SemesterCourses
        classStructureId={selCs.id}
        assignedIds={assignedIds}
        saving={saving}
        onAssign={onAssign}
        onBack={() => setSelCs(null)}
      />
    );
  }

  // Step 2 — pick year then semester
  if (selBatch) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={resetToBatch} className="text-xs text-indigo-600 hover:underline">← Batches</button>
          <span className="text-xs text-gray-500 font-mono font-semibold">
            {selBatch.startYear}–{selBatch.endYear}
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
              selBatch.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
            }`}>{selBatch.scheme}</span>
          </span>
        </div>

        {YEAR_GROUPS.map(({ year, semesters }) => (
          <div key={year}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Year {year}</p>
            <div className="grid grid-cols-2 gap-2">
              {semesters.map((sem) => (
                <button key={sem}
                  onClick={() => setSelCs({ id: null, semester: sem, yearOfStudy: year, batchId: selBatch.id })}
                  className="py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
                  Semester {sem}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Step 1 — pick batch
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400">Select a batch to browse its semesters.</p>
      {batchLoading ? (
        [1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)
      ) : batches.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No batches found.</p>
      ) : (
        batches.map((b) => (
          <button key={b.id} onClick={() => setSelBatch(b)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
            <span className="text-sm font-bold text-gray-900 font-mono">{b.startYear}–{b.endYear}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              b.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
            }`}>{b.scheme}</span>
          </button>
        ))
      )}
    </div>
  );
};

// ── Resolve classStructureId then load courses ────────────────────────────────
const SemesterCoursesResolver = ({ selCs, deptId, facultyId, assignedIds, saving, onAssign, onBack }) => {
  const { data: list = [], isLoading, isError } = useGetClassStructureQuery(
    { batchId: selCs.batchId, deptId: deptId ?? undefined },
    { skip: !selCs.batchId }
  );

  const match = list.find(
    (cs) => cs.yearOfStudy === selCs.yearOfStudy && cs.semester === selCs.semester
  );

  if (isLoading) return (
    <div className="space-y-2">
      <button onClick={onBack} className="text-xs text-indigo-600 hover:underline">← Back</button>
      {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />)}
    </div>
  );

  if (isError || !match) return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs text-indigo-600 hover:underline">← Back</button>
      <p className="text-xs text-gray-400 text-center py-4">No courses configured for this semester yet.</p>
    </div>
  );

  return (
    <SemesterCourses
      classStructureId={match.id}
      facultyId={facultyId}
      assignedIds={assignedIds}
      saving={saving}
      onAssign={onAssign}
      onBack={onBack}
    />
  );
};

// ── Smarter picker that resolves class structure id ───────────────────────────
const AvailablePanel = ({ deptId, deptName, facultyId, assignedIds, saving, onAssign }) => {
  const [selBatch, setSelBatch] = useState(null);
  const [selSem, setSelSem]     = useState(null);   // { semester, yearOfStudy, batchId }

  const { data: batches = [], isLoading: batchLoading } = useGetBatchesQuery();

  const resetToBatch = () => { setSelBatch(null); setSelSem(null); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-bold text-gray-700">Available Courses</h2>

      {!deptId && !deptName ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No department linked to this faculty. Edit faculty profile first.
        </p>
      ) : selSem ? (
        <SemesterCoursesResolver
          selCs={selSem}
          deptId={deptId}
          facultyId={facultyId}
          assignedIds={assignedIds}
          saving={saving}
          onAssign={onAssign}
          onBack={() => setSelSem(null)}
        />
      ) : selBatch ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <button onClick={resetToBatch} className="text-xs text-indigo-600 hover:underline">← Batches</button>
            <span className="text-xs text-gray-500 font-semibold font-mono">
              {selBatch.startYear}–{selBatch.endYear}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                selBatch.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
              }`}>{selBatch.scheme}</span>
            </span>
          </div>
          {YEAR_GROUPS.map(({ year, semesters }) => (
            <div key={year}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Year {year}</p>
              <div className="grid grid-cols-2 gap-2">
                {semesters.map((sem) => (
                  <button key={sem}
                    onClick={() => setSelSem({ semester: sem, yearOfStudy: year, batchId: selBatch.id })}
                    className="py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 transition-all">
                    Semester {sem}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Select a batch to browse its semesters.</p>
          {batchLoading ? (
            [1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />)
          ) : batches.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No batches found.</p>
          ) : (
            batches.map((b) => (
              <button key={b.id} onClick={() => setSelBatch(b)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                <span className="text-sm font-bold text-gray-900 font-mono">{b.startYear}–{b.endYear}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  b.scheme === 'NEP' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                }`}>{b.scheme}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── Assigned Courses Panel ────────────────────────────────────────────────────
const AssignedPanel = ({ assigned, onUnassign }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
    <h2 className="text-sm font-bold text-gray-700">
      Assigned Courses
      <span className="ml-2 text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
        {assigned.length}
      </span>
    </h2>
    <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
      {assigned.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No courses assigned yet.</p>
      ) : (
        assigned.map((c) => (
          <div key={c.id}
            className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/60 group hover:border-gray-200">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
              <p className="text-xs text-gray-400 font-mono">{c.code}{c.credits ? ` · ${c.credits} cr` : ''}</p>
            </div>
            <button onClick={() => onUnassign(c.id)}
              className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs font-semibold rounded border border-amber-200 text-amber-600 hover:bg-amber-50">
              Unassign
            </button>
          </div>
        ))
      )}
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const AssignCoursesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: faculty, isLoading: facultyLoading } = useGetFacultyByIdQuery(id);
  const { data: assigned = [], isLoading: assignedLoading } = useGetFacultyAssignedCoursesQuery(id);
  const [assignCoursesToFaculty, { isLoading: saving }] = useAssignCoursesToFacultyMutation();
  const [removeCourseFromFaculty] = useRemoveCourseFromFacultyMutation();

  const assignedIds = new Set(assigned.map((c) => c.id));

  const handleAssign = async (courseIds) => {
    if (!courseIds.length) return;
    try {
      await assignCoursesToFaculty({ facultyId: id, courseIds }).unwrap();
      toast.success(`${courseIds.length} course(s) assigned.`);
    } catch { toast.error('Failed to assign courses.'); }
  };

  const handleUnassign = async (courseId) => {
    try {
      await removeCourseFromFaculty({ facultyId: id, courseId }).unwrap();
      toast.success('Course unassigned.');
    } catch (err) { toast.error(err?.data?.message || 'Failed to unassign course.'); }
  };

  if (facultyLoading || assignedLoading) return <Loader />;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-2 text-xs flex-wrap">
        <button onClick={() => navigate(ROUTES.ADMIN_FACULTY)} className="text-indigo-600 hover:underline">Faculty</button>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-800">{faculty ? getFullName(faculty) : '…'}</span>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-800">Assign Courses</span>
      </div>

      {faculty && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-3 flex-wrap">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0">
            {getFullName(faculty).split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{getFullName(faculty)}</p>
            <p className="text-xs text-gray-400">{faculty.email}</p>
          </div>
          {faculty.department && (
            <span className="ml-auto text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
              {faculty.department}
            </span>
          )}
          {faculty.hod && (
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">HOD</span>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <AvailablePanel
          deptId={faculty?.departmentId}
          deptName={faculty?.department}
          facultyId={id}
          assignedIds={assignedIds}
          saving={saving}
          onAssign={handleAssign}
        />
        <AssignedPanel assigned={assigned} onUnassign={handleUnassign} />
      </div>
    </div>
  );
};

export default AssignCoursesPage;
