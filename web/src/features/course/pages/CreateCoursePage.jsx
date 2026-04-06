import { useNavigate } from 'react-router-dom';
import { createCourse } from '../services/courseService';
import CourseForm from '../components/CourseForm';
import ROUTES from '../../../app/routes/routeConstants';

const CreateCoursePage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await createCourse(data);
    navigate(ROUTES.ADMIN_COURSES);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 max-w-xl">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">Create Course</h2>
      <CourseForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateCoursePage;
