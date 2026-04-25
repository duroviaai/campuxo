import { useEffect, useState, useCallback } from 'react';
import {
  getMyCourses,
  enrollCourse,
  unenrollCourse,
} from '../services/studentService';
import axiosInstance from '../../../api/axiosInstance';

const CourseCard = ({ course, onEnroll, onUnenroll, loading }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all">
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
          {course.code?.slice(0, 2) || '??'}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">{course.name}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{course.code}</p>
        </div>
      </div>
      {course.enrolled != null && (
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
          course.enrolled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {course.enrolled ? '✓ Enrolled' : 'Not enrolled'}
        </span>
      )}
    </div>

    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
      {course.credits != null && (
        <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
          {course.credits} credits
        </span>
      )}
      {course.facultyName && (
        <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
          👤 {course.facultyName}
        </span>
      )}
      <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
        👥 {course.studentCount ?? 0} students
      </span>
    </div>

    <div className="pt-1">
      {course.enrolled ? (
        <button
          onClick={() => onUnenroll(course.id)}
          disabled={loading === course.id}
          className="w-full px-4 py-2 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {loading === course.id ? 'Removing...' : 'Unenroll'}
        </button>
      ) : (
        <button
          onClick={() => onEnroll(course.id)}
          disabled={loading === course.id}
          className="w-full px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading === course.id ? 'Enrolling...' : '+ Enroll'}
        </button>
      )}
    </div>
  </div>
);

const StudentCoursesPage = () => {
  const [tab, setTab]           = useState('enrolled');
  const [courses, setCourses]   = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [search, setSearch]     = useState('');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [actionLoading, setActionLoading]   = useState(null);
  const [error, setError]       = useState(null);

  useEffect(() => {
    refreshEnrolled();
    loadClassCourses();
  }, []);

  const refreshEnrolled = () => {
    getMyCourses().then(setEnrolled).catch(() => {});
  };

  const loadClassCourses = () => {
    setLoadingCourses(true);
    axiosInstance.get('/api/v1/students/me/class/courses')
      .then((res) => setCourses(res.data))
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoadingCourses(false));
  };

  const handleEnroll = useCallback(async (courseId) => {
    setActionLoading(courseId);
    setError(null);
    try {
      await enrollCourse(courseId);
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

  const tabs = [
    { key: 'enrolled', label: 'My Courses' },
    { key: 'all', label: 'My Class Courses' },
  ];

  const displayList = tab === 'enrolled' ? enrolled : courses;
  const filtered = search
    ? displayList.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.code?.toLowerCase().includes(search.toLowerCase())
      )
    : displayList;

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        {enrolled.length > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            {enrolled.length} enrolled
          </span>
        )}
      </div>

      {/* Program tabs */}
      <div className="flex gap-1 flex-wrap border-b border-gray-200">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setError(null); setSearch(''); }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-px ${
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

      {/* Search */}
      {(tab === 'enrolled' ? enrolled.length > 0 : courses.length > 0) && (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search courses by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>
      )}

      {/* Enrolled tab */}
      {tab === 'enrolled' && (
        enrolled.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-sm font-medium">You haven't enrolled in any courses yet.</p>
            <p className="text-xs mt-1">Browse "My Class Courses" to get started.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No courses match your search.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course) => (
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

      {/* All class courses tab */}
      {tab === 'all' && (
        loadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-xl h-40 animate-pulse border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-sm font-medium">{search ? 'No courses match your search.' : 'No courses available for your class yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course) => (
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
