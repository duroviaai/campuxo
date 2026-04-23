import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateMyProfile, createStudent } from '../services/studentService';
import { getUser, setUser } from '../../../shared/utils/tokenUtils';
import { useAuthContext } from '../../../app/providers/AuthProvider';
import { useGetProgramsQuery } from '../state/studentApi';
import ROUTES from '../../../app/routes/routeConstants';

const inputCls =
  'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white';

const STEPS = ['Personal Info', 'Academic Info', 'Review & Submit'];

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuthContext();
  const { data: programs = [] } = useGetProgramsQuery();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    department: '',
    yearOfStudy: '',
    courseStartYear: '',
    courseEndYear: '',
  });

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const next = (e) => {
    e.preventDefault();
    setError(null);
    setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      yearOfStudy: Number(form.yearOfStudy),
      courseStartYear: Number(form.courseStartYear),
      courseEndYear: Number(form.courseEndYear),
    };
    try {
      try {
        await createStudent(payload);
      } catch {
        await updateMyProfile(payload);
      }
      const stored = getUser();
      setUser({ ...stored, profileComplete: true });
      refreshUser();
      navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome, {user?.username}! Please fill in your details to continue.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${i < step ? 'bg-indigo-600 text-white' : i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-gray-100 text-gray-400'}`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-indigo-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`absolute hidden`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 mb-5">
            {error}
          </p>
        )}

        {/* Step 0 — Personal Info */}
        {step === 0 && (
          <form onSubmit={next} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  placeholder="John"
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="+91 9876543210"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className={inputCls}
              />
            </div>
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Sign out
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </form>
        )}

        {/* Step 1 — Academic Info */}
        {step === 1 && (
          <form onSubmit={next} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="">Select department</option>
                {programs.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">
                Year of Study <span className="text-red-500">*</span>
              </label>
              <select
                name="yearOfStudy"
                value={form.yearOfStudy}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="">Select year</option>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">
                Course Start Year <span className="text-red-500">*</span>
              </label>
              <select
                name="courseStartYear"
                value={form.courseStartYear}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="">Select year</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">
                Course End Year <span className="text-red-500">*</span>
              </label>
              <select
                name="courseEndYear"
                value={form.courseEndYear}
                onChange={handleChange}
                required
                className={inputCls}
              >
                <option value="">Select year</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={back}
                className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Next →
              </button>
            </div>
          </form>
        )}

        {/* Step 2 — Review */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 grid grid-cols-2 gap-4">
              {[
                ['First Name',        form.firstName],
                ['Last Name',         form.lastName || '—'],
                ['Phone',             form.phone],
                ['Date of Birth',     form.dateOfBirth],
                ['Department',        form.department],
                ['Year of Study',     form.yearOfStudy ? `Year ${form.yearOfStudy}` : ''],
                ['Course Start Year', form.courseStartYear],
                ['Course End Year',   form.courseEndYear],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                  <span className="text-sm text-gray-800">{value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center">
              You can update these details anytime from your profile page.
            </p>
            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={back}
                className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : 'Complete Profile ✓'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompleteProfilePage;
