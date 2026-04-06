import { useNavigate } from 'react-router-dom';
import { createFaculty } from '../services/facultyService';
import FacultyForm from '../components/FacultyForm';
import ROUTES from '../../../app/routes/routeConstants';

const CreateFacultyPage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await createFaculty(data);
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
