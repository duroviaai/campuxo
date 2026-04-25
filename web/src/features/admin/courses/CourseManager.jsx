import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAdminCoursesQuery,
  useGetDeptCoursesQuery,
  useCreateAdminCourseMutation,
  useAssignCourseMutation,
  useUnassignCourseMutation,
  useDeleteAdminCourseMutation,
  useCheckCourseCodeQuery,
} from './coursesAdminApi';

/* ── Reuse suggestion banner ── */
const ReuseHint = ({ code, departmentId, onUse }) => {
  const { data, isFetching } = useCheckCourseCodeQuery(
    { code, departmentId },
    { skip: !code || code.length < 2 }
  );
  if (isFetching || !data?.exists) return null;
  return (
    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
      <span className="text-amber-700">Code <strong>{code}</strong> already exists in this department.</span>
      <button onClick={() => onUse(data.course)}
        className="ml-2 px-2 py-1 rounded bg-amber-500 text-white font-semibold hover:bg-amber-600">
        Use existing
      </button>
    </div>
  );
};

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300';

/* ── Create new course tab ── */
const CreateTab = ({ classStructure, departmentId }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState('');
  const [createCourse, { isLoading }] = useCreateAdminCourseMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    try {
      await createCourse({
        name: name.trim(), code: code.trim(),
        credits: credits ? Number(credits) : null,
        departmentId,
        classStructureId: classStructure.id,
      }).unwrap();
      toast.success('Course created and assigned.');
      setName(''); setCode(''); setCredits('');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add course.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Data Structures" className={inputCls} />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Code *</label>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. CS301" className={inputCls} />
        {code.length >= 2 && (
          <ReuseHint code={code} departmentId={departmentId}
            onUse={(c) => { setName(c.name); setCode(c.code); setCredits(c.credits ?? ''); }} />
        )}
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Credits</label>
        <input type="number" min="1" max="10" value={credits} onChange={(e) => setCredits(e.target.value)}
          placeholder="e.g. 4" className={inputCls} />
      </div>
      <button type="submit" disabled={!name.trim() || !code.trim() || isLoading}
        className="w-full py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50">
        {isLoading ? 'Adding…' : '+ Create & Assign'}
      </button>
    </form>
  );
};

/* ── Assign existing course tab ── */
const AssignTab = ({ classStructure, departmentId }) => {
  const [search, setSearch] = useState('');
  const { data: assigned = [] } = useGetAdminCoursesQuery(classStructure.id);
  const { data: allDeptCourses = [], isLoading } = useGetDeptCoursesQuery(departmentId, { skip: !departmentId });
  const [assignCourse, { isLoading: assigning }] = useAssignCourseMutation();

  const assignedIds = useMemo(() => new Set(assigned.map((c) => c.id)), [assigned]);

  const available = useMemo(() => {
    const q = search.toLowerCase();
    return allDeptCourses
      .filter((c) => !assignedIds.has(c.id))
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [allDeptCourses, assignedIds, search]);

  const handleAssign = async (courseId) => {
    try {
      await assignCourse({ classStructureId: classStructure.id, courseId }).unwrap();
      toast.success('Course assigned.');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign.');
    }
  };

  return (
    <div className="space-y-3">
      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search courses in this department…"
        className={inputCls} />
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />)}
        </div>
      ) : available.length === 0 ? (
        <p className="text-xs text-gray-400 py-6 text-center">
          {search ? 'No courses match your search.' : 'All department courses are already assigned.'}
        </p>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {available.map((c) => (
            <div key={c.id}
              className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-400 font-mono">{c.code}{c.credits ? ` · ${c.credits} cr` : ''}</p>
              </div>
              <button onClick={() => handleAssign(c.id)} disabled={assigning}
                className="ml-2 shrink-0 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50">
                Assign
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Left panel with tabs ── */
const CourseForm = ({ classStructure, departmentId }) => {
  const [tab, setTab] = useState('create');
  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
        {[['create', 'Create New'], ['assign', 'Assign Existing']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              tab === key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'create'
        ? <CreateTab classStructure={classStructure} departmentId={departmentId} />
        : <AssignTab classStructure={classStructure} departmentId={departmentId} />}
    </div>
  );
};

/* ── Course list with search/filter/sort ── */
const CourseList = ({ classStructure }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: courses = [], isLoading } = useGetAdminCoursesQuery(classStructure.id);
  const [unassign, { isLoading: unassigning }] = useUnassignCourseMutation();
  const [deleteCourse, { isLoading: deleting }] = useDeleteAdminCourseMutation();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...courses]
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'code') return a.code.localeCompare(b.code);
        if (sortBy === 'credits') return (b.credits ?? 0) - (a.credits ?? 0);
        return a.name.localeCompare(b.name);
      });
  }, [courses, search, sortBy]);

  const handleUnassign = async (courseId) => {
    try {
      await unassign({ classStructureId: classStructure.id, courseId }).unwrap();
      toast.success('Course unassigned.');
    } catch { toast.error('Failed to unassign.'); }
  };

  const handleDelete = async (course, confirmed = false) => {
    try {
      const result = await deleteCourse({ id: course.id, confirmed }).unwrap();
      if (result?.usages) {
        setDeleteConfirm({ course, usages: result.usages });
        return;
      }
      toast.success('Course deleted.');
      setDeleteConfirm(null);
    } catch (err) {
      if (err?.status === 409) {
        setDeleteConfirm({ course, usages: err.data?.usages });
      } else {
        toast.error('Failed to delete.');
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide flex-1">
          Assigned Courses
          <span className="ml-2 bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full text-xs font-bold">
            {courses.length}
          </span>
        </h3>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none">
          <option value="name">Sort: Name</option>
          <option value="code">Sort: Code</option>
          <option value="credits">Sort: Credits</option>
        </select>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or code…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-xs text-gray-400 py-6 text-center">
          {search ? 'No courses match your search.' : 'No courses assigned yet.'}
        </p>
      ) : (
        <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
          {filtered.map((c) => (
            <div key={c.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/60 group hover:border-gray-200">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-400 font-mono">
                  {c.code}{c.credits ? ` · ${c.credits} cr` : ''}
                </p>
              </div>
              <div className="flex gap-1.5 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleUnassign(c.id)} disabled={unassigning}
                  className="px-2 py-1 text-xs font-semibold rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50">
                  Unassign
                </button>
                <button onClick={() => handleDelete(c)} disabled={deleting}
                  className="px-2 py-1 text-xs font-semibold rounded border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">Delete Course?</h3>
            <p className="text-sm text-gray-600">
              <strong>{deleteConfirm.course.name}</strong> is used in{' '}
              <strong>{deleteConfirm.usages}</strong> semester{deleteConfirm.usages !== 1 ? 's' : ''}.
              Deleting it will remove it from all of them.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.course, true)} disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Delete Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CourseManager = ({ batch, dept, spec, classStructure, onBack }) => (
  <div className="space-y-5">
    {/* Breadcrumb */}
    <div className="flex items-center gap-2 flex-wrap text-xs">
      <button onClick={() => onBack('batch')} className="text-indigo-600 hover:underline">Batches</button>
      <span className="text-gray-300">/</span>
      <button onClick={() => onBack('dept')} className="text-indigo-600 hover:underline">
        {batch.startYear}–{batch.endYear}
      </button>
      <span className="text-gray-300">/</span>
      <button onClick={() => onBack('semester')} className="text-indigo-600 hover:underline">
        {dept.name}{spec ? ` · ${spec.name}` : ''}
      </button>
      <span className="text-gray-300">/</span>
      <span className="font-semibold text-gray-800">Semester {classStructure.semester}</span>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left — Add form */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
        <CourseForm classStructure={classStructure} departmentId={dept.id} />
      </div>

      {/* Right — Course list */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
        <CourseList classStructure={classStructure} />
      </div>
    </div>
  </div>
);

export default CourseManager;
