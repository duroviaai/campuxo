import { Outlet, Navigate } from 'react-router-dom';
import { useAuthContext } from '../app/providers/AuthProvider';
import ROUTES from '../app/routes/routeConstants';

const ProfileCompletionGuard = () => {
  const { user } = useAuthContext();

  if (user?.profileComplete === false) {
    return <Navigate to={ROUTES.STUDENT_COMPLETE_PROFILE} replace />;
  }

  return <Outlet />;
};

export default ProfileCompletionGuard;
