import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../app/providers/AuthProvider';
import { isTokenExpired } from '../../shared/utils/tokenUtils';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthContext();
  const location  = useLocation();

  if (!token || isTokenExpired()) {
    return <Navigate to="/login?expired=1" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
