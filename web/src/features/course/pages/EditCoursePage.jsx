import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
    toast.success('Course updated successfully');
    navigate(ROUTES.ADMIN_COURSES, { state: { dept: data.programType } });
  };

  if (loading) return <Loader />;
  if (error)   return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.ADMIN_COURSES, { state: { dept: course?.programType } })}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <CourseForm initialData={course} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default EditCoursePage;
