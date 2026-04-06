import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, getCourseStudents } from '../../course/services/courseService';
import { markAttendanceBatch } from '../services/attendanceService';
import ROUTES from '../../../app/routes/routeConstants';

const today = () => new Date().toISOString().split('T')[0];

const MarkAttendancePage = () => {
  const navigate = useNavigate();
  const [courseList, setCourseList]   = useState([]);
  const [courseId, setCourseId]       = useState('');
  const [date, setDate]               = useState(today());
  const [students, setStudents]       = useState([]);
  const [statuses, setStatuses]       = useState({});
  const [loading, setLoading]         = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [submitMsg, setSubmitMsg]     = useState(null);
  const [error, setError]             = useState(null);

  useEffect(() => {
    getCourses({ size: 200 }).then((d) => setCourseList(d.content ?? d)).catch(() => {});
  }, []);

  const handleLoadStudents = async () => {
    if (!courseId) return;
    setLoading(true);
    setStudentsLoaded(false);
    setSubmitMsg(null);
    setError(null);
    try {
      const data = await getCourseStudents(courseId);
      setStudents(data);
      const initial = {};
      data.forEach((s) => { initial[s.id] = 'PRESENT'; });
      setStatuses(initial);
      setStudentsLoaded(true);
    } catch {
      setError('Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) =>
    setStatuses((prev) => ({ ...prev, [id]: prev[id] === 'PRESENT' ? 'ABSENT' : 'PRESENT' }));

  const handleSubmit = async () => {
    if (!courseId || !studentsLoaded) return;
    setLoading(true);
    setSubmitMsg(null);
    setError(null);
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        courseId:  Number(courseId),
        classId:   s.classBatchId ?? 1,
        date,
        status:    statuses[s.id] ?? 'ABSENT',
      }));
      await markAttendanceBatch(records);
      setSubmitMsg('Attendance submitted successfully!');
    } catch {
      setError('Failed to submit attendance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.ADMIN_ATTENDANCE)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
      </div>

      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setStudentsLoaded(false); setStudents([]); }}
            >
              <option value="">-- Select course --</option>
              {courseList.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleLoadStudents}
          disabled={!courseId || loading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading && !studentsLoaded ? 'Loading...' : 'Load Students'}
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {studentsLoaded && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {students.length === 0 ? (
            <p className="p-5 text-sm text-gray-500">No students enrolled in this course.</p>
          ) : (
            <>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">#</th>
                    <th className="px-6 py-3 text-left">Student Name</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">{s.fullName || `${s.firstName} ${s.lastName}`}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => toggle(s.id)}
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            statuses[s.id] === 'PRESENT'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {statuses[s.id] === 'PRESENT' ? '✓ Present' : '✗ Absent'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
                {submitMsg && <span className="text-sm text-green-600 font-medium">{submitMsg}</span>}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkAttendancePage;
