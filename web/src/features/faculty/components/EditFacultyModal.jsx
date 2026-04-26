import toast from 'react-hot-toast';
import { useGetFacultyByIdQuery, useUpdateFacultyMutation } from '../state/facultyApi';
import FacultyForm from './FacultyForm';
import Loader from '../../../shared/components/feedback/Loader';

const EditFacultyModal = ({ id, onClose }) => {
  const { data: faculty, isLoading, error } = useGetFacultyByIdQuery(id);
  const [updateFaculty] = useUpdateFacultyMutation();

  const handleSubmit = async (data) => {
    await updateFaculty({ id, ...data }).unwrap();
    toast.success('Faculty updated successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Edit Faculty</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        {isLoading ? <Loader /> : error ? (
          <p className="text-sm text-red-500">Failed to load faculty member.</p>
        ) : (
          <FacultyForm initialData={faculty} onSubmit={handleSubmit} onCancel={onClose} />
        )}
      </div>
    </div>
  );
};

export default EditFacultyModal;
