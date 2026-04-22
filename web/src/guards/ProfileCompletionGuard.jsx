import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../app/providers/AuthProvider';
import ROUTES from '../app/routes/routeConstants';

/**
 * Wraps student routes. If the student's profile is not complete,
 * redirects to the complete-profile page (except when already there).
 */
const ProfileCompletionGuard = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  const isStudent = user?.roles?.includes('ROLE_STUDENT');
  const profileComplete = user?.profileComplete !== false; // default true for non-students

  if (isStudent && !profileComplete && location.pathname !== ROUTES.STUDENT_COMPLETE_PROFILE) {
    return <Navigate to={ROUTES.STUDENT_COMPLETE_PROFILE} replace />;
  }

  return <Outlet />;
};

export default ProfileCompletionGuard;
