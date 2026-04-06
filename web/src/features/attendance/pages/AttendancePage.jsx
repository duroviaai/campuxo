import { useEffect } from 'react';
import useAttendance from '../hooks/useAttendance';
import AttendanceFilters from '../components/AttendanceFilters';
import AttendanceTable from '../components/AttendanceTable';
import Loader from '../../../shared/components/feedback/Loader';

const AttendancePage = () => {
  const {
    courseId, setCourseId,
    date, setDate,
    students, courseList,
    loading, submitting, error, success,
    loadCourses, fetchAttendance, updateStatus, submitAttendance,
  } = useAttendance();

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const handleCourseChange = (id) => {
    setCourseId(id);
    if (id && date) fetchAttendance(id, date);
  };

  const handleDateChange = (d) => {
    setDate(d);
    if (courseId && d) fetchAttendance(courseId, d);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">Attendance</h2>
        <AttendanceFilters
          courseList={courseList}
          courseId={courseId}
          date={date}
          onCourseChange={handleCourseChange}
          onDateChange={handleDateChange}
        />
      </div>

      {loading ? <Loader /> : (
        <AttendanceTable students={students} onStatusChange={updateStatus} />
      )}

      {error   && <p className="text-xs text-red-500">{error}</p>}
      {success && <p className="text-xs text-green-600">Attendance submitted successfully.</p>}

      {students.length > 0 && (
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={submitAttendance}
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
