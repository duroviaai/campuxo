import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetFacultyCourseStudentsQuery } from '../state/facultyApi';
import { getStudentAttendanceSummary } from '../../attendance/services/attendanceService';
import { PctBar } from '../../../shared/components/ui/PageShell';
import ROUTES from '../../../app/routes/routeConstants';

const PAGE_SIZE = 20;

// Fetches attendance % for a single student across all courses, returns the
// percentage for the specific courseId, or overall if not found.
const useStudentAttendancePct = (studentId, courseId) => {
  const [pct, setPct] = useState(null);
  useEffect(() => {
    let cancelled = false;
    getStudentAttendanceSummary(studentId)
      .then((summaries) => {
        if (cancelled) return;
        const match = summaries.find(s => String(s.courseId) === String(courseId));
        if (match) { setPct(match.attendancePercentage); return; }
        // fallback: average across all courses
        if (summaries.length) {
          const avg = summaries.reduce((s, c) => s + c.attendancePercentage, 0) / summaries.length;
          setPct(Math.round(avg * 10) / 10);
        } else { setPct(0); }
      })
      .catch(() => { if (!cancelled) setPct(null); });
    return () => { cancelled = true; };
  }, [studentId, courseId]);
  return pct;
};

const AttendanceCell = ({ studentId, courseId }) => {
  const pct = useStudentAttendancePct(studentId, courseId);
  if (pct === null) return <span className="text-xs" style={{ color: '#cbd5e1' }}>—</span>;
  return <PctBar pct={pct} />;
};

const FacultyCourseStudentsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch]   = useState('');
  const [query, setQuery]     = useState('');
  const [page, setPage]       = useState(0);

  // Debounce search → query
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search); setPage(0); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching } = useGetFacultyCourseStudentsQuery({
    courseId: Number(courseId), search: query, page, size: PAGE_SIZE,
  });

  const students   = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalItems = data?.totalElements ?? 0;
  const courseName = students[0]?.courseName ?? `Course ${courseId}`;

  const handleSearch = useCallback((e) => setSearch(e.target.value), []);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.FACULTY_COURSES)}
          className="p-1.5 rounded-lg text-sm transition-colors"
          style={{ color: '#64748b' }}
          onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = ''}>
          ←
        </button>
        <div>
          <p className="text-base font-bold" style={{ color: '#0f172a' }}>Students</p>
          {!isLoading && (
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {totalItems} student{totalItems !== 1 ? 's' : ''} enrolled
            </p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
          style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search name or reg no…"
          className="w-full pl-8 pr-4 py-2 text-sm rounded-lg outline-none"
          style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#0f172a' }}
          onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = ''; }}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl skeleton" />)}
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ border: '1px solid #e2e8f0' }}>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {query ? 'No students match your search.' : 'No students enrolled in this course.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0', opacity: isFetching ? 0.7 : 1, transition: 'opacity 0.15s' }}>
          <table className="min-w-full text-sm">
            <thead style={{ background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
              <tr>
                {['#', 'Name', 'Reg No.', 'Department', 'Year', 'Attendance'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: '#94a3b8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}
                  style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#94a3b8' }}>
                    {page * PAGE_SIZE + i + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                        style={{ background: '#7c3aed' }}>
                        {s.fullName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{s.fullName}</p>
                        <p className="text-[11px]" style={{ color: '#94a3b8' }}>{s.email ?? ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-mono" style={{ color: '#94a3b8' }}>
                    {s.registrationNumber ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#64748b' }}>
                    {s.department ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#64748b' }}>
                    {s.yearOfStudy ? `Year ${s.yearOfStudy}` : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <AttendanceCell studentId={s.id} courseId={courseId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            Page {page + 1} of {totalPages} · {totalItems} students
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
              style={{ border: '1px solid #e2e8f0', color: '#334155', background: '#fff' }}
              onMouseEnter={e => { if (page > 0) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(0, Math.min(page - 2, totalPages - 5));
              const p = start + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg transition-colors"
                  style={{
                    border: '1px solid #e2e8f0',
                    background: p === page ? '#7c3aed' : '#fff',
                    color: p === page ? '#fff' : '#334155',
                  }}>
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
              style={{ border: '1px solid #e2e8f0', color: '#334155', background: '#fff' }}
              onMouseEnter={e => { if (page < totalPages - 1) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyCourseStudentsPage;
