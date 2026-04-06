import { useEffect, useState } from 'react';
import { getStudentAttendanceSummary } from '../../attendance/services/attendanceService';

const pctColor = (pct) => {
  if (pct >= 75) return 'text-green-600';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const formatDate = (d) =>
  Array.isArray(d)
    ? `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`
    : d;

const AttendanceSummaryView = ({ studentId, studentName }) => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    getStudentAttendanceSummary(studentId)
      .then(setSummary)
      .catch((e) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <p className="text-sm text-gray-500">Loading attendance...</p>;
  if (error)   return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {studentName && (
        <h2 className="text-lg font-semibold text-gray-800">
          Attendance — {studentName}
        </h2>
      )}

      {summary.length === 0 ? (
        <p className="text-sm text-gray-500">No attendance records found.</p>
      ) : (
        summary.map((s) => (
          <div key={s.courseCode} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{s.courseName}</p>
                <p className="text-xs text-gray-400">{s.courseCode}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${pctColor(s.attendancePercentage)}`}>
                  {s.attendancePercentage}%
                </p>
                <p className="text-xs text-gray-500">
                  {s.attendedClasses} / {s.totalClasses} classes
                </p>
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${s.attendancePercentage >= 75 ? 'bg-green-500' : s.attendancePercentage >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                style={{ width: `${s.attendancePercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-green-600 mb-1">Present ({s.presentDates.length})</p>
                <div className="flex flex-wrap gap-1">
                  {s.presentDates.length === 0
                    ? <span className="text-xs text-gray-400">None</span>
                    : s.presentDates.map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700">{formatDate(d)}</span>
                      ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-600 mb-1">Absent ({s.absentDates.length})</p>
                <div className="flex flex-wrap gap-1">
                  {s.absentDates.length === 0
                    ? <span className="text-xs text-gray-400">None</span>
                    : s.absentDates.map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-700">{formatDate(d)}</span>
                      ))}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AttendanceSummaryView;
