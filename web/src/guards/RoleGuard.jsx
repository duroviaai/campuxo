import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../app/providers/AuthProvider';
import ROUTES from '../app/routes/routeConstants';

const RoleGuard = ({ role, children }) => {
  const { user } = useAuthContext();
  return user?.roles?.includes(role)
    ? children
    : <Navigate to={ROUTES.DASHBOARD} replace />;
};

export default RoleGuard;
