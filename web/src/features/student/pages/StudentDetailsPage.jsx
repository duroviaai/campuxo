import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById } from '../services/studentService';
import AttendanceSummaryView from '../../attendance/components/AttendanceSummaryView';
import ROUTES from '../../../app/routes/routeConstants';

const StudentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentById(id)
      .then(setStudent)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  const name = student
    ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || student.email
    : `Student #${id}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.ADMIN_STUDENTS)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
      </div>

      {student && (
        <div className="bg-white rounded-xl shadow p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {student.department  && <div><p className="text-gray-400 text-xs">Department</p><p className="font-medium">{student.department}</p></div>}
          {student.yearOfStudy && <div><p className="text-gray-400 text-xs">Year</p><p className="font-medium">{student.yearOfStudy}</p></div>}
          {student.phone       && <div><p className="text-gray-400 text-xs">Phone</p><p className="font-medium">{student.phone}</p></div>}
        </div>
      )}

      <AttendanceSummaryView studentId={Number(id)} studentName={name} />
    </div>
  );
};

export default StudentDetailsPage;
