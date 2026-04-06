import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentById, updateStudent } from '../services/studentService';
import StudentForm from '../components/StudentForm';
import Loader from '../../../shared/components/feedback/Loader';
import ROUTES from '../../../app/routes/routeConstants';

const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudentById(id)
      .then(setStudent)
      .catch(() => setError('Failed to load student.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    await updateStudent(id, data);
    navigate(ROUTES.ADMIN_STUDENTS);
  };

  if (loading) return <Loader />;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.ADMIN_STUDENTS)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <StudentForm initialData={student} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default EditStudentPage;
