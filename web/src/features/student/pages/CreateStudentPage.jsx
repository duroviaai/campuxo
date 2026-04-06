import { useNavigate } from 'react-router-dom';
import { createStudent } from '../services/studentService';
import StudentForm from '../components/StudentForm';
import ROUTES from '../../../app/routes/routeConstants';

const CreateStudentPage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await createStudent(data);
    navigate(ROUTES.ADMIN_STUDENTS);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Create Student</h2>
      <StudentForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateStudentPage;
