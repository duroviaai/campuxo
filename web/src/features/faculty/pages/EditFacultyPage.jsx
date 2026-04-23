import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetFacultyByIdQuery, useUpdateFacultyMutation } from '../state/facultyApi';
import FacultyForm from '../components/FacultyForm';
import Loader from '../../../shared/components/feedback/Loader';
import ROUTES from '../../../app/routes/routeConstants';

const EditFacultyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: faculty, isLoading, error } = useGetFacultyByIdQuery(id);
  const [updateFaculty] = useUpdateFacultyMutation();

  const handleSubmit = async (data) => {
    await updateFaculty({ id, ...data }).unwrap();
    toast.success('Faculty updated successfully');
    navigate(ROUTES.ADMIN_FACULTY);
  };

  if (isLoading) return <Loader />;
  if (error)     return <p className="text-sm text-red-500">Failed to load faculty member.</p>;

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.ADMIN_FACULTY)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Faculty</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <FacultyForm initialData={faculty} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default EditFacultyPage;
