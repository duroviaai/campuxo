import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuth from '../hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';
import { validateForm } from '../../../shared/utils/validators';

const inputCls = (err) =>
  `w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white ${
    err ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-indigo-300'
  }`;

const FIELDS = [
  { name: 'username',        label: 'Username',         type: 'text',     autoComplete: 'username' },
  { name: 'email',           label: 'Email',            type: 'email',    autoComplete: 'email' },
  { name: 'password',        label: 'Password',         type: 'password', autoComplete: 'new-password' },
  { name: 'confirmPassword', label: 'Confirm Password', type: 'password', autoComplete: 'new-password' },
];

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const RegisterPage = () => {
  const { registerUser, googleLoginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ password: false, confirmPassword: false });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      setLoading(true);
      try {
        const res = await googleLoginUser(tokenResponse.access_token);
        navigate(res.profileComplete === false ? ROUTES.STUDENT_COMPLETE_PROFILE : ROUTES.STUDENT_DASHBOARD, { replace: true });
      } catch (err) {
        setError(err?.response?.data?.message || 'Google sign-in failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-in failed.'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    const validation = validateForm(form);
    if (!validation.isValid) { setFieldErrors(validation.errors); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await registerUser(payload);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => navigate(ROUTES.DASHBOARD), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed.');
      if (err.response?.data?.fieldErrors) setFieldErrors(err.response.data.fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">You can login with username or email</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-4 text-center">{error}</p>}
        {success && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {FIELDS.map(({ name, label, type, autoComplete }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">{label}<span className="text-red-500 ml-0.5">*</span></label>
              {type === 'password' ? (
                <div className="relative">
                  <input
                    type={showPasswords[name] ? 'text' : 'password'}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    autoComplete={autoComplete}
                    className={inputCls(fieldErrors[name]) + ' pr-10'}
                  />
                  <button type="button" onClick={() => setShowPasswords(v => ({ ...v, [name]: !v[name] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPasswords[name]
                      ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              ) : (
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  autoComplete={autoComplete}
                  className={inputCls(fieldErrors[name])}
                />
              )}
              {fieldErrors[name] && <p className="text-xs text-red-500">{fieldErrors[name]}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors shadow-sm mt-1"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-sm text-gray-500 text-center mt-5">
          Already have an account?{' '}
          <a href={ROUTES.LOGIN} className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
