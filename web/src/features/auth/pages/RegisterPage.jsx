import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const RegisterPage = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                required
                autoComplete={autoComplete}
                className={inputCls(fieldErrors[name])}
              />
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

        <p className="text-sm text-gray-500 text-center mt-5">
          Already have an account?{' '}
          <a href={ROUTES.LOGIN} className="text-indigo-600 hover:text-indigo-700 font-semibold">Sign in</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
