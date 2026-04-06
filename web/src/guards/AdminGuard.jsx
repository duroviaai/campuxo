import { Outlet, Navigate } from 'react-router-dom';
import { useAuthContext } from '../app/providers/AuthProvider';
import { isTokenExpired } from '../shared/utils/tokenUtils';
import ROUTES from '../app/routes/routeConstants';

const AdminGuard = () => {
  const { token, user } = useAuthContext();

  if (!token || isTokenExpired()) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!user?.roles?.includes('ROLE_ADMIN')) return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;

  return <Outlet />;
};

export default AdminGuard;
