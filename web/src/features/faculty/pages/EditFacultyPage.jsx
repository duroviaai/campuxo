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
    <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Edit Faculty</h2>
      <FacultyForm initialData={faculty} onSubmit={handleSubmit} />
    </div>
  );
};

export default EditFacultyPage;
