import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getUser, isTokenExpired } from '../shared/utils/tokenUtils';
import ROUTES from '../app/routes/routeConstants';

const GuestGuard = () => {
  const token = getToken();

  if (!token || isTokenExpired()) return <Outlet />;

  const roles = getUser()?.roles ?? [];

  if (roles.includes('ROLE_ADMIN'))   return <Navigate to={ROUTES.ADMIN_DASHBOARD}   replace />;
  if (roles.includes('ROLE_FACULTY')) return <Navigate to={ROUTES.FACULTY_DASHBOARD} replace />;
  return <Navigate to={ROUTES.STUDENT_DASHBOARD} replace />;
};

export default GuestGuard;
