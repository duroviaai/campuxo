import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById } from '../services/studentService';
import AttendanceSummaryView from '../../attendance/components/AttendanceSummaryView';
import ROUTES from '../../../app/routes/routeConstants';

const Field = ({ label, value }) =>
  value ? (
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  ) : null;

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
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(ROUTES.ADMIN_STUDENTS)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          {student?.registrationNumber && (
            <p className="text-xs text-gray-400 font-mono mt-0.5">{student.registrationNumber}</p>
          )}
        </div>
        <button
          onClick={() => navigate(`${ROUTES.ADMIN_STUDENTS}/${id}/edit`)}
          className="ml-auto px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
        >
          Edit
        </button>
      </div>

      {student && (
        <div className="bg-white rounded-xl shadow p-5 grid grid-cols-2 sm:grid-cols-3 gap-5 text-sm">
          <Field label="Email"        value={student.email} />
          <Field label="Phone"        value={student.phone} />
          <Field label="Department"   value={student.department} />
          <Field label="Year of Study" value={student.yearOfStudy ? `Year ${student.yearOfStudy}` : null} />
          <Field label="Class / Batch" value={student.classBatchDisplayName || student.classBatchName} />
          <Field label="Scheme" value={student.scheme} />
          <Field label="Date of Birth" value={student.dateOfBirth} />
        </div>
      )}

      <AttendanceSummaryView studentId={Number(id)} studentName={name} />
    </div>
  );
};

export default StudentDetailsPage;
