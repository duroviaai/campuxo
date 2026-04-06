import { useParams, useLocation, useNavigate } from 'react-router-dom';
import AttendanceSummaryView from '../../attendance/components/AttendanceSummaryView';
import ROUTES from '../../../app/routes/routeConstants';

const FacultyStudentAttendancePage = () => {
  const { studentId } = useParams();
  const { state }     = useLocation();
  const navigate      = useNavigate();
  const studentName   = state?.studentName ?? null;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(ROUTES.FACULTY_ATTENDANCE)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors text-sm"
        >
          ←
        </button>
      </div>
      <AttendanceSummaryView studentId={Number(studentId)} studentName={studentName} />
    </div>
  );
};

export default FacultyStudentAttendancePage;
