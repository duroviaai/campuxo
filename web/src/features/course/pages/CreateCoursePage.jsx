import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateCourseMutation } from '../state/courseApi';
import CourseForm from '../components/CourseForm';
import ROUTES from '../../../app/routes/routeConstants';

const CreateCoursePage = () => {
  const navigate = useNavigate();
  const [createCourse] = useCreateCourseMutation();

  const handleSubmit = async (data) => {
    await createCourse(data).unwrap();
    toast.success('Course created successfully');
    navigate(ROUTES.ADMIN_COURSES, { state: { dept: data.programType } });
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.ADMIN_COURSES)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Add Course</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <CourseForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default CreateCoursePage;
