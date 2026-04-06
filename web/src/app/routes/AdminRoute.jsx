import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../../shared/utils/tokenUtils';

const AdminRoute = ({ children }) => {
  const token = getToken();
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.roles?.includes('ROLE_ADMIN')) return <Navigate to="/dashboard" replace />;
  return children;
};

export default AdminRoute;
