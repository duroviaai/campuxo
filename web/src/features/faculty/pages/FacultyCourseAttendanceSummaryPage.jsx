import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetFacultyCoursesQuery, useGetFacultyCourseAttendanceSummaryQuery } from '../state/facultyApi';
import ROUTES from '../../../app/routes/routeConstants';

const LOW_PCT = 75;

const sel = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50 disabled:bg-gray-50';

const PctBadge = ({ pct }) => {
  const low = pct < LOW_PCT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
      low ? 'bg-red-100 text-red-700' : pct >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      {low && <span>⚠</span>}
      {pct.toFixed(1)}%
    </span>
  );
};

const FacultyCourseAttendanceSummaryPage = () => {
  const navigate = useNavigate();
  const [courseId, setCourseId]   = useState('');
  const [search, setSearch]       = useState('');
  const [lowOnly, setLowOnly]     = useState(false);

  const { data: courses = [], isLoading: coursesLoading } = useGetFacultyCoursesQuery();
  const { data: rows = [], isLoading: rowsLoading, isFetching } = useGetFacultyCourseAttendanceSummaryQuery(
    Number(courseId), { skip: !courseId }
  );

  const loading = rowsLoading || isFetching;

  const filtered = rows.filter((r) => {
    if (lowOnly && r.attendancePercentage >= LOW_PCT) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.studentName?.toLowerCase().includes(q) || r.registrationNumber?.toLowerCase().includes(q);
    }
    return true;
  });

  const lowCount = rows.filter((r) => r.attendancePercentage < LOW_PCT).length;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Course selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="text-xs font-semibold text-gray-500 block mb-1">Select Course</label>
        <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setSearch(''); setLowOnly(false); }}
          className={sel} disabled={coursesLoading}>
          <option value="">{coursesLoading ? 'Loading…' : 'Select a course'}</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>

      {courseId && (
        <>
          {/* Stats bar */}
          {!loading && rows.length > 0 && (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-xs font-medium text-gray-500">
                Total: <span className="font-bold text-gray-800">{rows.length}</span>
              </span>
              <span className="text-xs font-medium text-gray-500">
                Below 75%: <span className="font-bold text-red-600">{lowCount}</span>
              </span>
              <span className="text-xs font-medium text-gray-500">
                Avg: <span className="font-bold text-indigo-600">
                  {rows.length ? (rows.reduce((s, r) => s + r.attendancePercentage, 0) / rows.length).toFixed(1) : 0}%
                </span>
              </span>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              placeholder="Search by name or reg no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-60"
            />
            <button
              onClick={() => setLowOnly((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                lowOnly
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-red-600 border-red-300 hover:bg-red-50'
              }`}>
              ⚠ Low Attendance Only {lowOnly && lowCount > 0 ? `(${lowCount})` : ''}
            </button>
            {(search || lowOnly) && (
              <button onClick={() => { setSearch(''); setLowOnly(false); }}
                className="text-xs text-gray-400 hover:text-gray-600 underline">
                Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-400">No attendance data found for this course.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-400">No students match the current filters.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Reg No</th>
                      <th className="px-4 py-3 text-left">Total Classes</th>
                      <th className="px-4 py-3 text-left">Present</th>
                      <th className="px-4 py-3 text-left">Absent</th>
                      <th className="px-4 py-3 text-left">Attendance %</th>
                      <th className="px-4 py-3 text-left"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((r, i) => {
                      const low = r.attendancePercentage < LOW_PCT;
                      const absent = r.totalClasses - r.attendedClasses;
                      return (
                        <tr key={r.studentId}
                          className={`transition-colors ${low ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-3">
                            <span className={`font-medium ${low ? 'text-red-800' : 'text-gray-900'}`}>
                              {r.studentName}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-gray-400">
                            {r.registrationNumber || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">{r.totalClasses}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-green-700">{r.attendedClasses}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-red-600">{absent}</td>
                          <td className="px-4 py-3">
                            <PctBadge pct={r.attendancePercentage} />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(
                                ROUTES.FACULTY_STUDENT_ATTENDANCE.replace(':studentId', r.studentId),
                                { state: { studentName: r.studentName } }
                              )}
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors whitespace-nowrap">
                              View Details →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FacultyCourseAttendanceSummaryPage;
