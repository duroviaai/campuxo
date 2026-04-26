import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateFacultyMutation } from '../state/facultyApi';
import FacultyForm from './FacultyForm';
import ROUTES from '../../../app/routes/routeConstants';

const CreateFacultyModal = ({ onClose }) => {
  const [createFaculty] = useCreateFacultyMutation();

  const handleSubmit = async (data) => {
    await createFaculty(data).unwrap();
    toast.success('Faculty created successfully');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Add Faculty</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <FacultyForm onSubmit={handleSubmit} onCancel={onClose} />
      </div>
    </div>
  );
};

export default CreateFacultyModal;
