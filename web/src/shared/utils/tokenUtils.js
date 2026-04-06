const TOKEN_KEY = 'token';
const USER_KEY  = 'user';

export const setToken   = (t) => localStorage.setItem(TOKEN_KEY, t);
export const getToken   = ()  => localStorage.getItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const setUser    = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u));
export const getUser    = ()  => { const u = localStorage.getItem(USER_KEY); return u ? JSON.parse(u) : null; };
export const removeUser  = () => localStorage.removeItem(USER_KEY);

/** Returns true if the JWT stored in localStorage is missing or expired. */
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds; Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const clearAuth = () => { removeToken(); removeUser(); };
