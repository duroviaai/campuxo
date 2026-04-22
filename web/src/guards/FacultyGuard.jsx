import { Outlet, Navigate } from 'react-router-dom';
import { useAuthContext } from '../app/providers/AuthProvider';
import ROUTES from '../app/routes/routeConstants';

const FacultyGuard = () => {
  const { token, user } = useAuthContext();

  if (!token) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!user?.roles?.includes('ROLE_FACULTY')) return <Navigate to={ROUTES.DASHBOARD} replace />;

  return <Outlet />;
};

export default FacultyGuard;
