import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateFacultyMutation } from '../state/facultyApi';
import FacultyForm from '../components/FacultyForm';
import ROUTES from '../../../app/routes/routeConstants';

const CreateFacultyPage = () => {
  const navigate = useNavigate();
  const [createFaculty] = useCreateFacultyMutation();

  const handleSubmit = async (data) => {
    await createFaculty(data).unwrap();
    toast.success('Faculty created successfully');
    navigate(ROUTES.ADMIN_FACULTY);
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.ADMIN_FACULTY)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add Faculty</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <FacultyForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateFacultyPage;
