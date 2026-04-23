import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetFacultyByIdQuery, useGetFacultyAssignedCoursesQuery, useAssignCoursesToFacultyMutation, useRemoveCourseFromFacultyMutation } from '../state/facultyApi';
import { useGetCoursesQuery } from '../../course/state/courseApi';
import { getFullName } from '../utils/facultyHelpers';
import Loader from '../../../shared/components/feedback/Loader';
import ROUTES from '../../../app/routes/routeConstants';

const AssignCoursesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: faculty, isLoading: facultyLoading } = useGetFacultyByIdQuery(id);
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesQuery({ size: 200 });
  const { data: assigned = [], isLoading: assignedLoading } = useGetFacultyAssignedCoursesQuery(id);
  const [assignCoursesToFaculty, { isLoading: saving }] = useAssignCoursesToFacultyMutation();
  const [removeCourseFromFaculty] = useRemoveCourseFromFacultyMutation();

  const [selected, setSelected] = useState([]);
  const [search, setSearch]     = useState('');

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
                  <button
                    onClick={() => handleRemove(course.id)}
                    className="ml-3 shrink-0 px-2.5 py-1 text-xs font-semibold rounded-lg text-red-500 border border-red-100 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCoursesPage;
