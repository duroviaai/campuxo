import { Navigate } from 'react-router-dom';
import { getUser } from '../shared/utils/tokenUtils';
import ROUTES from '../app/routes/routeConstants';

const RoleGuard = ({ role, children }) => {
  const user = getUser();
  return user?.roles?.includes(role)
    ? children
    : <Navigate to={ROUTES.DASHBOARD} replace />;
};

export default RoleGuard;
