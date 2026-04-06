const required = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return value;
};

const env = {
  API_BASE_URL: required('VITE_API_BASE_URL'),
  APP_NAME:     import.meta.env.VITE_APP_NAME     || 'CollegePortal',
  APP_VERSION:  import.meta.env.VITE_APP_VERSION  || '1.0.0',
  IS_DEV:       import.meta.env.DEV,
  IS_PROD:      import.meta.env.PROD,
};

export default env;
