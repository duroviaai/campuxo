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
    <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Edit Student</h2>
      <StudentForm initialData={student} onSubmit={handleSubmit} />
    </div>
  );
};

export default EditStudentPage;
