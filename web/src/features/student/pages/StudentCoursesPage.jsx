import { useEffect, useState, useCallback } from 'react';
import { getMyCourses, enrollCourse, unenrollCourse } from '../services/studentService';
import axiosInstance from '../../../api/axiosInstance';
import { Tabs, SearchInput, Badge, Btn } from '../../../shared/components/ui/PageShell';

const CourseCard = ({ course, onEnroll, onUnenroll, loading }) => (
  <div
    className="bg-white rounded-xl p-5 flex flex-col gap-4 transition-all"
    style={{ border: '1px solid #e8edf2' }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4d4d8'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8edf2'; e.currentTarget.style.boxShadow = ''; }}
  >
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: '#7c3aed' }}>
        {course.code?.slice(0, 2) || '??'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight" style={{ color: '#0f172a' }}>{course.name}</p>
        <p className="text-[11px] font-mono mt-0.5" style={{ color: '#94a3b8' }}>{course.code}</p>
      </div>
      {course.enrolled != null && (
        <Badge color={course.enrolled ? 'green' : 'gray'}>{course.enrolled ? 'Enrolled' : 'Not enrolled'}</Badge>
      )}
    </div>

    <div className="flex flex-wrap gap-2">
      {course.credits != null && (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ background: '#f5f3ff', color: '#7c3aed' }}>{course.credits} credits</span>
      )}
      {course.facultyName && (
        <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: '#f8fafc', color: '#64748b' }}>{course.facultyName}</span>
      )}
      <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: '#f8fafc', color: '#64748b' }}>{course.studentCount ?? 0} students</span>
    </div>

    <div>
      {course.enrolled ? (
        <Btn variant="danger" onClick={() => onUnenroll(course.id)} disabled={loading === course.id} className="w-full justify-center">
          {loading === course.id ? 'Removing…' : 'Unenroll'}
        </Btn>
      ) : (
        <Btn variant="primary" onClick={() => onEnroll(course.id)} disabled={loading === course.id} className="w-full justify-center">
          {loading === course.id ? 'Enrolling…' : 'Enroll'}
        </Btn>
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

  useEffect(() => { refreshEnrolled(); loadClassCourses(); }, []);

  const refreshEnrolled = () => getMyCourses().then(setEnrolled).catch(() => {});
  const loadClassCourses = () => {
    setLoadingCourses(true);
    axiosInstance.get('/api/v1/students/me/class/courses')
      .then(res => setCourses(res.data))
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoadingCourses(false));
  };

  const handleEnroll = useCallback(async (courseId) => {
    setActionLoading(courseId); setError(null);
    try {
      await enrollCourse(courseId);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: true, studentCount: (c.studentCount || 0) + 1 } : c));
      refreshEnrolled();
    } catch (err) { setError(err?.response?.data?.message || 'Enrollment failed.'); }
    finally { setActionLoading(null); }
  }, []);

  const handleUnenroll = useCallback(async (courseId) => {
    setActionLoading(courseId); setError(null);
    try {
      await unenrollCourse(courseId);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: false, studentCount: Math.max(0, (c.studentCount || 1) - 1) } : c));
      setEnrolled(prev => prev.filter(c => c.id !== courseId));
    } catch (err) { setError(err?.response?.data?.message || 'Unenroll failed.'); }
    finally { setActionLoading(null); }
  }, []);

  const TABS = [
    { key: 'enrolled', label: `My Courses${enrolled.length > 0 ? ` (${enrolled.length})` : ''}` },
    { key: 'all',      label: 'Class Courses' },
  ];

  const displayList = tab === 'enrolled' ? enrolled : courses;
  const filtered = search
    ? displayList.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.code?.toLowerCase().includes(search.toLowerCase()))
    : displayList;

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Tabs tabs={TABS} active={tab} onChange={k => { setTab(k); setError(null); setSearch(''); }} />
        {displayList.length > 0 && <SearchInput value={search} onChange={setSearch} placeholder="Search by name or code…" />}
      </div>

      {error && <p className="text-xs font-medium px-3 py-2 rounded-lg" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>{error}</p>}

      {tab === 'enrolled' && enrolled.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#f1f5f9' }}>
            <svg className="w-5 h-5" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: '#334155' }}>No courses enrolled yet</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Browse Class Courses to get started.</p>
        </div>
      )}

      {tab === 'all' && loadingCourses ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="rounded-xl h-44 skeleton" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <CourseCard key={course.id} course={tab === 'enrolled' ? { ...course, enrolled: true } : course} onEnroll={handleEnroll} onUnenroll={handleUnenroll} loading={actionLoading} />
          ))}
        </div>
      ) : search ? (
        <p className="text-sm text-center py-10" style={{ color: '#94a3b8' }}>No courses match your search.</p>
      ) : null}
    </div>
  );
};

export default StudentCoursesPage;
