import { useState } from 'react';
import { useGetHodCoursesQuery, useGetHodAttendanceQuery } from '../state/hodApi';

const HodCoursesPage = () => {
  const { data: courses = [], isLoading, isError } = useGetHodCoursesQuery();
  const [selected, setSelected] = useState(null); // { courseId, classId, courseName }

  if (isLoading) return <p className="text-sm text-gray-500">Loading courses...</p>;
  if (isError)   return <p className="text-sm text-red-500">Failed to load courses.</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Department Courses</h1>

      {courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-3xl">📚</p>
          <p className="text-sm font-semibold text-gray-700 mt-2">No courses in your department.</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">#</th>
                <th className="px-6 py-3 text-left">Course</th>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-left">Credits</th>
                <th className="px-6 py-3 text-left">Faculty</th>
                <th className="px-6 py-3 text-left">Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{c.code ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{c.credits ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{c.facultyName ?? <span className="text-gray-300">Unassigned</span>}</td>
                  <td className="px-6 py-4 text-gray-500">{c.studentCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <AttendanceModal {...selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

const AttendanceModal = ({ courseId, classId, courseName, onClose }) => {
  const { data: overview = [], isLoading } = useGetHodAttendanceQuery({ courseId, classId });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{courseName} — Attendance Overview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="overflow-y-auto max-h-96">
          {isLoading ? (
            <p className="text-sm text-gray-500 p-6">Loading...</p>
          ) : overview.length === 0 ? (
            <p className="text-sm text-gray-400 p-6 text-center">No attendance data.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Attended</th>
                  <th className="px-6 py-3 text-left">Total</th>
                  <th className="px-6 py-3 text-left">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overview.map((s) => (
                  <tr key={s.studentId} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{s.studentName}</td>
                    <td className="px-6 py-3 text-gray-500">{s.attendedClasses}</td>
                    <td className="px-6 py-3 text-gray-500">{s.totalClasses}</td>
                    <td className="px-6 py-3">
                      <span className={`font-semibold ${s.attendancePercentage >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                        {s.attendancePercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default HodCoursesPage;
