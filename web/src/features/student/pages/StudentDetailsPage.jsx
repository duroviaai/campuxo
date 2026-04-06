import { useParams } from 'react-router-dom';

const StudentDetailsPage = () => {
  const { id } = useParams();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
      <div className="bg-white rounded-xl shadow p-6 text-sm text-gray-500">
        Details for student #{id} coming soon.
      </div>
    </div>
  );
};

export default StudentDetailsPage;
