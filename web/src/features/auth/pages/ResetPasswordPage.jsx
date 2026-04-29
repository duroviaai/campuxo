import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ROUTES from '../../../app/routes/routeConstants';

const inputCls = (err) =>
  `w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-white ${
    err ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-indigo-300'
  }`;

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/v1/auth/reset-password', { token, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.LOGIN, { replace: true }), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your new password below</p>
        </div>

        {success && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3 text-center">
            Password reset successfully. Redirecting to login…
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-center">
            {error}
          </p>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">
                New Password<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="password" name="newPassword" value={form.newPassword} onChange={handleChange}
                required minLength={8} placeholder="••••••••"
                className={inputCls(false)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">
                Confirm Password<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                required minLength={8} placeholder="••••••••"
                className={inputCls(form.confirmPassword && form.newPassword !== form.confirmPassword)}
              />
            </div>

            <button
              type="submit" disabled={loading || !token}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors shadow-sm mt-1"
            >
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
