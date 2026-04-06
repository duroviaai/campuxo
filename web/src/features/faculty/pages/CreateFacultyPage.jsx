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
    <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Add Faculty</h2>
      <FacultyForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateFacultyPage;
