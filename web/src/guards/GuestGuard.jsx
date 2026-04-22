import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../app/providers/AuthProvider';
import ROUTES from '../app/routes/routeConstants';

const GuestGuard = () => {
  const { token, user } = useAuthContext();

  if (!token) return <Outlet />;

  const roles = user?.roles ?? [];

  if (roles.includes('ROLE_ADMIN'))   return <Navigate to={ROUTES.ADMIN_DASHBOARD}   replace />;
  if (roles.includes('ROLE_FACULTY')) return <Navigate to={ROUTES.FACULTY_DASHBOARD} replace />;
  return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
};

export default GuestGuard;
