import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, updateCourse } from '../services/courseService';
import CourseForm from '../components/CourseForm';
import Loader from '../../../shared/components/feedback/Loader';
import ROUTES from '../../../app/routes/routeConstants';

const EditCoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getCourseById(id)
      .then(setCourse)
      .catch(() => setError('Failed to load course.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    await updateCourse(id, data);
    navigate(ROUTES.ADMIN_COURSES);
  };

  if (loading) return <Loader />;
  if (error)   return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Edit Course</h2>
      <CourseForm initialData={course} onSubmit={handleSubmit} />
    </div>
  );
};

export default EditCoursePage;
