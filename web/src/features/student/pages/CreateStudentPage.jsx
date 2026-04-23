import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateStudentMutation } from '../state/studentApi';
import StudentForm from '../components/StudentForm';
import ROUTES from '../../../app/routes/routeConstants';

const CreateStudentPage = () => {
  const navigate = useNavigate();
  const [createStudent] = useCreateStudentMutation();

  const handleSubmit = async (data) => {
    await createStudent(data).unwrap();
    toast.success('Student created successfully');
    navigate(ROUTES.ADMIN_STUDENTS);
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.ADMIN_STUDENTS)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Create Student</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <StudentForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateStudentPage;
