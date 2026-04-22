import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ROUTES from '../../../app/routes/routeConstants';

const inputCls = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white';

const LoginPage = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await loginUser(form);
      const roles = res.roles ?? [];
      if (roles.includes('ROLE_ADMIN')) {
        import('../../dashboard/pages/AdminDashboardPage');
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else if (roles.includes('ROLE_FACULTY')) {
        import('../../dashboard/pages/FacultyDashboardPage');
        navigate(ROUTES.FACULTY_DASHBOARD, { replace: true });
      } else {
        import('../../dashboard/pages/StudentDashboardPage');
        const dest = res.profileComplete === false
          ? ROUTES.STUDENT_COMPLETE_PROFILE
          : ROUTES.STUDENT_DASHBOARD;
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {sessionExpired && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 mb-5">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            Your session expired. Please sign in again.
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-5 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input
              type="email"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors shadow-sm mt-1"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-5">
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
