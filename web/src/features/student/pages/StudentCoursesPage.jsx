import { useEffect, useState, useCallback } from 'react';
import {
  getPrograms,
  getCoursesByProgram,
  getMyCourses,
  enrollCourse,
  unenrollCourse,
} from '../services/studentService';

const CourseCard = ({ course, onEnroll, onUnenroll, loading }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-sm font-semibold text-gray-900">{course.name}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5">{course.code}</p>
      </div>
      {course.enrolled != null && (
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
          course.enrolled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {course.enrolled ? 'Enrolled' : 'Not enrolled'}
        </span>
      )}
    </div>

    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
      {course.credits != null && (
        <span className="flex items-center gap-1">
          <span className="text-indigo-400">●</span> {course.credits} credits
        </span>
      )}
      {course.facultyName && (
        <span className="flex items-center gap-1">
          <span className="text-indigo-400">●</span> {course.facultyName}
        </span>
      )}
      <span className="flex items-center gap-1">
        <span className="text-indigo-400">●</span> {course.studentCount ?? 0} students
      </span>
    </div>

    <div className="pt-1">
      {course.enrolled ? (
        <button
          onClick={() => onUnenroll(course.id)}
          disabled={loading === course.id}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {loading === course.id ? 'Removing...' : 'Unenroll'}
        </button>
      ) : (
        <button
          onClick={() => onEnroll(course.id)}
          disabled={loading === course.id}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading === course.id ? 'Enrolling...' : 'Enroll'}
        </button>
      )}
    </div>
  </div>
);

const StudentCoursesPage = () => {
  const [tab, setTab]           = useState('enrolled');   // 'enrolled' | program name
  const [programs, setPrograms] = useState([]);
  const [courses, setCourses]   = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [actionLoading, setActionLoading]   = useState(null); // courseId being acted on
  const [error, setError]       = useState(null);

  // Load programs list + enrolled courses on mount
  useEffect(() => {
    getPrograms().then(setPrograms).catch(() => {});
    refreshEnrolled();
  }, []);

  const refreshEnrolled = () => {
    getMyCourses().then(setEnrolled).catch(() => {});
  };

  // Load courses when tab changes to a program
  useEffect(() => {
    if (tab === 'enrolled') return;
    setLoadingCourses(true);
    setError(null);
    getCoursesByProgram(tab)
      .then(setCourses)
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoadingCourses(false));
  }, [tab]);

  const handleEnroll = useCallback(async (courseId) => {
    setActionLoading(courseId);
    setError(null);
    try {
      await enrollCourse(courseId);
      // Update enrolled flag in current list
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, enrolled: true, studentCount: (c.studentCount || 0) + 1 } : c));
      refreshEnrolled();
    } catch (err) {
      setError(err?.response?.data?.message || 'Enrollment failed.');
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleUnenroll = useCallback(async (courseId) => {
    setActionLoading(courseId);
    setError(null);
    try {
      await unenrollCourse(courseId);
      setCourses((prev) => prev.map((c) => c.id === courseId ? { ...c, enrolled: false, studentCount: Math.max(0, (c.studentCount || 1) - 1) } : c));
      setEnrolled((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unenroll failed.');
    } finally {
      setActionLoading(null);
    }
  }, []);

  const tabs = [{ key: 'enrolled', label: 'My Courses' }, ...programs.map((p) => ({ key: p, label: p }))];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Courses</h1>

      {/* Program tabs */}
      <div className="flex gap-1 flex-wrap border-b border-gray-200 pb-0">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setError(null); }}
            className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
              tab === key
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {label}
            {key === 'enrolled' && enrolled.length > 0 && (
              <span className="ml-1.5 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {enrolled.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</p>
      )}

      {/* Enrolled tab */}
      {tab === 'enrolled' && (
        enrolled.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">You haven't enrolled in any courses yet.</p>
            <p className="text-xs mt-1">Browse programs above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolled.map((course) => (
              <CourseCard
                key={course.id}
                course={{ ...course, enrolled: true }}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
                loading={actionLoading}
              />
            ))}
          </div>
        )
      )}

      {/* Program tab */}
      {tab !== 'enrolled' && (
        loadingCourses ? (
          <p className="text-sm text-gray-500">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-gray-500">No courses available for {tab}.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
                loading={actionLoading}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default StudentCoursesPage;
