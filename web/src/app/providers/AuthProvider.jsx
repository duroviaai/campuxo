import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import authService from '../../services/authService';
import {
  setToken, getToken, setUser, getUser,
  clearAuth, isTokenExpired,
} from '../../shared/utils/tokenUtils';

export const AuthContext = createContext(null);

const SESSION_CHECK_MS = 60_000; // check every 60 s

export const AuthProvider = ({ children }) => {
  const [user, setUserState]   = useState(() => getUser());
  const [token, setTokenState] = useState(() => getToken());
  const timerRef               = useRef(null);

  const logout = useCallback((expired = false) => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
    if (timerRef.current) clearInterval(timerRef.current);
    // Navigate via hard redirect so the interceptor doesn't need router access
    const dest = expired ? '/login?expired=1' : '/login';
    if (window.location.pathname !== '/login') window.location.replace(dest);
  }, []);

  // Periodic expiry check
  useEffect(() => {
    if (!token) return;
    timerRef.current = setInterval(() => {
      if (isTokenExpired()) logout(true);
    }, SESSION_CHECK_MS);
    return () => clearInterval(timerRef.current);
  }, [token, logout]);

  // Also check immediately on mount (handles page refresh with stale token)
  useEffect(() => {
    if (token && isTokenExpired()) logout(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loginUser = async (data) => {
    const res = await authService.login(data);
    const userData = {
      username: res.username,
      email: res.email,
      roles: res.roles,
      profileComplete: res.profileComplete ?? true,
    };
    setToken(res.accessToken);
    setUser(userData);
    setTokenState(res.accessToken);
    setUserState(userData);
    return res;
  };

  const registerUser = (data) => authService.register(data);

  const isAdmin = () => user?.roles?.includes('ROLE_ADMIN');

  return (
    <AuthContext.Provider value={{ user, token, loginUser, registerUser, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
};
