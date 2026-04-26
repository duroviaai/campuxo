import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import useAuth from '../hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';

import { FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaExclamationCircle, FaExclamationTriangle } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

const inputCls = (hasError) =>
  `w-full rounded-lg border pl-9 pr-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
  }`;

const LoginPage = () => {
  const { loginUser, googleLoginUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';

  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const redirectByRole = (res) => {
    const roles = res.roles ?? [];
    if (roles.includes('ROLE_ADMIN')) navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
    else if (roles.includes('ROLE_FACULTY')) navigate(ROUTES.FACULTY_DASHBOARD, { replace: true });
    else navigate(res.profileComplete === false ? ROUTES.STUDENT_COMPLETE_PROFILE : ROUTES.STUDENT_DASHBOARD, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try { redirectByRole(await loginUser(form)); }
    catch (err) { setError(err?.response?.data?.message || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (t) => {
      setError(null); setLoading(true);
      try { redirectByRole(await googleLoginUser(t.access_token)); }
      catch (err) { setError(err?.response?.data?.message || 'Google sign-in failed.'); }
      finally { setLoading(false); }
    },
    onError: () => setError('Google sign-in failed.'),
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-8 py-10">

          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back to Campuxo</p>
          </div>

          {/* Session expired */}
          {sessionExpired && (
            <div className="flex items-center gap-2.5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
              <FaExclamationTriangle className="w-4 h-4 shrink-0" />
              Your session has expired. Please sign in again.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
              <FaExclamationCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Email address">
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                <input
                  type="email"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  placeholder="name@institution.edu"
                  className={inputCls(false)}
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={inputCls(false) + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-60"
          >
            <FaGoogle className="w-4 h-4 text-red-500" />
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <a href={ROUTES.REGISTER} className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Create account
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
