import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFacultyById, updateFaculty } from '../services/facultyService';
import FacultyForm from '../components/FacultyForm';
import Loader from '../../../shared/components/feedback/Loader';
import ROUTES from '../../../app/routes/routeConstants';

const EditFacultyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getFacultyById(id)
      .then(setFaculty)
      .catch(() => setError('Failed to load faculty member.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    await updateFaculty(id, data);
    navigate(ROUTES.ADMIN_FACULTY);
  };

  if (loading) return <Loader />;
  if (error)   return <p className="text-sm text-red-500">{error}</p>;

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
