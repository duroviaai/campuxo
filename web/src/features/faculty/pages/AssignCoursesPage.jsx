import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetFacultyByIdQuery, useGetFacultyAssignedCoursesQuery, useAssignCoursesToFacultyMutation, useRemoveCourseFromFacultyMutation, useAssignClassesToCourseMutation } from '../state/facultyApi';
import { useGetCoursesQuery } from '../../course/state/courseApi';
import { useGetAllClassesQuery } from '../../student/state/studentApi';
import { getFullName } from '../utils/facultyHelpers';
import Loader from '../../../shared/components/feedback/Loader';
import ROUTES from '../../../app/routes/routeConstants';

const AssignCoursesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: faculty, isLoading: facultyLoading } = useGetFacultyByIdQuery(id);
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesQuery({ size: 200 });
  const { data: assigned = [], isLoading: assignedLoading } = useGetFacultyAssignedCoursesQuery(id);
  const { data: allClasses = [] } = useGetAllClassesQuery();
  const [assignCoursesToFaculty, { isLoading: saving }] = useAssignCoursesToFacultyMutation();
  const [removeCourseFromFaculty] = useRemoveCourseFromFacultyMutation();
  const [assignClassesToCourse] = useAssignClassesToCourseMutation();

  const [selected, setSelected]         = useState([]);
  const [search, setSearch]             = useState('');
  const [classModal, setClassModal]     = useState(null); // { courseId, courseName }
  const [selectedClasses, setSelectedClasses] = useState([]);

  const allCourses = coursesData?.content ?? coursesData ?? [];
  const loading = facultyLoading || coursesLoading || assignedLoading;

  const assignedIds = new Set(assigned.map((c) => c.id));

  const unassigned = allCourses.filter(
    (c) => !assignedIds.has(c.id) &&
      (c.name?.toLowerCase().includes(search.toLowerCase()) ||
       c.code?.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSelect = (courseId) =>
    setSelected((prev) =>
      prev.includes(courseId) ? prev.filter((x) => x !== courseId) : [...prev, courseId]
    );

  const handleAssign = async () => {
    if (!selected.length) return;
    try {
      await assignCoursesToFaculty({ facultyId: id, courseIds: selected }).unwrap();
      toast.success(`${selected.length} course(s) assigned.`);
      setSelected([]);
    } catch {
      toast.error('Failed to assign courses.');
    }
  };

  const handleRemove = async (courseId) => {
    if (!window.confirm('Remove this course from faculty?')) return;
    try {
      await removeCourseFromFaculty({ facultyId: id, courseId }).unwrap();
      toast.success('Course removed.');
    } catch {
      toast.error('Failed to remove course.');
    }
  };

  const openClassModal = (course) => {
    setClassModal({ courseId: course.id, courseName: course.name });
    setSelectedClasses([]);
  };

  const handleAssignClasses = async () => {
    if (!selectedClasses.length) return;
    try {
      await assignClassesToCourse({ facultyId: id, courseId: classModal.courseId, classIds: selectedClasses }).unwrap();
      toast.success(`${selectedClasses.length} class(es) assigned.`);
      setClassModal(null);
    } catch {
      toast.error('Failed to assign classes.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_FACULTY)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assign Courses</h1>
          {faculty && (
            <p className="text-sm text-gray-500 mt-0.5">
              Faculty: <span className="font-semibold text-gray-700">{getFullName(faculty)}</span>
              {faculty.department && <span className="ml-2 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{faculty.department}</span>}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Available courses to assign */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">Available Courses</h2>
            {selected.length > 0 && (
              <button
                onClick={handleAssign}
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Assigning…' : `Assign (${selected.length})`}
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder="Search by name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {unassigned.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                {allCourses.length === assigned.length ? 'All courses are already assigned.' : 'No courses match.'}
              </p>
            ) : (
              unassigned.map((course) => {
                const isSelected = selected.includes(course.id);
                return (
                  <label
                    key={course.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(course.id)}
                      className="accent-indigo-600 w-4 h-4 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{course.code}{course.credits ? ` · ${course.credits} credits` : ''}</p>
                    </div>
                  </label>
                );
              })
            )}
          </div>

          {selected.length > 0 && (
            <button
              onClick={handleAssign}
              disabled={saving}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
            >
              {saving ? 'Assigning…' : `Assign ${selected.length} Course${selected.length > 1 ? 's' : ''} →`}
            </button>
          )}
        </div>

        {/* Right: Already assigned */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700">
            Assigned Courses
            <span className="ml-2 text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              {assigned.length}
            </span>
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {assigned.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No courses assigned yet.</p>
            ) : (
              assigned.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/60 group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{course.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{course.code}{course.credits ? ` · ${course.credits} credits` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button
                      onClick={() => openClassModal(course)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg text-indigo-600 border border-indigo-100 hover:bg-indigo-50 transition-colors"
                    >
                      + Classes
                    </button>
                    <button
                      onClick={() => handleRemove(course.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg text-red-500 border border-red-100 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {classModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Assign Classes</h2>
              <button onClick={() => setClassModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>
            <p className="text-xs text-gray-500">Course: <span className="font-semibold text-gray-700">{classModal.courseName}</span></p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allClasses.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No classes available. Create classes first.</p>
              ) : (
                allClasses.map((cls) => (
                  <label key={cls.id} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedClasses.includes(cls.id) ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(cls.id)}
                      onChange={() => setSelectedClasses((prev) =>
                        prev.includes(cls.id) ? prev.filter((x) => x !== cls.id) : [...prev, cls.id]
                      )}
                      className="accent-indigo-600 w-4 h-4 shrink-0"
                    />
                    <span className="text-sm text-gray-800">{cls.displayName}</span>
                  </label>
                ))
              )}
            </div>
            <button
              onClick={handleAssignClasses}
              disabled={!selectedClasses.length}
              className="w-full py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40"
            >
              Assign {selectedClasses.length > 0 ? `${selectedClasses.length} Class(es)` : 'Classes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignCoursesPage;
