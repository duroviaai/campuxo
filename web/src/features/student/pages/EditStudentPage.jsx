import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetStudentByIdQuery, useUpdateStudentMutation } from '../state/studentApi';
import StudentForm from '../components/StudentForm';
import Loader from '../../../shared/components/feedback/Loader';
import ROUTES from '../../../app/routes/routeConstants';

const EditStudentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: student, isLoading, error } = useGetStudentByIdQuery(id);
  const [updateStudent] = useUpdateStudentMutation();

  const handleSubmit = async (data) => {
    try {
      await updateStudent({ id, ...data }).unwrap();
      toast.success('Student updated successfully');
      navigate(ROUTES.ADMIN_STUDENTS);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update student.');
    }
  };

  if (isLoading) return <Loader />;
  if (error)     return <p className="text-sm text-red-500">Failed to load student.</p>;

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.ADMIN_STUDENTS)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Student</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <StudentForm initialData={student} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};

export default EditStudentPage;
