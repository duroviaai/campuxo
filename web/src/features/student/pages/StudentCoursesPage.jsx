import { useEffect, useState, useCallback } from 'react';
import { getMyCourses, enrollCourse, unenrollCourse } from '../services/studentService';
import axiosInstance from '../../../api/axiosInstance';
import { useGetMyClassmatesQuery } from '../state/studentApi';
import { Tabs, SearchInput, Badge, Btn } from '../../../shared/components/ui/PageShell';

// ── Course panel (slide-out) ──────────────────────────────────────────────────

const Avatar = ({ name, photoUrl, size = 8 }) => {
  const initials = name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const sz = `w-${size} h-${size}`;
  if (photoUrl) return <img src={photoUrl} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${sz} rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0`}
      style={{ background: '#7c3aed' }}>
      {initials}
    </div>
  );
};

const ClassmatesTab = ({ courseId, search }) => {
  const { data: classmates = [], isLoading } = useGetMyClassmatesQuery(courseId);

  const filtered = search
    ? classmates.filter(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()))
    : classmates;

  if (isLoading) return (
    <div className="space-y-2 p-4">
      {[1,2,3].map(i => <div key={i} className="h-12 skeleton rounded-lg" />)}
    </div>
  );

  if (classmates.length === 0) return (
    <div className="py-12 text-center px-4">
      <p className="text-sm font-semibold" style={{ color: '#334155' }}>You are the only one enrolled in this course</p>
    </div>
  );

  if (filtered.length === 0) return (
    <p className="text-sm text-center py-8 px-4" style={{ color: '#94a3b8' }}>No classmates match your search.</p>
  );

  return (
    <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
      {filtered.map(c => (
        <div key={c.id} className="flex items-center gap-3 px-4 py-3">
          <Avatar name={`${c.firstName} ${c.lastName}`} photoUrl={c.photoUrl} size={9} />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#0f172a' }}>
              {c.firstName} {c.lastName}
            </p>
            <p className="text-[11px]" style={{ color: '#94a3b8' }}>
              {c.department || '—'}{c.yearOfStudy ? ` · Year ${c.yearOfStudy}` : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const CoursePanel = ({ course, onClose, onEnroll, onUnenroll, actionLoading }) => {
  const [tab, setTab]           = useState('details');
  const [cmSearch, setCmSearch] = useState('');

  const { data: classmates = [] } = useGetMyClassmatesQuery(course.id, { skip: tab !== 'classmates' });

  const PANEL_TABS = [
    { key: 'details',    label: 'Course Details' },
    { key: 'classmates', label: `Classmates${classmates.length > 0 ? ` (${classmates.length})` : ''}` },
  ];

  const Detail = ({ label, value }) => value ? (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#94a3b8' }}>{label}</p>
      <p className="text-sm" style={{ color: '#334155' }}>{value}</p>
    </div>
  ) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col animate-slide-in-right"
        style={{ width: '100%', maxWidth: 420, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 shrink-0" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: '#7c3aed' }}>
            {course.code?.slice(0, 2) || '??'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight" style={{ color: '#0f172a' }}>{course.name}</p>
            <p className="text-[11px] font-mono mt-0.5" style={{ color: '#94a3b8' }}>{course.code}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0 transition-colors"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
            onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 pb-0 shrink-0">
          <Tabs tabs={PANEL_TABS} active={tab} onChange={t => { setTab(t); setCmSearch(''); }} />
        </div>

        {/* Classmates search */}
        {tab === 'classmates' && (
          <div className="px-4 pt-3 pb-1 shrink-0">
            <SearchInput value={cmSearch} onChange={setCmSearch} placeholder="Search classmates…" />
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'details' && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Detail label="Credits"      value={course.credits != null ? `${course.credits} credits` : null} />
                <Detail label="Program Type" value={course.programType} />
                <Detail label="Scheme"       value={course.scheme} />
                <Detail label="Students"     value={course.studentCount != null ? `${course.studentCount} enrolled` : null} />
              </div>

              {/* Instructor */}
              <div className="rounded-xl p-4" style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>Instructor</p>
                {course.facultyName ? (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ background: '#059669' }}>
                      {course.facultyName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{course.facultyName}</p>
                      {course.facultyDesignation && (
                        <p className="text-[11px]" style={{ color: '#94a3b8' }}>{course.facultyDesignation}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: '#cbd5e1' }}>No instructor assigned</p>
                )}
              </div>

              {/* Enroll / Unenroll */}
              <div className="pt-1">
                {course.enrolled ? (
                  <Btn variant="danger" onClick={() => onUnenroll(course.id)} disabled={actionLoading === course.id} className="w-full justify-center">
                    {actionLoading === course.id ? 'Removing…' : 'Unenroll from this course'}
                  </Btn>
                ) : (
                  <Btn variant="primary" onClick={() => onEnroll(course.id)} disabled={actionLoading === course.id} className="w-full justify-center">
                    {actionLoading === course.id ? 'Enrolling…' : 'Enroll in this course'}
                  </Btn>
                )}
              </div>
            </div>
          )}

          {tab === 'classmates' && (
            <ClassmatesTab courseId={course.id} search={cmSearch} />
          )}
        </div>
      </div>
    </>
  );
};

// ── Course card ───────────────────────────────────────────────────────────────

const CourseCard = ({ course, onEnroll, onUnenroll, loading, onClick }) => (
  <div
    className="bg-white rounded-xl p-5 flex flex-col gap-4 transition-all cursor-pointer"
    style={{ border: '1px solid #e8edf2' }}
    onClick={onClick}
    onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4d4d8'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8edf2'; e.currentTarget.style.boxShadow = ''; }}
  >
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ background: '#7c3aed' }}>
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

    {/* Instructor */}
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#f8fafc' }}>
      <svg className="w-3.5 h-3.5 shrink-0" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>Instructor</p>
        {course.facultyName ? (
          <>
            <p className="text-xs font-semibold truncate" style={{ color: '#334155' }}>{course.facultyName}</p>
            {course.facultyDesignation && (
              <p className="text-[10px] truncate" style={{ color: '#94a3b8' }}>{course.facultyDesignation}</p>
            )}
          </>
        ) : (
          <p className="text-xs" style={{ color: '#cbd5e1' }}>No instructor assigned</p>
        )}
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      {course.credits != null && (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-md" style={{ background: '#f5f3ff', color: '#7c3aed' }}>{course.credits} credits</span>
      )}
      <span className="text-[11px] px-2 py-0.5 rounded-md" style={{ background: '#f8fafc', color: '#64748b' }}>{course.studentCount ?? 0} students</span>
    </div>

    <div onClick={e => e.stopPropagation()}>
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

// ── Page ──────────────────────────────────────────────────────────────────────

const StudentCoursesPage = () => {
  const [tab, setTab]             = useState('enrolled');
  const [courses, setCourses]     = useState([]);
  const [enrolled, setEnrolled]   = useState([]);
  const [search, setSearch]       = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [actionLoading, setActionLoading]   = useState(null);
  const [error, setError]         = useState(null);

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
      setSelectedCourse(prev => prev?.id === courseId ? { ...prev, enrolled: true, studentCount: (prev.studentCount || 0) + 1 } : prev);
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
      setSelectedCourse(prev => prev?.id === courseId ? { ...prev, enrolled: false, studentCount: Math.max(0, (prev.studentCount || 1) - 1) } : prev);
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
          {filtered.map(course => {
            const c = tab === 'enrolled' ? { ...course, enrolled: true } : course;
            return (
              <CourseCard
                key={c.id}
                course={c}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
                loading={actionLoading}
                onClick={() => setSelectedCourse(c)}
              />
            );
          })}
        </div>
      ) : search ? (
        <p className="text-sm text-center py-10" style={{ color: '#94a3b8' }}>No courses match your search.</p>
      ) : null}

      {selectedCourse && (
        <CoursePanel
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onEnroll={handleEnroll}
          onUnenroll={handleUnenroll}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default StudentCoursesPage;
